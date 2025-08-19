

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

const ResponseModel = require('../models/response-model');
const connection = require('../config.db');

/*
|--------------------------------------------------------------------------
| MODULE UTILS
|--------------------------------------------------------------------------
*/

const findProductByCode = async (productCode, connectionPool, sqlDriver) => {
    const dbQuery = await connectionPool.request()
      .input('code', sqlDriver.NVarChar(), productCode)
      .query(`SELECT id FROM products WHERE code = @code`);

    return dbQuery.recordset.length ? dbQuery.recordset[0].id : null;
};

const updateProduct = async ({
  product_id, suggested_price, packaging_info, testing_info
}, connectionPool, sqlDriver) => {
  let dbQuery = await connectionPool.request()
    .input('id', sqlDriver.Int(), product_id)
    .query(`
      SELECT id, suggested_price, packaging_info, testing_info
      FROM products WHERE id = @id
    `);

  if (! dbQuery.recordset.length) {
    console.log('Product record not found in DB');
    return false;
  }

  const dbRecord = dbQuery.recordset[0];

  if (
    suggested_price == dbRecord.suggested_price &&
    packaging_info == dbRecord.packaging_info &&
    testing_info == dbRecord.testing_info
  ) {
    console.log('Product record still the same');
    return false;
  }

  let columns = [];

  dbQuery = await connectionPool.request()
    .input('id', sqlDriver.Int(), product_id);

  if (suggested_price && suggested_price != dbRecord.suggested_price) {
    dbQuery.input('suggested_price', sqlDriver.Decimal(18, 2), suggested_price);
    columns.push('suggested_price = @suggested_price');
  }

  if (! suggested_price) {
    columns.push('suggested_price = 0.00');
  }

  if (packaging_info && packaging_info != dbRecord.packaging_info) {
    dbQuery.input('packaging_info', sqlDriver.NText(), packaging_info);
    columns.push('packaging_info = @packaging_info');
  }

  if (! packaging_info) {
    columns.push('packaging_info = NULL');
  }

  if (testing_info && testing_info != dbRecord.testing_info) {
    dbQuery.input('testing_info', sqlDriver.NText(), testing_info);
    columns.push('testing_info = @testing_info');
  }

  if (! testing_info)  {
    columns.push('testing_info = NULL');
  }

  const queryStr = `UPDATE products SET ${columns.join(' , ')} WHERE id = @id`;

  const queryResult = await dbQuery.query(queryStr);

  return queryResult.rowsAffected.length > 0;
};

