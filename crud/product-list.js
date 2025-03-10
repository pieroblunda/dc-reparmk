
const express = require('express');
var exception = require('../model/exception');
const sql = require('mssql/msnodesqlv8');
const config = require('../utils/config')
const soap = require('soap');
var connection = require('../config.db');

function GetArticoli(myRequest) {

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
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    /* Invoca il Web Service Method */
                    client.GetArticoli({ myLanguageContext, myOffsetRows, myNextRows, myCodiceFornitore, myCodiceArticolo, myIdStatoApprovazioneArticolo }, function (err, result) {
                        if (err) {
                            reject(JSON.stringify(
                                new exception(sender, err.message, err.name, err.stack))
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
                                    new exception(sender, resultError, sender, "internal error"))
                                );
                            }
                        }
                    });
                }
            });
        }
        catch (err) {
            reject(JSON.stringify(
                new exception(sender, err.message, err.name, err.stack))
            );
        }
    });
    return customPromise
}
function GetArticoliById(myRequest) {

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
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    /* Invoca il Web Service Method */
                    client.GetArticoliById({ myCodiceArticolo, myLanguageContext }, function (err, result) {
                        if (err) {
                            reject(JSON.stringify(
                                new exception(sender, err.message, err.name, err.stack))
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
                                    new exception(sender, resultError, sender, "internal error"))
                                );
                            }
                        }
                    });
                }
            });
        }
        catch (err) {
            reject(JSON.stringify(
                new exception(sender, err.message, err.name, err.stack))
            );
        }
    });
    return customPromise
}
function GetBuyer(myRequest) {

    const sender = arguments.callee.name;
    var myIdAccount = myRequest.IdAccount;

    const customPromise = new Promise((resolve, reject) => {
        try {
            /* Crea l'istanza del Web Service Client */
            soap.createClient(config.SapWebServiceURL, function (err, client) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    /* Invoca il Web Service Method */
                    client.GetBuyer({ }, function (err, result) {
                        if (err) {
                            reject(JSON.stringify(
                                new exception(sender, err.message, err.name, err.stack))
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
                                    new exception(sender, resultError, sender, "internal error"))
                                );
                            }
                        }
                    });
                }
            });
        }
        catch (err) {
            reject(JSON.stringify(
                new exception(sender, err.message, err.name, err.stack))
            );
        }
    });
    return customPromise
}
function GetFornitori(myRequest) {

    const sender = arguments.callee.name;

    var myIdAccount = myRequest.IdAccount;
    var myCodiceBuyer = myRequest.CodiceBuyer;

    const customPromise = new Promise((resolve, reject) => {
        try {
            /* Crea l'istanza del Web Service Client */
            soap.createClient(config.SapWebServiceURL, function (err, client) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    /* Invoca il Web Service Method */
                    client.GetFornitori({ myCodiceBuyer }, function (err, result) {
                        if (err) {
                            reject(JSON.stringify(
                                new exception(sender, err.message, err.name, err.stack))
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
                                    new exception(sender, resultError, sender, "internal error"))
                                );
                            }
                        }
                    });
                }
            });
        }
        catch (err) {
            reject(JSON.stringify(
                new exception(sender, err.message, err.name, err.stack))
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
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {

                    var request = new sql.Request();

                    request.input('CodiceArticolo', sql.NVarChar(50), myBody.CodiceArticolo);
                    request.input('PrezzoFamily', sql.Decimal(18,2), myBody.PrezzoFamily);
                    request.input('PrezzoIlomo', sql.Decimal(18,2), myBody.PrezzoIlomo);
                    request.input('PrezzoSunlux', sql.Decimal(18,2), myBody.PrezzoSunlux);
                    request.input('FirstOwner', sql.NVarChar(50), myIdAccount);
                    request.input('Owner', sql.NVarChar(50), myIdAccount);
                    request.output('Status', sql.NVarChar(500))

                    request.execute("SP_PostDetectPrice", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
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
                        new exception(sender, err.message, err.name, err.stack))
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
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
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
function GetDetectPriceHistory(myRequest) {

    const sender = arguments.callee.name;

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
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    var request = new sql.Request();
                    request.input('CodiceArticolo', sql.NVarChar(500), myCodiceArticolo)

                    request.execute("SP_DetectPriceHistory", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
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
                new exception(sender, err.message, err.name, err.stack))
            );
        }
    });
    return customPromise
}

module.exports = {
    GetArticoli,
    GetArticoliById,
    GetBuyer,
    GetFornitori,
    PostDetectPrice,
    PostSuggestPrice,
    GetDetectPriceHistory
}
