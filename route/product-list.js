const express = require('express');
const ProductList = express.Router();
const bodyParser = require('body-parser');
var modelRequest = require('../model/request');
var modelResponse = require('../model/response');
const crud = require('../crud/product-list');
const fs = require('fs');
const path = require('path');
const sessionUtil = require('../utils/session')
const session = require('express-session');

ProductList.get('/product-list-script', (req, res) => {
    const filePath = path.resolve(__dirname, '../controller/product-list.js');
    res.sendFile(filePath);
});
ProductList.get('/product-list', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');

        req.session.user.OffsetRows = 0;
        req.session.save();

        var myRequest = new modelRequest(
            req.session.user.Id,
            req.session.user.LanguageContext,
            req.session.user.OffsetRows,
            req.session.user.NextRows,
        );
        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetArticoliRecommended(myRequest).then(listOf => {
            console.log(JSON.parse(listOf));
            res.status(200).render('product-list', {
                user: req.session.user,
                products: JSON.parse(listOf)
            });
            //res.status(200).json(new response('OK', listOf, null));
        }).catch(err => {
            console.log('Errors: ' + err)
            res.status(200).json(new modelResponse('ERR', null, err));
        }).finally(() => {
            //console.log("Code has been executed")
        })
    }
});
ProductList.post('/product-list', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');

        req.session.user.OffsetRows = req.session.user.OffsetRows + req.session.user.NextRows;
        req.session.save();

        var myRequest = new modelRequest(
            req.session.user.Id,
            req.session.user.LanguageContext,
            req.session.user.OffsetRows,
            req.session.user.NextRows,
        );

        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetArticoliRecommended(myRequest).then(listOf => {
            res.status(200).json(
                new modelResponse('OK', JSON.parse(listOf), null)
            );

        }).catch(err => {
            console.log('Errors: ' + err)
            res.status(200).json(new modelResponse('ERR', null, err));

        }).finally(() => {
            //console.log("Code has been executed")
        })
    }
});

module.exports = ProductList;