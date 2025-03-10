const express = require('express');
const ProductPriceApprovalsListProduct = express.Router();
const bodyParser = require('body-parser');
var modelRequest = require('../model/request-product-price-approvals-list-product');
var modelResponse = require('../model/response');
var switchProductApprovalsStateRequest = require('../model/request-switch-product-approvals-state');
const crud = require('../crud/product-price-approvals-list-product');
const fs = require('fs');
const path = require('path');
const sessionUtil = require('../utils/session')
const session = require('express-session');

ProductPriceApprovalsListProduct.get('/product-price-approvals-list-product-script', (req, res) => {
    const filePath = path.resolve(__dirname, '../controller/product-price-approvals-list-product.js');
    res.sendFile(filePath);
});
ProductPriceApprovalsListProduct.get('/utility-script', (req, res) => {
    const filePath = path.resolve(__dirname, '../utils/utility.js');
    res.sendFile(filePath);
});
ProductPriceApprovalsListProduct.get('/product-price-approvals-list-product/:IdApprovazione', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');

        req.session.user.OffsetRows = 0;
        req.session.save();

        var myRequest = new modelRequest(
            req.session.user.Id,
            req.session.user.LanguageContext,
            req.session.user.OffsetRows,
            req.session.user.NextRows,
            req.body.CodiceFornitore,
            req.body.CodiceArticolo,
            req.params.IdApprovazione
        );
        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetArticoliApprovazione(myRequest).then(listOf => {
            var data = JSON.parse(JSON.stringify(listOf));
            //res.status(200).json(
            //    new modelResponse('OK',
            //        JSON.parse(JSON.stringify(data["resultdata"])), null, data["rowscount"])
            //);
            res.status(200).render('product-price-approvals-list-product', {
                user: req.session.user,
                products: JSON.parse(data["resultdata"]),
                RowsCount: data["rowscount"],
                IdApprovazione: req.params.IdApprovazione
            });

        }).catch(err => {
            console.log('Errors: ' + err)
            res.status(200).json(new modelResponse('ERR', null, err));
        }).finally(() => {
        })
    }
});
ProductPriceApprovalsListProduct.post('/product-price-approvals-list-product/:IdApprovazione', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');

        if (req.session.user.OffsetRows < 0) {
            req.session.user.OffsetRows = 0;
        } else {
            req.session.user.OffsetRows = req.session.user.OffsetRows + req.session.user.NextRows;
        }

        var myRequest = new modelRequest(
            req.session.user.Id,
            req.session.user.LanguageContext,
            req.session.user.OffsetRows,
            req.session.user.NextRows,
            req.body.CodiceFornitore,
            req.body.CodiceArticolo,
            req.params.IdApprovazione
        );

        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetArticoliApprovazione(myRequest).then(listOf => {
            var data = JSON.parse(JSON.stringify(listOf));
            res.status(200).json(
                new modelResponse('OK', JSON.parse(data["resultdata"]), null, data["rowscount"], req.session.user)
            );

        }).catch(err => {
            console.log('Errors: ' + err)
            res.status(200).json(new modelResponse('ERR', null, err));

        }).finally(() => {
            //console.log("Code has been executed")
        })
    }
});
ProductPriceApprovalsListProduct.put('/switch-product-approvals-state/:IdApprovazioneArticolo', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');

        var myRequest = new switchProductApprovalsStateRequest(
            req.session.user.Id,
            req.params.IdApprovazioneArticolo,
            req.body.IdStatoApprovazione
        );
        /* Chiama la crud necessaria per il caricamento dei dati */
        crud.PutSwitchProductApprovalsState(myRequest).then(listOf => {
            res.status(200).json(
                new modelResponse('OK', JSON.parse(listOf), null, 0)
            );
        }).catch(err => {
            res.status(200).json(new modelResponse('ERR', null, err));
        }).finally(() => {

        });
    }
});

module.exports = ProductPriceApprovalsListProduct;