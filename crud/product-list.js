'use strict';

/*
|--------------------------------------------------------------------------
| Node Modules
|--------------------------------------------------------------------------
*/

const express = require('express');
const sql = require('mssql/msnodesqlv8');
const soap = require('soap');

/*
|--------------------------------------------------------------------------
| Custom Modules
|--------------------------------------------------------------------------
*/

const Exception = require('../model/exception');
const config = require('../utils/config')
const connection = require('../config.db');
const Mock = require('../model/mock.server.model.js');


function GetArticoli(myRequest) {

  if (Mock.isActive('products')) {
    const data = Mock.loadProductGetArticoliResponse();
    return Promise.resolve(data);
  }

  const sender = arguments.callee.name;

  //console.log(myRequest);

  var myIdAccount = myRequest.IdAccount;
  var myLanguageContext = myRequest.LanguageContext;
  var myOffsetRows = myRequest.OffsetRows;
  var myNextRows = myRequest.NextRows;
  var myCodiceFornitore = myRequest.CodiceFornitore;
  var myCodiceArticolo = myRequest.CodiceArticolo;
  var myIdStatoApprovazioneArticolo = myRequest.IdStatoApprovazioneArticolo;

  //console.log('myIdAccount: ' + myIdAccount);
  //console.log('myLanguageContext: ' + myLanguageContext);
  //console.log('myOffsetRows: ' + myOffsetRows);
  //console.log('myNextRows: ' + myNextRows);
  //console.log('myCodiceFornitore: ' + myCodiceFornitore);
  //console.log('myCodiceArticolo: ' + myCodiceArticolo);

  const customPromise = new Promise((resolve, reject) => {
    try {
      /* Crea l'istanza del Web Service Client */
      soap.createClient(config.SapWebServiceURL, function (err, client) {
        if (err) {
          reject(JSON.stringify(
            new Exception(sender, err.message, err.name, err.stack))
          );
        } else {
          /* Invoca il Web Service Method */
          client.GetArticoli({ myLanguageContext, myOffsetRows, myNextRows, myCodiceFornitore, myCodiceArticolo, myIdStatoApprovazioneArticolo }, function (err, result) {
            if (err) {
              reject(JSON.stringify(
                new Exception(sender, err.message, err.name, err.stack))
              );
            } else {

              //console.log("Crud result: " + JSON.stringify(result));

              var response = JSON.parse(JSON.stringify(result));
              var resultStatus = response.GetArticoliResult.Status;
              var resultError = response.GetArticoliResult.Error;

              /* Ottiene il numero totale dei record restiuiti dal Web Service */
              var resultRowsCount = eval(response.GetArticoliResult.RowsCount);

              if (resultStatus == "OK") {

                /* Inizializza i dati ricevuti dal Web Service */
                var resultData = response.GetArticoliResult.Result.diffgram.Data.Articolo;

                //console.log("Crud resultData: " + JSON.stringify(resultData));

                /* Valorizza l'oggetto restituito al route */
                resolve(
                  {
                    rowscount: resultRowsCount,
                    resultdata: JSON.stringify(resultData)
                  }
                );


              } else {
                reject(JSON.stringify(
                  new Exception(sender, resultError, sender, "internal error"))
                );
              }
            }
          });
        }
      });
    }
    catch (err) {
      reject(JSON.stringify(
        new Exception(sender, err.message, err.name, err.stack))
      );
    }
  });
  return customPromise
}

