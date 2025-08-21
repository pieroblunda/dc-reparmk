/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/

const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

/*
|--------------------------------------------------------------------------
| CUSTOM MODULES
|--------------------------------------------------------------------------
*/

const BuyerRequestModel = require('../models/buyer-request-model');
const FornitoreRequestModel = require('../models/fornitore-request-model');
const ProductIndexRequest = require('../models/product-index-request');
const ProductListRequestModel = require('../models/product-list-request-model');
const RequestModel = require('../models/request-model');
const ResponseModel = require('../models/response-model');
const { getProducts, findProductById } = require('../crud/product-list');
const service = require('../services/soap');
const connection = require('../config.db');

/*
|--------------------------------------------------------------------------
| UTILS
|--------------------------------------------------------------------------
*/

const queryAll = async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');

    const pool = await sql.connect(connection);
    const queryStrign = `SELECT TOP (5) * FROM [Darwin].[dbo].[ReparMk] WHERE DataReport=(SELECT TOP (1) DataReport FROM [Darwin].[dbo].[ReparMk] ORDER BY DataReport DESC)`;
    const queryResult = await pool.request().query(queryStrign);
    console.log(queryResult);
    //const result = await getAllProducts();
    res.status(200).json(queryResult);
  } catch (err) {
    const response = new ResponseModel('ERR', null, err);
    res.status(500).json(response);
  }
}

const fetchProducts = async (
  {
    userId,
    languageContext,
    offsetRows = 0,
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
  const PER_PAGE = 25;

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

  const totalQuery = `
    ${baseCTE}
    select count(*) as total
    from sap_products sp
    join cte_products cte ON sp.id = cte.sap_product_id
    ${buildFilters()}
  `;

  const listQuery = `
    ${baseCTE}
    select sp.*
    from sap_products sp
    join cte_products cte on sp.id = cte.sap_product_id
    ${buildFilters()}
    order by sp.id
    offset @offset rows fetch next @limit rows only
  `;

  const totalItems = (await createRequest().query(totalQuery)).recordset[0]?.total || 0;

  let data = [];

  if (totalItems > 0) {
    data = (
      await createRequest()
        .input('offset', sqlDriver.Int(), offsetRows)
        .input('limit', sqlDriver.Int(), PER_PAGE)
        .query(listQuery)
    ).recordset;
  }

  const from        = offsetRows + 1;
  const to          = offsetRows + data.length;
  const hasNextPage = (totalItems - from) > PER_PAGE;
  const nextOffset  = hasNextPage ? to : null;

  return {
    data/* ,
    links: { prev: null, next: null } */,
    meta: {
      path: '/product-list',
      total: totalItems,
      per_page: PER_PAGE,
      from,
      to
    },
    pagination: {
      total: totalItems,
      per_page: PER_PAGE/* ,
      next_page_url: null,
      prev_page_url: null */,
      from,
      to,
      has_next_page: hasNextPage,
      next_offset: nextOffset
    }
  };
};

const fetchProductsFromService = async (requestParams, brandId) => {
  // const fetchSoap = await service.fetchProducts(requestParams);
  const fetchSoap = await getProducts(requestParams);
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
    const code = row.CodiceArticolo;

    productIdx[code] = idx;

    return code;
  }).join(',');

  const queryResult = await connectionPool.request()
    .input('product_code', sqlDriver.NText(), productCode)
    .query(`
      SELECT
        p.code AS product_code,
        p.suggested_price,
        p.packaging_info,
        p.testing_info,
        sq.competitor_product_id,
        sq.competitor_id,
        sq.product_id,
        sq.name AS competitor_name,
        sq.price,
        sq.note,
        sq.url
      FROM products p
      JOIN (
        SELECT
          cp.id AS competitor_product_id,
          cp.product_id,
          cp.competitor_id,
          c.name,
          cp.price,
          cp.note,
          cp.url
        FROM competitor_product cp
        JOIN competitors c ON cp.competitor_id = c.id
      ) sq ON p.id = sq.product_id
      WHERE p.code IN (SELECT value FROM STRING_SPLIT(@product_code, ','))
    `);

  if (! queryResult.recordset.length) {
    return products;
  }

  Array.from(queryResult.recordset).reduce((acc, row) => {
    const idx = productIdx[row.product_code];

    if (typeof idx === 'number') {
      if (! products[idx].hasOwnProperty('suggested_price')) {
        products[idx].suggested_price = row.suggested_price;
      }

      if (! products[idx].hasOwnProperty('packaging_info')) {
        products[idx].packaging_info = row.packaging_info;
      }

      if (! products[idx].hasOwnProperty('testing_info')) {
        products[idx].testing_info = row.testing_info;
      }

      const competitorProduct = {
        product_code          : row.product_code,
        competitor_product_id : row.competitor_product_id,
        competitor_id         : row.competitor_id,
        product_id            : row.product_id,
        competitor_name       : row.competitor_name,
        price                 : row.price,
        note                  : row.note,
        url                   : row.url
      };

      if (!products[idx].hasOwnProperty('competitor_prices')) {
        products[idx].competitor_prices = [];
      }

      products[idx].competitor_prices.push(competitorProduct);
    }

    return acc + 1;
  }, 1);

  return products;
}

