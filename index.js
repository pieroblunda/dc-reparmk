const express = require('express');
const app = express();
app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');

const config = require('./utils/config')
const sessionUtil = require('./utils/session')
const session = require('express-session');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: config.SecretKey, // A secret key used to sign the session ID cookie
  resave: true, // Forces the session to be saved back to the session store
  saveUninitialized: false, // Forces a session that is "uninitialized" to be saved to the store
  cookie: {
      maxAge: 3600000, // Sets the cookie expiration time in milliseconds (1 hour = 3600000)
      httpOnly: false, // Reduces client-side script control over the cookie
      secure: false, // Ensures cookies are only sent over HTTPS
  }
}));

app.use('/', require('./route/init'));
app.use('/', require('./route/login'));
app.use('/', require('./route/logout'));
app.use('/', require('./route/dashboard'));
app.use('/', require('./route/gruppi-operativi'));
app.use('/', require('./route/product-price-approvals-list-product'));
app.use('/', require('./route/product-price-approvals-list'));
app.use('/', require('./route/product-list'));
app.use('/', require('./route/changePassword'));

app.use(express.static('public'));
app.get('/image', (req, res) => {
    const imagePath = __dirname + '/images';
    res.sendFile(imagePath);
});
app.get('/confirm-delete', function (req, res) {
    if (sessionUtil.verifyUser(req, res)) {
        res.status(200).sendFile(path.join(__dirname, "/view/confirm-delete.html"));
    }
});
app.get('/css', (req, res) => {
    const cssPath = __dirname + '/css';
    res.sendFile(cssPath);
});
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    if (sessionUtil.verifyUser(req, res)) {
        res.render('dashboard', {
            user: req.session.user
        });
    }
});
app.use(function (req, res, next) {
    res.status(404).sendFile(path.join(__dirname, "/view/404.html"));
});

const server = app.listen(5001, () => {
    console.log('Server running on port 5001');
});