function GetArticoliById(myRequest) {

  if (Mock.isActive('products')) {
    const data = Mock.loadProductGetArticoliByIdResponse();
    return Promise.resolve(data);
  }

  const sender = arguments.callee.name;

  var myIdAccount = myRequest.IdAccount;
  var myLanguageContext = myRequest.LanguageContext;
  var myOffsetRows = myRequest.OffsetRows;
  var myNextRows = myRequest.NextRows;
  var myCodiceArticolo = myRequest.CodiceArticolo;

  const customPromise = new Promise((resolve, reject) => {
    try {
      /* Crea l'istanza del Web Service Client */
      soap.createClient(config.SapWebServiceURL, function (err, client) {
        if (err) {
          reject(JSON.stringify(
            new Exception(sender, err.message, err.name, err.stack))
          );
        } else {
          /* Invoca il Web Service Method */
          client.GetArticoliById({ myCodiceArticolo, myLanguageContext }, function (err, result) {
            if (err) {
              reject(JSON.stringify(
                new Exception(sender, err.message, err.name, err.stack))
              );
            } else {

              var response = JSON.parse(JSON.stringify(result));
              var resultStatus = response.GetArticoliByIdResult.Status;
              var resultError = response.GetArticoliByIdResult.Error;

              if (resultStatus == "OK") {

                /* Inizializza i dati ricevuti dal Web Service */
                var resultData = response.GetArticoliByIdResult.Result.diffgram.Data.Articolo;

                /* Valorizza l'oggetto restituito al route */
                resolve(
                  {
                    resultdata: JSON.stringify(resultData)
                  }
                );

              } else {
                reject(JSON.stringify(
                  new Exception(sender, resultError, sender, "internal error"))
                );
              }
            }
          });
        }
      });
    }
    catch (err) {
      reject(JSON.stringify(
        new Exception(sender, err.message, err.name, err.stack))
      );
    }
  });
  return customPromise
}

function GetBuyer(myRequest) {

  if (Mock.isActive()) {
    const data = Mock.loadProductGetBuyerResponse();
    return Promise.resolve(data);
  }

  const sender = arguments.callee.name;
  var myIdAccount = myRequest.IdAccount;

  const customPromise = new Promise((resolve, reject) => {
    try {
      /* Crea l'istanza del Web Service Client */
      soap.createClient(config.SapWebServiceURL, function (err, client) {
        if (err) {
          reject(JSON.stringify(
            new Exception(sender, err.message, err.name, err.stack))
          );
        } else {
          /* Invoca il Web Service Method */
          client.GetBuyer({}, function (err, result) {
            if (err) {
              reject(JSON.stringify(
                new Exception(sender, err.message, err.name, err.stack))
              );
            } else {

              var response = JSON.parse(JSON.stringify(result));
              var resultStatus = response.GetBuyerResult.Status;
              var resultError = response.GetBuyerResult.Error;

              if (resultStatus == "OK") {

                /* Inizializza i dati ricevuti dal Web Service */
                var resultData = response.GetBuyerResult.Result.diffgram.Data.Buyer;

                /* Valorizza l'oggetto restituito al route */
                resolve(JSON.stringify(resultData));

              } else {
                reject(JSON.stringify(
                  new Exception(sender, resultError, sender, "internal error"))
                );
              }
            }
          });
        }
      });
    }
    catch (err) {
      reject(JSON.stringify(
        new Exception(sender, err.message, err.name, err.stack))
      );
    }
  });
  return customPromise
}

function GetFornitori(myRequest) {

  if (Mock.isActive()) {
    const data = Mock.loadProductGetFornitoriResponse();
    return Promise.resolve(data);
  }

  const sender = arguments.callee.name;

  var myIdAccount = myRequest.IdAccount;
  var myCodiceBuyer = myRequest.CodiceBuyer;

  const customPromise = new Promise((resolve, reject) => {
    try {
      /* Crea l'istanza del Web Service Client */
      soap.createClient(config.SapWebServiceURL, function (err, client) {
        if (err) {
          reject(JSON.stringify(
            new Exception(sender, err.message, err.name, err.stack))
          );
        } else {
          /* Invoca il Web Service Method */
          client.GetFornitori({ myCodiceBuyer }, function (err, result) {
            if (err) {
              reject(JSON.stringify(
                new Exception(sender, err.message, err.name, err.stack))
              );
            } else {

              var response = JSON.parse(JSON.stringify(result));
              var resultStatus = response.GetFornitoriResult.Status;
              var resultError = response.GetFornitoriResult.Error;

              if (resultStatus == "OK") {

                /* Inizializza i dati ricevuti dal Web Service */
                var resultData = response.GetFornitoriResult.Result.diffgram.Data.Fornitore;

                /* Valorizza l'oggetto restituito al route */
                resolve(JSON.stringify(resultData));

              } else {
                reject(JSON.stringify(
                  new Exception(sender, resultError, sender, "internal error"))
                );
              }
            }
          });
        }
      });
    }
    catch (err) {
      reject(JSON.stringify(
        new Exception(sender, err.message, err.name, err.stack))
      );
    }
  });
  return customPromise
}