/*
|--------------------------------------------------------------------------
| MODULE EXPORTS
|--------------------------------------------------------------------------
*/

const productListScript = (req, res) => {
  const filePath = path.resolve(__dirname, './product-list.js');
  res.sendFile(filePath);
}

const utilityScript = (req, res) => {
  const filePath = path.resolve(__dirname, '../utils/utility.js');
  res.sendFile(filePath);
}

const validationScript = (req, res) => {
  const filePath = path.resolve(__dirname, '../utils/validation.js');
  res.sendFile(filePath);
}

const getAllProducts = async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');

    const { Id: authUserId } = req.session.user;

    req.session.user.OffsetRows = 0;
    req.session.save();

    const pool = await sql.connect(connection);/*

    const queryResult = await pool.request()
      .input('user_id', sql.Int(), authUserId)
      .query(`
        SELECT b.code AS brand_code
        FROM brand_user bu
        JOIN brands b ON bu.brand_id = b.id
        WHERE bu.user_id = @user_id
      `);

    if (! queryResult.recordset.length) {
      res.status(200).render('product-list', {
        user: req.session.user,
        products: [],
        RowsCount: result.rowscount
      });

      return;
    }

    const brandId = Array.from(queryResult.recordset).map(row => row.brand_code);

    const request = new RequestModel(
      req.session.user.Id,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      req.body.CodiceFornitore,
      req.body.CodiceArticolo
    );

    const fetchResult = await fetchProductsFromService(request, brandId);*/

    const request = new ProductIndexRequest({
      userId           : req.session?.user?.Id,
      languageContext  : req.session?.user?.LanguageContext || false/* ,
      offsetRows       : req.body.offset_rows || false,
      supplierCode     : req.body.supplier_code || false,
      categoryCode     : req.body.category_code || false,
      productCode      : req.body.product_code || false,
      productName      : req.body.product_name || false,
      withPrice        : req.body.with_price || false,
      approvalStatusId : req.body.IdStatoApprovazioneArticolo || false */
    });

    const fetchResult = await fetchProducts(request, pool, sql);

    const products = await mapCompetitorsPricesForProducts(fetchResult.data, pool, sql);

    products.map(row => {
        row.PercentualeRicaricoCalcolata = 0;

        if (row.PrezzoListinoFornitore && row.PrezzoListinoBase) {
            row.PercentualeRicaricoCalcolata = ((row.PrezzoListinoBase - row.PrezzoListinoFornitore) / row.PrezzoListinoFornitore) * 100;
        }

        return row;
    });

    res.status(200).render('product-list', {
      user: req.session.user,
      products: products,
      RowsCount: products.length,
      total: fetchResult?.meta?.total || 0,
      has_next_page: fetchResult?.pagination?.has_next_page || false,
      next_rows: fetchResult?.pagination?.nextRows || 0,
      rows_count: fetchProducts?.pagination?.rowsCount || 0
    });
  } catch (err) {
    console.log('Errors: ' + err);
    res.redirect('/dashboard');
  }
}

