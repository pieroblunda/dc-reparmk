

/*
|--------------------------------------------------------------------------
| Node Modules
|--------------------------------------------------------------------------
*/

const router = require('express').Router();

/*
|--------------------------------------------------------------------------
| Custom Modules
|--------------------------------------------------------------------------
*/

const {
  updateProductPrice,
  getProductPriceHistory,
  getCompetitorProductPriceHistory
} = require('../controller/product-price-controller');

const userAuth = require('../middlewares/user-auth-middleware');


router.put('/product-price/:productCode', userAuth, updateProductPrice);

router.get('/product-price-history/:productCode', userAuth, getProductPriceHistory);

router.get('/competitor-product-price-history/:productCode/:competitorId', userAuth, getCompetitorProductPriceHistory);

module.exports = router;
