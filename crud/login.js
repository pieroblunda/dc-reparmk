
const express = require('express');
var exception = require('../model/exception');
const sql = require('mssql/msnodesqlv8');
const config = require('../utils/config')
var connection = require('../config.db');
const Mock = require('../model/mock.server.model.js');

function login(myLogin) {

    if(Mock.isActive()) {
        const data = Mock.loadLoginResponse();
        return Promise.resolve(data);
    }

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
                    request.query("SELECT (SELECT STRING_AGG(CONVERT(varchar(MAX), Username) , ',') FROM [dbo].[Login] WHERE Ruolo = 'SUPERVISOR') AS Supervisor, A.Id, A.Username, A.Nominativo, A.Ruolo, A.Codice FROM [dbo].[Login] A WHERE A.Username = '" + myUserid + "' AND A.Password = '" + myPassword + "'", function (err, response) {
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
                                let user = {
                                    Id: resultData.Id,
                                    Username: resultData.Username,
                                    Nominativo: resultData.Nominativo,
                                    Ruolo: resultData.Ruolo,
                                    Codice: resultData.Codice,
                                    Supervisor: resultData.Supervisor,
                                    LanguageContext: languageContext,
                                    OffsetRows: config.OffsetRows,
                                    NextRows: config.NextRows
                                };
                                resolve(user);

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