const getOneProductByCode = async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');

    const request = new ProductListRequestModel(
      req.session.user.Id,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      req.params.codicearticolo
    );

    const fetchProduct = await findProductById(request);
    const result = JSON.parse(JSON.stringify(fetchProduct));
    const response = new ResponseModel('OK', result.resultdata, null);

    res.status(200).json(response);
  } catch (err) {
    const response = new ResponseModel('ERR', null, err);
    res.status(500).json(response);
  }
}

const searchProducts = async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');/*

    const { Id: authUserId } = req.session.user;

    if (req.session.user.OffsetRows < 0) {
      req.session.user.OffsetRows = 0;
    } else {
      req.session.user.OffsetRows = req.session.user.OffsetRows + req.session.user.NextRows;
    }*/

    const pool = await sql.connect(connection);/*

    const queryResult = await pool.request()
      .input('user_id', sql.Int(), authUserId)
      .query(`
        SELECT b.code AS brand_code
        FROM brand_user bu
        JOIN brands b ON bu.brand_id = b.id
        WHERE bu.user_id = @user_id
      `);

    if (queryResult.recordset.length === 0) {
      res.status(200).json(new ResponseModel('OK', [], null, 0, req.session.user));

      return;
    }

    const brandId = Array.from(queryResult.recordset).map(row => row.brand_code);

    const request = new RequestModel(
      req.session.user.Id,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      req.body.CodiceFornitore,
      req.body.CodiceArticolo,
      req.body.IdStatoApprovazioneArticolo
    );

    let fetchResult = await fetchProductsFromService(request, brandId);*/

    const request = new ProductIndexRequest({
      userId           : req.session?.user?.Id || req.body.user_id,
      languageContext  : req.session?.user?.LanguageContext || false,
      offsetRows       : req.body.offset_rows || false,
      supplierCode     : req.body.supplier_code || false,
      supplierCodeText : req.body.supplier_code_text || false,
      categoryCode     : req.body.category_code || false,
      productCode      : req.body.product_code || false,
      productName      : req.body.product_name || false,
      withPrice        : req.body.with_price || false,
      approvalStatusId : req.body.IdStatoApprovazioneArticolo || false
    });

    const fetchResult = await fetchProducts(request, pool, sql);

    const products = await mapCompetitorsPricesForProducts(fetchResult.data, pool, sql);

    products.map(row => {
        row.PercentualeRicaricoCalcolata = 0;

        if (row.PrezzoListinoFornitore && row.PrezzoListinoBase) {
            row.PercentualeRicaricoCalcolata = ((row.PrezzoListinoBase - row.PrezzoListinoFornitore) / row.PrezzoListinoFornitore) * 100;
        }

        row.PercentualeRicaricoSuggerito = 0;

        if (row.PrezzoListinoFornitore && row.PrezzoSuggerito) {
            row.PercentualeRicaricoSuggerito = ((row.PrezzoSuggerito - row.PrezzoListinoFornitore) / row.PrezzoListinoFornitore) * 100;
        }

        return row;
    });

    const response = {
      status     : 'OK',
      data       : products,
      error      : null,
      rowscount  : products.length,
      user       : req.session?.user,
      links      : fetchResult.links,
      meta       : fetchResult.meta,
      pagination : fetchResult.pagination
    };

    res.status(200).json(response);
  } catch (err) {
    console.log('Errors: ' + err);
    res.status(500).json(new ResponseModel('ERR', null, err));
  }
}

module.exports = {
  productListScript,
  utilityScript,
  validationScript,
  getAllProducts,
  getOneProductByCode,
  searchProducts,
  queryAll
};
