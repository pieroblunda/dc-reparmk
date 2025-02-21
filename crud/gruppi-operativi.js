
const express = require('express');
var exception = require('../model/exception');
const sql = require('mssql/msnodesqlv8');
const config = require('../utils/config')
var connection = require('../config.db');

function GetAttoreRisorse(myRequest) {

    const sender = arguments.callee.name;

    var myIdAttore = myRequest.IdAttore;
    var myIdAccount = myRequest.IdAccount;
    var myIdGruppoOperativo = myRequest.IdGruppoOperativo;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;

    const customPromise = new Promise((resolve, reject) => {
        try {
            sql.connect(connection, function (err) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    var request = new sql.Request();
                    request.query("SELECT * FROM [PS].[dbo].[VW_ATTORI_RISORSE] AR WHERE AR.IdAttore = " + myIdAttore, function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            /* response.params:
                                recordsets,
                                output,
                                rowsAffected
                            */
                            var myResponse = JSON.stringify(response);

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
function DeleteGruppoOperativo(myRequest) {

    const sender = arguments.callee.name;

    //console.log(myRequest);

    var myIdAttore = myRequest.IdAttore;
    var myIdAccount = myRequest.IdAccount;
    var myIdGruppoOperativo = myRequest.IdGruppoOperativo;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;
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

                    request.input('IdGruppoOperativo', sql.Int, parseInt(myIdGruppoOperativo));
                    request.output('Status', sql.NVarChar(500))

                    request.execute("SP_DeleteGruppoOperativo", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            if (response.output.Status == 'OK') {
                                resolve(JSON.stringify('OK'));
                            } else {
                                reject(
                                    new exception(sender, response.output, null, null)
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
function PostGruppoOperativo(myRequest) {

    const sender = arguments.callee.name;

    //console.log(myRequest);

    var myIdAttore = myRequest.IdAttore;
    var myIdAccount = myRequest.IdAccount;
    var myIdGruppoOperativo = myRequest.IdGruppoOperativo;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;
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

                    request.input('IdOwner', sql.Int, parseInt(myIdAttore));
                    request.input('IdGruppoOperativoParent', sql.Int, parseInt(myBody.IdGruppoOperativoParent));
                    request.input('Codice', sql.NVarChar(20), myBody.Codice);
                    request.input('Descrizione', sql.NVarChar(50), myBody.Descrizione);
                    request.input('Text_IT', sql.NVarChar(500), myBody.Text_IT);
                    request.input('Text_GB', sql.NVarChar(500), myBody.Text_GB);
                    request.input('Supervisor', sql.Int, parseInt(myBody.Supervisor));
                    request.input('IsPublic', sql.Bit, (myBody.IsPublic === "true"));
                    request.input('IsVisible', sql.Bit, (myBody.IsVisible === "true"));
                    request.output('Status', sql.NVarChar(2))

                    request.execute("SP_PostGruppoOperativo", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            if (response.output == 'OK') {
                                resolve(JSON.stringify('OK'));
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
function PutGruppoOperativo(myRequest) {

    const sender = arguments.callee.name;

    //console.log(myRequest);

    var myIdAttore = myRequest.IdAttore;
    var myIdAccount = myRequest.IdAccount;
    var myIdGruppoOperativo = myRequest.IdGruppoOperativo;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;
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

                    request.input('IdGruppoOperativo', sql.Int, parseInt(myIdGruppoOperativo));
                    request.input('Codice', sql.NVarChar(20), myBody.Codice);
                    request.input('Descrizione', sql.NVarChar(50), myBody.Descrizione);
                    request.input('Text_IT', sql.NVarChar(500), myBody.Text_IT);
                    request.input('Text_GB', sql.NVarChar(500), myBody.Text_GB);
                    request.input('Supervisor', sql.Int, parseInt(myBody.Supervisor));
                    request.input('IsPublic', sql.Bit, (myBody.IsPublic === "true"));
                    request.input('IsVisible', sql.Bit, (myBody.IsVisible === "true"));
                    request.output('Status', sql.NVarChar(2))

                    request.execute("SP_PutGruppoOperativo", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            /* response.params:
                                recordsets,
                                output,
                                rowsAffected
                            */
                            if (response.output == 'OK') {
                                resolve(JSON.stringify('OK'));
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
function GetGruppoOperativo(myRequest) {

    const sender = arguments.callee.name;

    var myIdAttore = myRequest.IdAttore;
    var myIdAccount = myRequest.IdAccount;
    var myIdGruppoOperativo = myRequest.IdGruppoOperativo;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;

    const customPromise = new Promise((resolve, reject) => {
        try {
            sql.connect(connection, function (err) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    var request = new sql.Request();
                    request.query("SELECT * FROM [PS].[dbo].[VW_GRUPPO_OPERATIVO] GO WHERE GO.IdGruppoOperativo = " + myIdGruppoOperativo, function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            /* response.params:
                                recordsets,
                                output,
                                rowsAffected
                            */
                            var myResponse = JSON.stringify(response);

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
function GetGruppiOperativi(myRequest) {

    const sender = arguments.callee.name;

    var myIdAttore = myRequest.IdAttore;
    var myIdAccount = myRequest.IdAccount;
    var myIdGruppoOperativo = myRequest.IdGruppoOperativo;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;

    const customPromise = new Promise((resolve, reject) => {
        try {
            sql.connect(connection, function (err) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    var request = new sql.Request();
                    var myWhere = " AND ISNULL(IsVisible, 0) = 1 AND IdGruppoOperativoParent ";
                    if (myIdGruppoOperativo != undefined) {
                        myWhere += " = " + myIdGruppoOperativo;
                    } else {
                        myWhere += " IS NULL";
                    }
                    request.query("SELECT GO.IdOwner, GO.IdGruppoOperativo, GO.IdGruppoOperativoParent, GO.Text_IT, GO.Text_GB, GO.Supervisor, GO.IsPublic, GO.IsVisible FROM [PS].[dbo].[TGruppiOperativi] GO WHERE GO.IdOwner = " + myIdAttore + myWhere, function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            /* response.params:
                                recordsets,
                                output,
                                rowsAffected
                            */
                            var myResponse = JSON.stringify(response);

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
function GetGruppiOperativiRoot(myRequest) {

    const sender = arguments.callee.name;

    var myIdAttore = myRequest.IdAttore;
    var myIdAccount = myRequest.IdAccount;
    var myIdGruppoOperativo = myRequest.IdGruppoOperativo;
    var myLanguageContext = myRequest.LanguageContext;
    var myOffsetRows = myRequest.OffsetRows;
    var myNextRows = myRequest.NextRows;

    const customPromise = new Promise((resolve, reject) => {
        try {
            sql.connect(connection, function (err) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    var request = new sql.Request();
                    request.input('IdGruppoOperativo', sql.Int, myIdGruppoOperativo)
                    request.execute("SP_GET_GRUPPI_OPERATIVI_TREE", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            var myResponse = JSON.stringify(response);

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
    GetGruppoOperativo,
    GetGruppiOperativi,
    GetGruppiOperativiRoot,
    GetAttoreRisorse,
    PutGruppoOperativo,
    PostGruppoOperativo,
    DeleteGruppoOperativo
}
