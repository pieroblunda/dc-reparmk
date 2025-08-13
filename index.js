/*
|--------------------------------------------------------------------------
| Node Modules
|--------------------------------------------------------------------------
*/

const dotenv       = require('dotenv');
const express      = require('express');
const session      = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const cors         = require('cors');
const path         = require('path');
const fs           = require('fs');

dotenv.config();

/*
|--------------------------------------------------------------------------
| Custom Modules
|--------------------------------------------------------------------------
*/

const config = require('./utils/config');

const initRoutes                             = require('./route/init');
const loginRoutes                            = require('./route/login');
const logoutRoutes                           = require('./route/logout');
const dashboardRoutes                        = require('./route/dashboard');
const gruppiOperativiRoutes                  = require('./route/gruppi-operativi');
const productPriceApprovalsListProductRoutes = require('./route/product-price-approvals-list-product');
const productPriceApprovalsListRoutes        = require('./route/product-price-approvals-list');
const productListRoutes                      = require('./route/product-list');
const productPriceRoutes                     = require('./route/product-price');
const changePasswordRoutes                   = require('./route/changePassword');
const ExcelRoutes                            = require('./route/excel');
const userAuth                               = require('./middlewares/user-auth-middleware');

/*
|--------------------------------------------------------------------------
| Express App Init
|--------------------------------------------------------------------------
*/

const app = express();

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

app.use(express.static('public'));
app.use(express.static(__dirname));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/view');

const PORT = 5001;

(async () => {
  try {
    app.use(initRoutes);
    app.use(loginRoutes);
    app.use(logoutRoutes);
    app.use(dashboardRoutes);
    app.use(gruppiOperativiRoutes);
    app.use(productPriceApprovalsListProductRoutes);
    app.use(productPriceApprovalsListRoutes);
    app.use(productListRoutes);
    app.use(productPriceRoutes);
    app.use(changePasswordRoutes);
    app.use(ExcelRoutes);

    app.get('/image', (req, res) => {
      const imagePath = __dirname + '/images';
      res.sendFile(imagePath);
    });

    app.get('/confirm-delete', userAuth, (req, res) => {
      res.status(200).sendFile(path.join(__dirname, '/view/confirm-delete.html'));
    });

    app.get('/css', (req, res) => {
      const cssPath = __dirname + '/css';
      res.sendFile(cssPath);
    });

    app.get('/', userAuth, (req, res) => {
      res.redirect('/dashboard');
    });

    app.use((req, res, next) => res.status(404).sendFile(path.join(__dirname, '/view/404.html')));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(typeof parseInt(process.env.USE_MOCK), parseInt(process.env.USE_MOCK));
    });
  } catch (err) {
    console.log('Failed to start the server', err);
  }
})();