function PostDetectPrice(myRequest) {

  const sender = arguments.callee.name;

  //console.log(myRequest);

  var myIdAccount = myRequest.IdAccount;
  var myLanguageContext = myRequest.LanguageContext;
  var myOffsetRows = myRequest.OffsetRows;
  var myNextRows = myRequest.NextRows;
  var myCodiceArticolo = myRequest.CodiceArticolo;
  var myBody = myRequest.RequestBody;

  const customPromise = new Promise((resolve, reject) => {
    try {
      sql.connect(connection, function (err) {
        if (err) {
          reject(JSON.stringify(
            new Exception(sender, err.message, err.name, err.stack))
          );
        } else {

          var request = new sql.Request();

          request.input('CodiceArticolo', sql.NVarChar(50), myCodiceArticolo);
          request.input('CodiceBrand', sql.NVarChar(50), myBody.CodiceBrand);
          request.input('PrezzoFamily', sql.Decimal(18, 2), myBody.PrezzoFamily);
          request.input('PrezzoIlomo', sql.Decimal(18, 2), myBody.PrezzoIlomo);
          request.input('PrezzoSunlux', sql.Decimal(18, 2), myBody.PrezzoSunlux);
          request.input('PrezzoPapironia', sql.Decimal(18, 2), myBody.PrezzoPapironia);
          request.input('PrezzoScipioni', sql.Decimal(18, 2), myBody.PrezzoScipioni);
          request.input('PrezzoSacchettoDoro', sql.Decimal(18, 2), myBody.PrezzoSacchettoDoro);
          request.input('PrezzoMp', sql.Decimal(18, 2), myBody.PrezzoMp);
          request.input('PrezzoEurocom', sql.Decimal(18, 2), myBody.PrezzoEurocom);
          request.input('PrezzoModo', sql.Decimal(18, 2), myBody.PrezzoModo);
          request.input('PrezzoWynie', sql.Decimal(18, 2), myBody.PrezzoWynie);
          request.input('PrezzoEmBeauty', sql.Decimal(18, 2), myBody.PrezzoEmBeauty);
          request.input('PrezzoJ_E', sql.Decimal(18, 2), myBody.PrezzoJ_E);
          request.input('PrezzoTertio', sql.Decimal(18, 2), myBody.PrezzoTertio);

          request.input('NoteFamily', sql.NVarChar(10000), myBody.NoteFamily);
          request.input('NoteIlomo', sql.NVarChar(10000), myBody.NoteIlomo);
          request.input('NoteSunlux', sql.NVarChar(10000), myBody.NoteSunlux);
          request.input('NotePapironia', sql.NVarChar(10000), myBody.NotePapironia);
          request.input('NoteScipioni', sql.NVarChar(10000), myBody.NoteScipioni);
          request.input('NoteSacchettoDoro', sql.NVarChar(10000), myBody.NoteSacchettoDoro);
          request.input('NoteMp', sql.NVarChar(10000), myBody.NoteMp);
          request.input('NoteEurocom', sql.NVarChar(10000), myBody.NoteEurocom);
          request.input('NoteModo', sql.NVarChar(10000), myBody.NoteModo);
          request.input('NoteWynie', sql.NVarChar(10000), myBody.NoteWynie);
          request.input('NoteEmBeauty', sql.NVarChar(10000), myBody.NoteEmBeauty);
          request.input('NoteJ_E', sql.NVarChar(10000), myBody.NoteJ_E);
          request.input('NoteTertio', sql.NVarChar(10000), myBody.NoteTertio);

          request.input('URLFamily', sql.NVarChar(10000), myBody.UrlFamily);
          request.input('URLIlomo', sql.NVarChar(10000), myBody.UrlIlomo);
          request.input('URLSunlux', sql.NVarChar(10000), myBody.UrlSunlux);
          request.input('URLPapironia', sql.NVarChar(10000), myBody.UrlPapironia);
          request.input('URLScipioni', sql.NVarChar(10000), myBody.UrlScipioni);
          request.input('URLSacchettoDoro', sql.NVarChar(10000), myBody.UrlSacchettoDoro);
          request.input('URLMp', sql.NVarChar(10000), myBody.UrlMp);
          request.input('URLEurocom', sql.NVarChar(10000), myBody.UrlEurocom);
          request.input('URLModo', sql.NVarChar(10000), myBody.UrlModo);
          request.input('URLWynie', sql.NVarChar(10000), myBody.UrlWynie);
          request.input('URLEmBeauty', sql.NVarChar(10000), myBody.UrlEmBeauty);
          request.input('URLJ_E', sql.NVarChar(10000), myBody.UrlJ_E);
          request.input('URLTertio', sql.NVarChar(10000), myBody.UrlTertio);

          request.input('FirstOwner', sql.NVarChar(50), myIdAccount);
          request.input('Owner', sql.NVarChar(50), myIdAccount);
          request.output('Status', sql.NVarChar(500))

          request.execute("SP_PostDetectPrice", function (err, response) {
            if (err) {
              reject(
                JSON.stringify(new Exception(sender, err.message, err.name, err.stack))
              );
            } else {
              if (response.output.Status == 'OK') {
                resolve(JSON.stringify('OK'));
              } else {
                reject(
                  JSON.stringify(new Exception(sender, response.output, null, null))
                );
              }
            }
          });
        }
      })
    }
    catch (err) {
      reject(JSON.stringify(
        new Exception(sender, err.message, err.name, err.stack))
      );
    }
  });
  return customPromise
}

