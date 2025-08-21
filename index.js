const dotenv       = require('dotenv');
const express      = require('express');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const cors         = require('cors');
const path         = require('path');
const ProductsController = require('./server/controller/product.server.controller.js');
dotenv.config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/queryAll', ProductsController);
app.use((req, res, next) => res.status(404).json({error: '404 - Page not found'}));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});