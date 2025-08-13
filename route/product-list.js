

/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/

const router     = require('express').Router();
const bodyParser = require('body-parser');
const fs         = require('fs');
const path       = require('path');
const session    = require('express-session');

/*
|--------------------------------------------------------------------------
| CUSTOM MODULES
|--------------------------------------------------------------------------
*/

const modelRequest = require('../model/request');
const productRequest = require('../model/product-list');
const buyerRequest = require('../model/request-buyer');
const fornitoreRequest = require('../model/request-fornitore');
const modelResponse = require('../model/response');
const crud = require('../crud/product-list');
const sessionUtil = require('../utils/session');
const ResponseModel = require('../models/response-model');

const {
  productListScript,
  utilityScript,
  validationScript,
  getAllProducts,
  getOneProductByCode,
  searchProducts
} = require('../controller/product-list-controller');

const userAuth = require('../middlewares/user-auth-middleware');
const { getUserSuppliers } = require('../controller/supplier-controller');
const { getUserCategories } = require('../controller/category-controller');

/*
|--------------------------------------------------------------------------
| MODULES EXPORTS
|--------------------------------------------------------------------------
*/

/*
router.get('/product-list-script', (req, res) => {
  const filePath = path.resolve(__dirname, '../controller/product-list.js');
  res.sendFile(filePath);
});*/

router.get('/product-list-script', productListScript);

/*
router.get('/utility-script', (req, res) => {
  const filePath = path.resolve(__dirname, '../utils/utility.js');
  res.sendFile(filePath);
});*/

router.get('/utility-script', utilityScript);

/*
router.get('/validation-script', (req, res) => {
  const filePath = path.resolve(__dirname, '../utils/validation.js');
  res.sendFile(filePath);
});*/

router.get('/validation-script', validationScript);

/*
router.get('/product-list', function (req, res) {
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

    // Chiama la crud necessaria per il caricamento degli articoli
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
});*/

router.get('/product-list', userAuth, getAllProducts);

/*
router.get('/product-list/:codicearticolo', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');
    var myRequest = new productRequest(
      req.session.user.Id,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      req.params.codicearticolo
    );

    // Chiama la crud necessaria per il caricamento del dettaglio dell'articolo
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
});*/

router.get('/product-list/:codicearticolo', userAuth, getOneProductByCode);

/*
router.post('/product-list', function (req, res) {
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
      req.body.IdStatoApprovazioneArticolo
    );

    // Chiama la crud necessaria per il caricamento degli articoli
    crud.GetArticoli(myRequest).then(listOf => {
      var data = JSON.parse(JSON.stringify(listOf));
      res.status(200).json(
        new modelResponse('OK', JSON.parse(data["resultdata"]), null, data["rowscount"], req.session.user)
      );
    }).catch(err => {
      res.status(200).json(new modelResponse('ERR', null, err));

    }).finally(() => {
      //console.log("Code has been executed")
    })
  } else {
    res.status(200).json(new modelResponse('ERR', null, "Session expired"));
  }
});*/

router.post('/product-list', userAuth, searchProducts);

router.post('/detect-price/:codicearticolo', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');
    var myRequest = new productRequest(
      req.session.user.Id,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      req.params.codicearticolo,
      req.body
    );
    crud.PostDetectPrice(myRequest).then(listOf => {
      res.status(200).json(
        new modelResponse('OK', JSON.parse(listOf), null)
      );
    }).catch(err => {
      console.log("err: " + err);
      console.log("err Message: " + JSON.parse(err).Message);
      res.status(200).json(new modelResponse('ERR', null, err));
    }).finally(() => {

    });
  }
});

router.post('/suggest-price/:codicearticolo', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');
    var myRequest = new productRequest(
      req.session.user.Id,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      req.params.codicearticolo,
      req.body
    );
    crud.PostSuggestPrice(myRequest).then(listOf => {
      res.status(200).json(
        new modelResponse('OK', JSON.parse(listOf), null)
      );
    }).catch(err => {
      console.log("err: " + err);
      console.log("err Message: " + JSON.parse(err).Message);
      res.status(200).json(new modelResponse('ERR', null, err));
    }).finally(() => {

    });
  }
});

router.get('/detect-price-history/:codicearticolo/:codicebrand', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');
    var myRequest = new productRequest(
      req.session.user.Id,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      req.params.codicearticolo,
      req.params.codicebrand
    );
    crud.GetDetectPriceHistory(myRequest).then(listOf => {
      console.log(listOf);
      res.status(200).json(
        new modelResponse('OK', JSON.parse(listOf), null)
      );
    }).catch(err => {
      res.status(200).json(new modelResponse('ERR', null, err));
    }).finally(() => {

    });
  }
});

/*
router.get('/buyer', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');
    var myRequest = new buyerRequest(
      req.session.user.Id
    );

    // Chiama la crud necessaria per il caricamento degli articoli
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
});*/

router.get('/buyer', userAuth, async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');

    const fakeData = [
      {
        attributes: { "diffgr:id": "Buyer1", "msdata:rowOrder": "0" },
        CodiceBuyer: "201",
        Nominativo: "Buyer Min Min"
      }
    ];

    res.status(200).json( new modelResponse('OK', fakeData, null));
  } catch (err) {
    console.log('Errors: ' + err.message)
    res.status(500).json(new modelResponse('ERR', null, err.message));
  }
});

/*
router.get('/fornitori/:CodiceBuyer', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');
    var myRequest = new fornitoreRequest(
      req.session.user.Id,
      req.params.CodiceBuyer
    );

    // Chiama la crud necessaria per il caricamento degli articoli
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
});*/

router.get('/fornitori/:CodiceBuyer', userAuth, getUserSuppliers);

router.get('/categoria/:CodiceBuyer', userAuth, getUserCategories);

module.exports = router;
