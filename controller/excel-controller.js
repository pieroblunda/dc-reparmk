/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/

const fs         = require('fs');
const path       = require('path');
const sql        = require('mssql/msnodesqlv8');
const ExcelJS    = require('exceljs');
const nodemailer = require('nodemailer');

/*
|--------------------------------------------------------------------------
| CUSTOM MODULES
|--------------------------------------------------------------------------
*/

const connection              = require('../config.db');
const config                  = require('../utils/config');
const service                 = require('../services/soap');
const ProductListRequestModel = require('../models/product-list-request-model');
const RequestModel            = require('../models/request-model');
const ResponseModel           = require('../models/response-model');
const ProductIndexRequest     = require('../models/product-index-request');

/*
|--------------------------------------------------------------------------
| UTILS
|--------------------------------------------------------------------------
*/

const fetchProducts = async (
  {
    userId,
    languageContext,
    supplierCode,
    supplierCodeText,
    categoryCode,
    productCode,
    productName,
    withPrice,
    approvalStatusId
  },
  connectionPool,
  sqlDriver
) => {
  const buildCTEJoins = () => {
    let joins = [];

    if (supplierCode || supplierCodeText) {
      joins.push(
        'join product_supplier ps on p.id = ps.product_id',
        'join suppliers s on ps.supplier_id = s.id'
      );
    }

    if (categoryCode) {
      joins.push(
        'join category_product cp on p.id = cp.product_id',
        'join categories ca on cp.category_id = ca.id'
      )
    }

    if (withPrice === 'competitor_price') {
      joins.push(
        `
          join (
            select distinct cmp.product_id
            from competitor_product cmp
            where coalesce(cmp.price,0) > 0
          ) cp2 on p.id = cp2.product_id
        `
      )
    }

    return joins.length ? joins.join(' ') : '';
  };

  const buildCTEConditions = () => {
    let conditions = ['cu.user_id = @user_id'];

    if (supplierCode) {
      conditions.push(`(s.code = @supplier_code or s.code like '%' + @supplier_code + '%')`);
    }

    if (supplierCodeText) {
      conditions.push(`(s.code = @supplier_code_text or s.code like '%' + @supplier_code_text + '%')`);
    }

    if (categoryCode) {
      conditions.push('ca.code = @category_code');
    }

    if (productCode) {
      conditions.push(`(p.code = @product_code or p.code like '%' + @product_code + '%')`);
    }

    if (withPrice === 'suggested_price') {
        conditions.push('coalesce(p.suggested_price,0) > 0');
    }

    if (approvalStatusId) {
      // conditions.push("sp.approval_status_id = @approval_status_id");
    }

    return ` where ${conditions.join(' AND ')} `;
  }

  const baseCTE = `
    with cte_products as (
      select distinct p.sap_product_id
      from products p
      join company_user cu ON p.company_id = cu.company_id
      ${buildCTEJoins()}
      ${buildCTEConditions()}
    )
  `;

  const buildFilters = () => {
    let conditions = [];

    if (productName) {
      conditions.push(`sp.Denominazione like '%' + @product_name + '%'`);
    }

    return conditions.length ? ` where ${conditions.join(' AND ')}` : '';
  };

  const createRequest = () => {
    let req = connectionPool.request().input('user_id', sqlDriver.Int(), userId);

    if (supplierCode) {
      req.input('supplier_code', sqlDriver.VarChar(), supplierCode);
    }

    if (supplierCodeText) {
      req.input('supplier_code_text', sqlDriver.VarChar(), supplierCodeText);
    }

    if (categoryCode) {
      req.input('category_code', sqlDriver.VarChar(), categoryCode);
    }

    if (productCode) {
      req.input('product_code', sqlDriver.VarChar(), productCode);
    }

    if (productName) {
      req.input('product_name', sqlDriver.VarChar(), productName);
    }

    if (approvalStatusId) {
      // req.input("approval_status_id", sqlDriver.Int(), approvalStatusId);
    }

    return req;
  };

  const getCompetitorsSql = `
    select
        concat('competitor_', id, '_', rtrim(ltrim(lower(replace(name, ' ', '_'))))) as colName
    from competitors
    order by name
  `;

  const competitors = (await connectionPool.request().query(getCompetitorsSql)).recordset;

  const colList = competitors.map(row => `[${row.colName}]`).join(', ');

  const listQuery = `
    ${baseCTE}
    select
      sp.*,
      nullif(pt.suggested_price, 0.00) as suggested_price,
      iif(sp.PrezzoListinoFornitore > 0
        AND coalesce(pt.suggested_price, 0) > 0,
        cast(((pt.suggested_price - sp.PrezzoListinoFornitore) / sp.PrezzoListinoFornitore) * 100 as decimal(18,2)),
        null
      ) as new_ric,
      ${competitors.map(c => `nullif(pt.${c.colName}, 0.00) as ${c.colName}`).join(', ')}
    from sap_products sp
    join cte_products cte on sp.id = cte.sap_product_id
    left join (
      select
        sap_product_id,
        suggested_price,
        ${competitors.map(c => `[${c.colName}] as ${c.colName}`).join(', ')}
      from (
        select
          p.sap_product_id,
          p.suggested_price,
          concat_ws('_', 'competitor', c.id, rtrim(ltrim(lower(replace(c.name, ' ', '_'))))) as competitor_name,
          cp.price
        from products p
        left join competitor_product cp on p.id = cp.product_id
        left join competitors c on cp.competitor_id = c.id
      ) as source
      pivot (
        max(price)
        for competitor_name in (${colList})
      ) as pvt
    ) pt on sp.id = pt.sap_product_id
    ${buildFilters()}
    order by sp.id
  `;

  return (await createRequest().query(listQuery)).recordset;
};

