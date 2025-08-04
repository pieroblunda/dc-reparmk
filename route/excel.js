'use strict';

/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/

const router     = require('express').Router();

/*
|--------------------------------------------------------------------------
| CUSTOM MODULES
|--------------------------------------------------------------------------
*/

const userAuth = require('../middlewares/user-auth-middleware');
const { downloadExcel } = require('../controller/excel-controller');

/*
|--------------------------------------------------------------------------
| MODULE EXPORTS
|--------------------------------------------------------------------------
*/

router.post('/download-excel', userAuth, downloadExcel);

module.exports = router;
