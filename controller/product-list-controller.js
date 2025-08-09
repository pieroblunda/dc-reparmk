'use strict';

/*
|--------------------------------------------------------------------------
| Node Modules
|--------------------------------------------------------------------------
*/

const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

/*
|--------------------------------------------------------------------------
| Custom Modules
|--------------------------------------------------------------------------
*/

const BuyerRequestModel = require('../models/buyer-request-model');
const FornitoreRequestModel = require('../models/fornitore-request-model');
const ProductListRequestModel = require('../models/product-list-request-model');
const RequestModel = require('../models/request-model');
const ResponseModel = require('../models/response-model');
const { getProducts, findProductById } = require('../crud/product-list');
const connection = require('../config.db');


const fetchProducts = async (requestParams, brandId) => {
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
    const code = row.CodiceArticolo.trim();

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
        product_code: row.product_code,
        competitor_product_id: row.competitor_product_id,
        competitor_id: row.competitor_id,
        product_id: row.product_id,
        competitor_name: row.competitor_name,
        price: row.price,
        note: row.note,
        url: row.url
      };

      products[idx].competitor_prices.push(competitorProduct);
    }

    return acc + 1;
  }, 1);

  return products;
}

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

    const pool = await sql.connect(connection);

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

    let fetchResult = await fetchProducts(request, brandId);
    let products    = await mapCompetitorsPricesForProducts(fetchResult, pool, sql);

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
      RowsCount: products.length
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
    res.set('Access-Control-Allow-Origin', '*');

    const { Id: authUserId } = req.session.user;

    if (req.session.user.OffsetRows < 0) {
      req.session.user.OffsetRows = 0;
    } else {
      req.session.user.OffsetRows = req.session.user.OffsetRows + req.session.user.NextRows;
    }

    const pool = await sql.connect(connection);

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

    let fetchResult = await fetchProducts(request, brandId);
    let products    = await mapCompetitorsPricesForProducts(fetchResult, pool, sql);

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

    res.status(200).json(new ResponseModel('OK', products, null, products.length, req.session.user));
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
  searchProducts
};
