
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

                    request.execute("SP_GetProductPriceApprovalsList", function (err, response) {
                        if (err) {
                            reject(
                                JSON.stringify(new exception(sender, err.message, err.name, err.stack))
                            );
                        } else {
                            var myResponse = JSON.stringify(response);

                            console.log("Crud myResponse: " + myResponse);

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
    GetProductPriceApprovalsList
}