function PostSuggestPrice(myRequest) {

  const sender = arguments.callee.name;

  //console.log(myRequest);

  var myIdAccount = myRequest.IdAccount;
  var myLanguageContext = myRequest.LanguageContext;
  var myOffsetRows = myRequest.OffsetRows;
  var myNextRows = myRequest.NextRows;
  var myCodiceArticolo = myRequest.CodiceArticolo;
  var myBody = myRequest.RequestBody;

  const customPromise = new Promise((resolve, reject) => {
    try {
      sql.connect(connection, function (err) {
        if (err) {
          reject(JSON.stringify(
            new Exception(sender, err.message, err.name, err.stack))
          );
        } else {

          var request = new sql.Request();

          request.input('CodiceArticolo', sql.NVarChar(50), myBody.CodiceArticolo);
          request.input('PrezzoSuggerito', sql.Decimal(18, 2), myBody.PrezzoSuggerito);
          request.input('Note', sql.NVarChar(500), myBody.Note);
          request.input('IdBuyer', sql.NVarChar(50), myIdAccount);
          request.input('FirstOwner', sql.NVarChar(50), myIdAccount);
          request.input('Owner', sql.NVarChar(50), myIdAccount);
          request.output('Status', sql.NVarChar(500))

          request.execute("SP_PostSuggestPrice", function (err, response) {
            if (err) {
              reject(
                JSON.stringify(new Exception(sender, err.message, err.name, err.stack))
              );
            } else {
              if (response.output.Status == 'OK') {
                resolve(JSON.stringify('OK'));
              } else {
                reject(
                  JSON.stringify(new Exception(sender, response.output, null, null))
                );
              }
            }
          });
        }
      })
    }
    catch (err) {
      reject(JSON.stringify(
        new Exception(sender, err.message, err.name, err.stack))
      );
    }
  });
  return customPromise
}

function GetDetectPriceHistory(myRequest) {

  if (Mock.isActive()) {
    const data = Mock.loadGetDetectPriceHistoryResponse();
    return Promise.resolve(data);
  }

  const sender = arguments.callee.name;

  var myIdAccount = myRequest.IdAccount;
  var myLanguageContext = myRequest.LanguageContext;
  var myOffsetRows = myRequest.OffsetRows;
  var myNextRows = myRequest.NextRows;
  var myCodiceArticolo = myRequest.CodiceArticolo;
  var myCodiceBrand = myRequest.RequestBody;

  //console.log("myBody: " + JSON.stringify(myCodiceBrand));

  const customPromise = new Promise((resolve, reject) => {
    try {
      sql.connect(connection, function (err) {
        if (err) {
          reject(JSON.stringify(
            new Exception(sender, err.message, err.name, err.stack))
          );
        } else {
          var request = new sql.Request();
          request.input('CodiceArticolo', sql.NVarChar(50), myCodiceArticolo)
          request.input('CodiceBrand', sql.NVarChar(50), myCodiceBrand)

          request.execute("SP_DetectPriceHistory", function (err, response) {
            if (err) {
              reject(
                JSON.stringify(new Exception(sender, err.message, err.name, err.stack))
              );
            } else {
              var myResponse = JSON.stringify(response);

              //console.log("Crud myResponse: " + myResponse);

              if (JSON.parse(myResponse).recordset.length > 0) {

                var resultData = JSON.parse(myResponse).recordset;

                resolve(JSON.stringify(resultData));

              } else {
                resolve(JSON.stringify(""));
              }
            }
          });
        }
      })
    }
    catch (err) {
      reject(JSON.stringify(
        new Exception(sender, err.message, err.name, err.stack))
      );
    }
  });
  return customPromise
}