const fetchProductsFromService = async (requestParams, brandId) => {
  const fetchSoap = await service.fetchProducts(requestParams);
  const result = JSON.parse(JSON.stringify(fetchSoap));

  return Array.from(JSON.parse(result.resultdata))
    .filter(row => brandId.includes(row.CodiceBrand))
    .map(row => {
      row.competitor_prices = [];
      return row;
    });
}

const mapCompetitorsPricesForProducts = async (products, connectionPool, sqlDriver) => {
  let productIdx = {};

  const productCode = products.map((row, idx) => {
    const code = row.CodiceArticolo.trim();

    productIdx[code] = idx;

    return code;
  }).join(',');

  return products;
}

/**
 * @param {*} connectionPool
 * @param {*} sqlDriver
 * @returns {Array}
 */
const getColumns = async (connectionPool, sqlDriver) => {
  let colunmsConfig = [
      { header: 'ART FORN', key: 'CodiceFornitore', width: 20 },
      { header: 'FORNITORE', key: 'RagioneSocialeFornitore', width: 35 },
      { header: 'COD ART', key: 'CodiceArticolo', width: 15 },
      { header: 'DESCRIZIONE', key: 'Denominazione', width: 60 },
      { header: 'COD EAN', key: 'CodiceBarre', width: 20 },
      { header: 'CATEGORIA', key: 'DescrizioneCategoria', width: 25 },
      { header: 'COD DC CASA', key: 'CodiceProduttore', width: 25 },
      { header: 'GRUPPO MECEOLOGICO', key: 'Gamma', width: 25 },/*
      { header: 'STATO', key: 'averiguar3', width: 25 },*/
      { header: 'PREZZO LIS FORN', key: 'PrezzoListinoFornitore', width: 25 },
      { header: 'PREZZO LIS FORN CIF', key: 'PrezzoListinoFornitore', width: 25 },
      { header: 'PREZZO LS', key: 'PrezzoListinoBase', width: 25 },
      { header: 'LISTINO', key: 'LineaProdotto', width: 25 },
      { header: 'RIC LS', key: 'PercentualeRicarico', width: 25 },
      { header: 'PREZZO SUGGERITO LS', key: 'suggested_price', width: 25 },
      { header: 'NEW RICARICO', key: 'new_ric', width: 25 },
      // { header: 'Brand', key: 'DescrizioneBrand', width: 20 },
      // { header: 'Codice Categoria', key: 'CodiceCategoria', width: 18 },
      // { header: 'Categoria', key: 'DescrizioneCategoria', width: 25 },
      // { header: 'Codice Fornitore', key: 'CodiceFornitore', width: 20 },
      // { header: 'Prezzo Suggerito', key: 'PrezzoSuggerito', width: 16 },
      // { header: 'Prezzo Tertio', key: 'PrezzoTertio', width: 16 },
      // { header: 'Percentuale Sconto', key: 'PercentualeSconto', width: 10 },
      // { header: 'Prezzo Base Dc Group', key: 'PrezzoListinoBase', width: 20 },
      // { header: 'Percentuale Ricarico', key: 'PercentualeRicarico', width: 20 },
      // { header: 'Gamma', key: 'Gamma', width: 10 },
      // { header: 'Media vendita', key: 'MediaVendita', width: 15 },
      // { header: 'Stato', key: 'Stato', width: 15 },
      // { header: 'Note', key: 'Note', width: 50 },
    ];

  const getCompetitorsSql = `
    select
        concat('competitor_', id, '_', rtrim(ltrim(lower(replace(name, ' ', '_'))))) as colName,
        concat('PREZZO ', upper(rtrim(ltrim(name)))) as colLabel
    from competitors
    order by name
  `;

  const competitors = (await connectionPool.request().query(getCompetitorsSql)).recordset;

  for (const row of competitors) {
    colunmsConfig.push({ header: row.colLabel, key: row.colName, width: 20 });
  }

  return colunmsConfig;
};

