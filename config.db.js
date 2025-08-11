/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/
const dotenv = require('dotenv');
dotenv.config();


const connection = {
  server   : process.env.DB_SERVER,
  port     : parseInt(process.env.DB_PORT),
  database : process.env.DB_NAME,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  options: {
    //trustedConnection: true, // Set to true if using Windows Authentication
    trustServerCertificate: true, // Set to true if using self-signed certificates
  },
/*   driver: 'msnodesqlv8', */ // Required if using Windows Authentication
};

module.exports = connection;
