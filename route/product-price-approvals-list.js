const express = require('express');
const ProductPriceApprovalsList = express.Router();
const bodyParser = require('body-parser');
var productPriceApprovalsListRequest = require('../model/request');
var modelResponse = require('../model/response');
const crud = require('../crud/product-list');
const fs = require('fs');
const path = require('path');
const sessionUtil = require('../utils/session')
const session = require('express-session');

ProductPriceApprovalsList.get('/product-price-approvals-list-script', (req, res) => {
    const filePath = path.resolve(__dirname, '../controller/product-price-approvals-list.js');
    res.sendFile(filePath);
});
ProductPriceApprovalsList.get('/utility-script', (req, res) => {
    const filePath = path.resolve(__dirname, '../utils/utility.js');
    res.sendFile(filePath);
});
ProductPriceApprovalsList.get('/product-price-approvals-list', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');

        req.session.user.OffsetRows = 0;
        req.session.save();

        var productPriceApprovalsListRequest = new productPriceApprovalsListRequest(
            req.session.user.Id,
            req.session.user.LanguageContext,
            req.session.user.OffsetRows,
            req.session.user.NextRows,
        );
        /* Chiama la crud necessaria per il caricamento dei dati */
        crud.GetProductPriceApprovalsList(myRequest).then(listOf => {
            var data = JSON.parse(JSON.stringify(listOf));
            //res.status(200).json(
            //    new modelResponse('OK',
            //        JSON.parse(JSON.stringify(data["resultdata"])), null, data["rowscount"])
            //);
            res.status(200).render('product-list', {
                user: req.session.user,
                products: JSON.parse(data["resultdata"]),
                RowsCount: data["rowscount"]
            });

        }).catch(err => {
            console.log('Errors: ' + err)
            res.status(200).json(new modelResponse('ERR', null, err));
        }).finally(() => {
        })
    }
});

module.exports = ProductPriceApprovalsList;