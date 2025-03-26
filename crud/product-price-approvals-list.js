
const express = require('express');
var exception = require('../model/exception');
const sql = require('mssql/msnodesqlv8');
const config = require('../utils/config')
const soap = require('soap');
var connection = require('../config.db');
function GetProductPriceApprovalsList(myRequest) {

    const sender = arguments.callee.name;

    var myIdAccount = myRequest.IdAccount;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;
    var myIdStatoApprovazione = myRequest.IdStatoApprovazione;

    //console.log('myIdAccount: ' + myIdAccount);
    //console.log('myLanguageContext: ' + myLanguageContext);
    //console.log('myOffsetRows: ' + myOffsetRows);
    //console.log('myNextRows: ' + myNextRows);
    //console.log('myIdStatoApprovazione: ' + myIdStatoApprovazione);
    //console.log(myRequest);

    const customPromise = new Promise((resolve, reject) => {
        try {
            sql.connect(connection, function (err) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    var request = new sql.Request();

                    request.input('IdBuyer', sql.INT, myIdAccount)
                    request.input('IdStatoApprovazione', sql.INT, myIdStatoApprovazione)
                    request.input('OffsetRows', sql.INT, myOffsetRows)
                    request.input('NextRows', sql.INT, myNextRows)
                    request.output('RowsCount', sql.INT)

                    request.execute("SP_GetProductPriceApprovalsList", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            var myResponse = JSON.stringify(response);

                            //console.log("Crud myResponse: " + myResponse);
                            //console.log("Crud recordset.length: " + JSON.parse(myResponse).recordset.length)

                            if (JSON.parse(myResponse).recordset.length > 0) {

                                var resultData = JSON.parse(myResponse).recordset;

                                //console.log("Crud resultData: " + resultData);
                                //console.log("Crud output: " + JSON.parse(myResponse).output.RowsCount);

                                resolve(
                                    {
                                        rowscount: JSON.parse(myResponse).output.RowsCount,
                                        resultdata: JSON.stringify(resultData)
                                    }
                                );

                            } else {
                                resolve(
                                    {
                                        rowscount: 0,
                                        resultdata: null
                                    }
                                );
                            }
                        }
                    });
                }
            })
        }
        catch (err) {
            reject(JSON.stringify(
                new exception(sender, err.message, err.name, err.stack))
            );
        }
    });
    return customPromise
}
function PutSwitchApprovalsState(myRequest) {

    const sender = arguments.callee.name;

    var myIdAccount = myRequest.IdAccount;
    var myIdApprovazione = myRequest.IdApprovazione;
    var myIdStatoApprovazione = myRequest.IdStatoApprovazione;

    //console.log("myIdAccount: " + myIdAccount);
    //console.log("myIdApprovazione: " + myIdApprovazione);
    //console.log("myIdStatoApprovazione: " + myIdStatoApprovazione);

    const customPromise = new Promise((resolve, reject) => {
        try {
            sql.connect(connection, function (err) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {

                    var request = new sql.Request();

                    request.input('IdApprovazione', sql.Int, myIdApprovazione);
                    request.input('IdStatoApprovazione', sql.Int, myIdStatoApprovazione);
                    request.input('Owner', sql.NVarChar(50), myIdAccount);
                    request.output('Status', sql.NVarChar(2))

                    request.execute("SP_PutSwitchApprovalsState", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            //console.log("Crud response.output.Status: " + response.output.Status)
                            if (response.output.Status == 'OK') {
                                resolve(JSON.stringify('OK'));
                            } else {
                                reject(
                                    JSON.stringify(new exception(sender, response.output, null, null))
                                );
                            }
                        }
                    });
                }
            })
        }
        catch (err) {
            reject(JSON.stringify(
                new exception(sender, err.message, err.name, err.stack))
            );
        }
    });
    return customPromise
}
function GetProductPriceApprovalsListExcel(myRequest) {

    const sender = arguments.callee.name;

    /* Valorizza i parametri richiesti dal Web Service */
    var myLanguageContext = myRequest.LanguageContext;
    var myIdApprovazione = myRequest.IdApprovazione

    const customPromise = new Promise((resolve, reject) => {
        try {
            /* Crea l'istanza del Client Web Service */
            soap.createClient(config.SapWebServiceURL, function (err, client) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    /* Invoca il metodo del Web Service */
                    client.GetProductPriceApprovalsListExcel({ myLanguageContext, myIdApprovazione }, function (err, result) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {

                            /* Codifica l'oggetto restituito dal Web Service */
                            var response = JSON.parse(JSON.stringify(result));

                            /* Ottiene la proprietà {Status} */
                            var resultStatus = response.GetProductPriceApprovalsListExcelResult.Status;

                            /* Ottiene la descrizione dell'eventuale errore restituito */
                            var resultError = response.GetProductPriceApprovalsListExcelResult.Error;

                            /* Ottiene il numero totale dei record restiuiti dal Web Service */
                            var resultRowsCount = eval(response.GetProductPriceApprovalsListExcelResult.RowsCount);

                            if (resultStatus == "OK") {

                                /* Inizializza i dati ricevuti dal Web Service */
                                var resultData = response.GetProductPriceApprovalsListExcelResult.Result.diffgram.Data.Anomalia;

                                /* Valorizza l'oggetto da restituire al Route */
                                resolve(
                                    {
                                        rowscount: resultRowsCount,
                                        resultdata: JSON.stringify(resultData)
                                    }
                                );

                            } else {
                                reject(
                                    JSON.stringify(new exception(sender, resultError, sender, "internal error"))
                                );
                            }
                        }
                    });
                }
            });
        }
        catch (err) {
            reject(
                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
            );
        }
    });
    return customPromise
}

module.exports = {
    GetProductPriceApprovalsList,
    PutSwitchApprovalsState,
    GetProductPriceApprovalsListExcel
}
