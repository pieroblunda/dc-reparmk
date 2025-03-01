const express = require('express');
const ProductList = express.Router();
const bodyParser = require('body-parser');
var modelRequest = require('../model/request');
var productRequest = require('../model/product-list');
var buyerRequest = require('../model/request-buyer');
var fornitoreRequest = require('../model/request-fornitore');
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
ProductList.get('/utility-script', (req, res) => {
    const filePath = path.resolve(__dirname, '../utils/utility.js');
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
            req.body.CodiceFornitore,
            req.body.CodiceArticolo
        );
        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetArticoli(myRequest).then(listOf => {
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
ProductList.get('/product-list/:codicearticolo', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');

        req.session.user.OffsetRows = 0;
        req.session.save();

        var myRequest = new productRequest(
            req.session.user.Id,
            req.session.user.LanguageContext,
            req.session.user.OffsetRows,
            req.session.user.NextRows,
            req.params.codicearticolo
        );
        /* Chiama la crud necessaria per il caricamento del dettaglio dell'articolo */
        crud.GetArticoliById(myRequest).then(listOf => {
            var data = JSON.parse(JSON.stringify(listOf));
            res.status(200).json(
                new modelResponse('OK',
                    JSON.parse(JSON.stringify(data["resultdata"])), null)
            );
        }).catch(err => {
            res.status(200).json(new modelResponse('ERR', null, err));
        }).finally(() => {
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
            req.body.CodiceFornitore,
            req.body.CodiceArticolo
        );

        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetArticoli(myRequest).then(listOf => {

            var data = JSON.parse(JSON.stringify(listOf));
            //res.status(200).json(
            //    new modelResponse('OK',
            //        JSON.parse(JSON.stringify(data["resultdata"])), null, data["rowscount"])
            //);

            console.log("Controller resultdata: " + data["resultdata"]);
            console.log("Controller rowscount: " + data["rowscount"]);

            res.status(200).json(
                new modelResponse('OK', JSON.parse(data["resultdata"]), null, data["rowscount"])
            );

        }).catch(err => {
            console.log('Errors: ' + err)
            res.status(200).json(new modelResponse('ERR', null, err));

        }).finally(() => {
            //console.log("Code has been executed")
        })
    }
});
ProductList.get('/buyer', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');
        var myRequest = new buyerRequest(
            req.session.user.Id
        );

        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetBuyer(myRequest).then(listOf => {
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
ProductList.get('/fornitori/:CodiceBuyer', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.set('Access-Control-Allow-Origin', '*');
        var myRequest = new fornitoreRequest(
            req.session.user.Id,
            req.params.CodiceBuyer
        );
        console.log(myRequest);
        /* Chiama la crud necessaria per il caricamento degli articoli */
        crud.GetFornitori(myRequest).then(listOf => {
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