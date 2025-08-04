'use strict';

/*
|--------------------------------------------------------------------------
| Node Modules
|--------------------------------------------------------------------------
*/

const path = require('path');

/*
|--------------------------------------------------------------------------
| Custom Modules
|--------------------------------------------------------------------------
*/

const LoginModel = require('../models/login-model');
const ResponseModel = require('../models/response-model');
const { attempLogin } = require('../crud/login');


const loginScript = (req, res) => {
  const filePath = path.resolve(__dirname, './login.js');
  res.sendFile(filePath);
}

const renderLogin = (req, res) => {
  const { userAuthenticated } = req.session?.user || {};

  if (userAuthenticated) {
    return res.redirect('/dashboard');
  }

  res.status(200).render('login');
}

const postLogin = async (req, res) => {
  const { userAuthenticated } = req.session?.user || {};

  if (userAuthenticated) {
    return res.redirect('/dashboard');
  }

  try {
    res.set('Access-Control-Allow-Origin', '*');

    const creds = new LoginModel(req.body.Userid, req.body.Password);
    const user = { userAuthenticated: true, ...await attempLogin(creds)};

    req.session.user = user;
    req.session.save();

    res.status(200).json(new ResponseModel('OK', user, null));
  } catch (err) {
    console.log(err);
    res.status(500).json(new ResponseModel('ERR', null, err));
  }
}

module.exports = { loginScript, renderLogin, postLogin };
