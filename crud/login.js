
const express = require('express');
var exception = require('../model/exception');
const sql = require('mssql/msnodesqlv8');
const config = require('../utils/config')
var connection = require('../config.db');

function login(myLogin) {

    const sender = arguments.callee.name;

    var myUserid = myLogin.Userid;
    var myPassword = myLogin.Password;

    const customPromise = new Promise((resolve, reject) => {
        try {
            sql.connect(connection, function (err) {
                if (err) {
                    reject(JSON.stringify(
                        new exception(sender, err.message, err.name, err.stack))
                    );
                } else {
                    var request = new sql.Request();
                    request.query("SELECT A.Id, A.Username, A.Nominativo, A.Ruolo, A.Codice FROM [dbo].[Login] A WHERE A.Username = '" + myUserid + "' AND A.Password = '" + myPassword + "'", function (err, response) {
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

                                var resultData = JSON.parse(myResponse).recordset[0];

                                /* Imposta il language applicativo */
                                var languageContext = config.LanguageContext;

                                if (resultData.LanguageContext != undefined) {
                                    languageContext = resultData.LanguageContext;
                                }
                                /* Valorizza l'oggetto restituito al route */
                                const user = {
                                    Id: resultData.Id,
                                    Username: resultData.Username,
                                    Nominativo: resultData.Nominativo,
                                    Ruolo: resultData.Ruolo,
                                    Codice: resultData.Codice,
                                    LanguageContext: languageContext,
                                    OffsetRows: config.OffsetRows,
                                    NextRows: config.NextRows

                                };
                                resolve(JSON.stringify(user));

                            } else {
                                reject(JSON.stringify(
                                    new exception(sender, "Unauthorized user", sender, "internal error"))
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
module.exports = {
    login,
}
