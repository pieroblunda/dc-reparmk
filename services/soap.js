/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/

const express = require('express');
const soap    = require('soap');

/*
|--------------------------------------------------------------------------
| CUSTOM MODULES
|--------------------------------------------------------------------------
*/

const Exception  = require('../model/exception');
const config     = require('../utils/config')
const Mock       = require('../model/mock.server.model.js');

/*
|--------------------------------------------------------------------------
| MODULE EXPORTS
|--------------------------------------------------------------------------
*/

const fetchProducts = async (request) => {
  if (Mock.isActive('products')) {
    const data = Mock.loadProductGetArticoliResponse();
    return data;
  }

  const sender = 'services/soap.js -> fetchProducts';

  const newRequest = {
    myLanguageContext             : request.LanguageContext,
    myOffsetRows                  : request.OffsetRows,
    myNextRows                    : request.NextRows,
    myCodiceFornitore             : request.CodiceFornitore,
    myCodiceArticolo              : request.CodiceArticolo,
    myIdStatoApprovazioneArticolo : request.IdStatoApprovazioneArticolo,
  };

  try {
    const client = await new Promise((resolve, reject) => {
      soap.createClient(config.SapWebServiceURL, (err, client) => {
        if (err) {
          const excep = new Exception(sender, err.message, err.name, err.stack);
          reject(JSON.stringify(excep));
          return;
        }

        resolve(client);
      });
    });

    const result = await new Promise((resolve, reject) => {
      client.GetArticoli(newRequest, (err, result) => {
        if (err) {
          const excep = new Exception(sender, err.message, err.name, err.stack);
          reject(JSON.stringify(excep));
          return;
        }

        resolve(result);
      });
    });

    const response        = JSON.parse(JSON.stringify(result));
    const resultStatus    = response.GetArticoliResult.Status;
    const resultError     = response.GetArticoliResult.Error;
    const resultRowsCount = eval(response.GetArticoliResult.RowsCount);

    if (resultStatus !== 'OK') {
      const excep = new Exception(sender, resultError, sender, 'internal error');
      throw JSON.stringify(excep);
    }

    const resultData = response.GetArticoliResult.Result.diffgram.Data.Articolo;
    return { rowscount: resultRowsCount, resultdata: JSON.stringify(resultData) };
  } catch (err) {
    throw typeof err === 'string'
      ? err
      : JSON.stringify(new Exception(sender, err.message, err.name, err.stack));
  }
};

module.exports = { fetchProducts };