const getProducts = (request) => {
  if (Mock.isActive('products')) {
    const data = Mock.loadProductGetArticoliResponse();
    return Promise.resolve(data);
  }

  const sender = arguments.callee.name;

  const newRequest = {
    myLanguageContext             : request.LanguageContext,
    myOffsetRows                  : request.OffsetRows,
    myNextRows                    : request.NextRows,
    myCodiceFornitore             : request.CodiceFornitore,
    myCodiceArticolo              : request.CodiceArticolo,
    myIdStatoApprovazioneArticolo : request.IdStatoApprovazioneArticolo,
  };

  return new Promise((resolve, reject) => {
    try {
      soap.createClient(config.SapWebServiceURL, (err, client) => {
        if (err) {
          const excep = new Exception(sender, err.message, err.name, err.stack);
          reject(JSON.stringify(excep));
          return;
        }

        client.GetArticoli(newRequest, (err, result) => {
          if (err) {
            const excep = new Exception(sender, err.message, err.name, err.stack);
            reject(JSON.stringify(excep));
            return;
          }

          const response        = JSON.parse(JSON.stringify(result));
          const resultStatus    = response.GetArticoliResult.Status;
          const resultError     = response.GetArticoliResult.Error;
          const resultRowsCount = eval(response.GetArticoliResult.RowsCount);

          if (resultStatus != 'OK') {
            const excep = new Exception(sender, resultError, sender, 'internal error');
            reject(JSON.stringify(excep));
            return;
          }

          const resultData = response.GetArticoliResult.Result.diffgram.Data.Articolo;
          resolve({ rowscount: resultRowsCount, resultdata: JSON.stringify(resultData) });
        });
      });
    } catch (err) {
      const excep = new Exception(sender, err.message, err.name, err.stack);
      reject(JSON.stringify(excep));
      return;
    }
  });
}

const findProductById = (request) => {
  if (Mock.isActive('products')) {
    const data = Mock.loadProductGetArticoliByIdResponse();
    return Promise.resolve(data);
  }

  const sender = arguments.callee.name;

  const newRequest = {
    myLanguageContext : request.LanguageContext,
    myCodiceArticolo  : request.CodiceArticolo,
  };

  return new Promise((resolve, reject) => {
    try {
      soap.createClient(config.SapWebServiceURL, (err, client) => {
        if (err) {
          const excep = new Exception(sender, err.message, err.name, err.stack);
          reject(JSON.stringify(excep));
          return;
        }

        client.GetArticoliById(newRequest, (err, result) => {
          if (err) {
            const excep = new Exception(sender, err.message, err.name, err.stack);
            reject(JSON.stringify(excep));
            return;
          }

          const response = JSON.parse(JSON.stringify(result));
          const resultStatus = response.GetArticoliByIdResult.Status;
          const resultError = response.GetArticoliByIdResult.Error;

          if (resultStatus != 'OK') {
            const excep = new Exception(sender, resultError, sender, 'internal error');
            reject(JSON.stringify(excep));
            return;
          }

          const resultData = response.GetArticoliByIdResult.Result.diffgram.Data.Articolo;
          resolve( { resultdata: JSON.stringify(resultData) });
        });
      });
    } catch (err) {
      const excep =  new Exception(sender, err.message, err.name, err.stack);
      reject(JSON.stringify(excep));
    }
  });
}

module.exports = {
  GetArticoli,
  GetArticoliById,
  GetBuyer,
  GetFornitori,
  PostDetectPrice,
  PostSuggestPrice,
  GetDetectPriceHistory,
  getProducts,
  findProductById
}