const insertProductPriceHistory = async ({ product_id, price, user_id }, connectionPool, sqlDriver) => {
  try {
    let dbQuery = await connectionPool.request()
      .input('product_id', sqlDriver.Int(), product_id)
      .query(`
        SELECT TOP 1
          CASE WHEN pph.price != p.suggested_price THEN 1 ELSE 0 END AS price_updated
        FROM product_price_histories pph
        JOIN products p ON pph.product_id = p.id
        WHERE pph.product_id = @product_id
        ORDER BY pph.id DESC
      `);

    const dbRecords = dbQuery.recordset.length && dbQuery.recordset;

    if (dbRecords && dbRecords[0].price_updated == 0) {
      console.log("Product's suggested_price attribute has not changed");
      return false;
    }

    dbQuery = await connectionPool.request()
      .input('product_id', sqlDriver.Int(), product_id)
      .input('created_by', sqlDriver.Int(), user_id)
      .query(`
        INSERT INTO product_price_histories (product_id, price, created_by)
        SELECT id AS product_id, suggested_price, @created_by AS created_by
        FROM products
        WHERE id = @product_id AND COALESCE(suggested_price,0) > 0;
        SELECT SCOPE_IDENTITY() as id
      `);

    if (dbQuery.recordset.length) {
      console.log("Product's suggested_price attribute has changed");
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

const updateCompetitorProduct = async ({
  product_id, competitor_product_id, price, note, url
}, connectionPool, sqlDriver) => {
  let dbQuery = await connectionPool.request()
    .input('id', sqlDriver.Int(), competitor_product_id)
    .input('product_id', sqlDriver.Int(), product_id)
    .query(`
      SELECT price, note, url
      FROM competitor_product
      WHERE id = @id AND product_id = @product_id
    `);

  if (! dbQuery.recordset.length) {
    console.log('CompetitorProduct record not found in DB');
    return false;
  }

  const dbRecord = dbQuery.recordset[0];

  if (price == dbRecord.price && note == dbRecord.note && url == dbRecord.url) {
    console.log('CompetitorProduct record still the same');
    return false;
  }

  dbQuery = await connectionPool.request()
    .input('id', sqlDriver.Int(), competitor_product_id)
    .input('price', sqlDriver.Decimal(18, 2), price)
    .input('note', sqlDriver.NText(), note)
    .input('url', sqlDriver.NText(), url)
    .query(`
      UPDATE competitor_product
      SET price = @price, note = @note, url = @url
      WHERE id = @id
    `);

  return dbQuery.rowsAffected.length > 0;
};

const insertCompetitorProductHistory = async ({ competitor_product_id, price, user_id }, connectionPool, sqlDriver) => {
  try {
    let dbQuery = await connectionPool.request()
      .input('competitor_product_id', sqlDriver.Int(), competitor_product_id)
      .query(`
        SELECT TOP 1
          CASE WHEN cph.price != cp.price THEN 1 ELSE 0 END AS price_updated
        FROM competitor_product_histories cph
        JOIN competitor_product cp ON cph.competitor_product_id = cp.id
        WHERE cph.competitor_product_id = @competitor_product_id
        ORDER BY cph.id DESC
      `);

    const dbRecords = dbQuery.recordset.length && dbQuery.recordset;

    if (dbRecords && dbRecords[0].price_updated == 0) {
      console.log("CompetitorProduct's price attribute has not changed");
      return false;
    }

    dbQuery = await connectionPool.request()
      .input('competitor_product_id', sqlDriver.Int(), competitor_product_id)
      .input('created_by', sqlDriver.Int(), user_id)
      .query(`
        INSERT INTO competitor_product_histories (competitor_product_id, price, created_by)
        SELECT id AS competitor_product_id, price, @created_by AS created_by
        FROM competitor_product
        WHERE id = @competitor_product_id AND COALESCE(price,0) > 0;
        SELECT SCOPE_IDENTITY() as id
      `);

    if (dbQuery.recordset.length) {
      console.log("CompetitorProduct's price attribute has changed");
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

const getProductPriceHistories = async ({ product_id }, connectionPool, sqlDriver) => {
    let dbQuery = await connectionPool.request()
      .input('product_id', sqlDriver.Int(), product_id)
      .query(`
        SELECT TOP 5
          pph.product_id,
          pph.price,
          pph.created_at
        FROM product_price_histories pph
        WHERE pph.product_id = @product_id
        ORDER BY pph.created_at DESC
      `);

    return dbQuery.recordset.length ? dbQuery.recordset : [];
};

const getCompetitorProductPriceHistories = async ({ product_id, competitor_id }, connectionPool, sqlDriver) => {
    let dbQuery = await connectionPool.request()
      .input('product_id', sqlDriver.Int(), product_id)
      .input('competitor_id', sqlDriver.Int(), competitor_id)
      .query(`
        SELECT TOP 5
          cp.product_id,
          cp.competitor_id,
          c.name AS competitor_name,
          cph.price,
          cph.created_at
        FROM competitor_product_histories cph
        JOIN competitor_product cp ON cph.competitor_product_id = cp.id
        JOIN competitors c ON cp.competitor_id = c.id
        WHERE cp.product_id = @product_id AND cp.competitor_id = @competitor_id
        ORDER BY cph.created_at DESC
      `);

    return dbQuery.recordset.length ? dbQuery.recordset : [];
};

/*
|--------------------------------------------------------------------------
| MODULE EXPORTS
|--------------------------------------------------------------------------
*/

const updateProductPrice = async (req, res) => {
  const { productCode }  = req.params;
  const { suggested_price, packaging_info, testing_info } = req.body || {};
  const competitor_price = req.body.competitor_price || [];
  const { Id: authUserId } = req.session.user || { Id: 1 };

  res.set('Access-Control-Allow-Origin', '*');

  if (! productCode || ! competitor_price.length) {
    res.status(400).json(new ResponseModel('ERR', null, 'Bad request'));
    return;
  }

  try {
    const pool = await sql.connect(connection);

    const product_id = await findProductByCode(productCode, pool, sql);

    if (! product_id) {
      res.status(404).json(new ResponseModel('ERR', null, 'Product not found'));
      return;
    }

    const productUpdated = await updateProduct({
      product_id,
      suggested_price: suggested_price || 0,
      packaging_info: packaging_info || null,
      testing_info: testing_info || null
    }, pool, sql);

    if (productUpdated) {
      await insertProductPriceHistory({ product_id, price: suggested_price, user_id: authUserId }, pool, sql);
    }

    for (const competitorProduct of competitor_price) {
      const recordUpdated = await updateCompetitorProduct({ product_id, ...competitorProduct }, pool, sql);

      if (recordUpdated) {
        console.log('CompetitorProduct record has been updated successfully');

        await insertCompetitorProductHistory({
          competitor_product_id: competitorProduct.competitor_product_id,
          price: competitorProduct.price,
          user_id: authUserId
        }, pool, sql);
      }
    }

    res.status(200).json(new ResponseModel('OK', null, null));
  } catch (err) {
    console.log(err.message);
    res.status(500).json(new ResponseModel('ERR', null, err.message));
  }
};

const getProductPriceHistory = async (req, res) => {
  const { productCode }  = req.params || {};

  res.set('Access-Control-Allow-Origin', '*');

  if (! productCode) {
    res.status(400).json(new ResponseModel('ERR', null, 'Bad request'));
    return;
  }

  try {
    const pool = await sql.connect(connection);

    const product_id = await findProductByCode(productCode, pool, sql);

    if (! product_id) {
      res.status(404).json(new ResponseModel('ERR', null, 'Product not found'));
      return;
    }

    const history = await getProductPriceHistories({ product_id }, pool, sql);

    res.status(200).json(new ResponseModel('OK', history, null));
  } catch (err) {
    console.log(err.message);
    res.status(500).json(new ResponseModel('ERR', null, err.message));
  }
};

const getCompetitorProductPriceHistory = async (req, res) => {
  const { productCode, competitorId, competitorName }  = req.params || {};

  res.set('Access-Control-Allow-Origin', '*');

  if (! productCode || ! competitorId) {
    res.status(400).json(new ResponseModel('ERR', null, 'Bad request'));
    return;
  }

  try {
    const pool = await sql.connect(connection);

    const product_id = await findProductByCode(productCode, pool, sql);

    if (! product_id) {
      res.status(404).json(new ResponseModel('ERR', null, 'Product not found'));
      return;
    }

    const history = await getCompetitorProductPriceHistories({
      product_id, competitor_id: competitorId
    }, pool, sql);

    res.status(200).json(new ResponseModel('OK', history, null));
  } catch (err) {
    console.log(err.message);
    res.status(500).json(new ResponseModel('ERR', null, err.message));
  }
};

module.exports = { updateProductPrice, getProductPriceHistory, getCompetitorProductPriceHistory };
