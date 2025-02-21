const express = require('express');
const config = require('../utils/config')
const dashboard = express.Router();
const bodyParser = require('body-parser');
const soap = require('soap');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sessionUtil = require('../utils/session')
const session = require('express-session');
//var response = require('../model/response');

// Define routes
dashboard.get('/dashboard-script', (req,res) => {
    const filePath = path.resolve(__dirname, '../controller/dashboard.js');
    res.sendFile(filePath);
});
dashboard.get('/dashboard', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.status(200).render('dashboard', {
            user: req.session.user
        });
    }
});

module.exports = dashboard;