const fillWorksheet = async (worksheet, columns, rows) => {
  worksheet.columns = columns;

  if (Array.isArray(rows)) {
    rows.forEach(item => worksheet.addRow(item));
  } else {
    worksheet.addRow(rows);
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber == 1) {
      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'd4d0d8' },
        };

        cell.font = { bold: true };
      });
    }

    row.commit();
  });

  return worksheet;
};


/*
|--------------------------------------------------------------------------
| MODULE EXPORTS
|--------------------------------------------------------------------------
*/

const downloadExcel = async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');

    const { Id: authUserId } = req.session.user;

    req.session.user.OffsetRows = 0;
    req.session.save();

    const pool = await sql.connect(connection);

    // await fetchCompetitorPivot(pool, sql);
    // return;

    const request = new ProductIndexRequest({
      userId           : req.session?.user?.Id,
      languageContext  : req.session?.user?.LanguageContext || false,
      supplierCode     : req.body.supplier_code || false,
      supplierCodeText : req.body.supplier_code_text || false,
      categoryCode     : req.body.category_code || false,
      productCode      : req.body.product_code || false,
      productName      : req.body.product_name || false,
      withPrice        : req.body.with_price || false,
      approvalStatusId : req.body.IdStatoApprovazioneArticolo || false
    });

    const fetchResult = await fetchProducts(request, pool, sql);

    if (! fetchResult.length) {
      res.status(404).json(new ResponseModel('ERR', null, null, 0, req.session.user));

      return;
    }

    const workbook = new ExcelJS.Workbook();

    let worksheet = workbook.addWorksheet('Anomalie Giacenze');

    const columns = await getColumns(pool, sql);

    worksheet = await fillWorksheet(worksheet, columns, fetchResult);

    const today = new Date().toISOString().slice(0, 10).replace('-', '').replace('-', '');

    res.setHeader('Content-Disposition', 'attachment; filename=new_RichiestaApprovazione_' + today + '.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.log('Errors: ' + err);
    res.redirect('/dashboard');
  }
};

module.exports = { downloadExcel };
