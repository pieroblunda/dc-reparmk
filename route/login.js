

/*
|--------------------------------------------------------------------------
| Node Modules
|--------------------------------------------------------------------------
*/

const router = require('express').Router();
const bodyParser = require('body-parser');
const soap = require('soap');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

/*
|--------------------------------------------------------------------------
| Custom Modules
|--------------------------------------------------------------------------
*/

const config = require('../utils/config')
const sessionUtil = require('../utils/session')
const modelResponse = require('../model/response');
const modelLogin = require('../model/login');
const crud = require('../crud/login');
const { loginScript, renderLogin, postLogin } = require('../controller/login-controller');

/*
router.get('/login-script', (req, res) => {
  const filePath = path.resolve(__dirname, '../controller/login.js');
  res.sendFile(filePath);
});*/

router.get('/login-script', loginScript);

/*
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    //const htmlFile = 'view/login.html';
    //fs.stat(`./${htmlFile}`, (err, stats) => {
    //    if (stats) {
    //        res.statusCode = 200;
    //        res.setHeader('Content-Type', 'text/html');
    //        fs.createReadStream(htmlFile).pipe(res);
    //    }
    //});
    res.status(200).render('login');
  }
});*/

router.get('/login', renderLogin);

/*
router.post('/login', async (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.set('Access-Control-Allow-Origin', '*');
    var myLogin = new modelLogin(
      req.body.Userid,
      req.body.Password,
    );
    // Chiama la crud per la gestione del login
    crud.login(myLogin).then(listOf => {
      req.session.user = listOf;
      req.session.save();
      res.status(200).json(new modelResponse('OK', listOf, null));
    }).catch(err => {
      res.status(200).json(new modelResponse('ERR', null, err));
    }).finally(() => {
      //console.log("Code has been executed")
    })
  }
});*/

router.post('/login', postLogin);

module.exports = router;
