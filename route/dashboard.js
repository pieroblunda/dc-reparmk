const config = require('../utils/config')
const router = require('express').Router();
const bodyParser = require('body-parser');
const soap = require('soap');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sessionUtil = require('../utils/session')
const session = require('express-session');
const userAuth = require('../middlewares/user-auth-middleware');
const { dashboardScript, renderDasboard } = require('../controller/dashboard-controller');
//var response = require('../model/response');

// Define routes
/*
router.get('/dashboard-script', (req,res) => {
    const filePath = path.resolve(__dirname, '../controller/dashboard.js');
    res.sendFile(filePath);
});*/

router.get('/dashboard-script', dashboardScript);

/*
router.get('/dashboard', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.status(200).render('dashboard', {
            user: req.session.user
        });
    }
});*/

router.get('/dashboard', userAuth, renderDasboard);

module.exports = router;
