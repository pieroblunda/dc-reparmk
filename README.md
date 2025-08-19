# dc-it-web-app-monitor-rilevamento-prezzi

## Architecture

![Senza-architettura](https://github.com/user-attachments/assets/bec55523-85c8-41cc-8868-612f741abfc6)


## Dependencies
* [Driver - SQL Server Express Edition](https://www.microsoft.com/en-us/download/details.aspx?id=104781)
* VPN to access to Company WLAN
* NodeJs v18.20.8

## Install
```
$ git clone git@github.com:dcgroupitalia/dc-it-web-app-monitor-rilevamento-prezzi.git
$ npm install
$ npm run start
```

## Environment variables
| Variable | Range | Dsc  |
|---|---|---|
| USE_MOCK | [0 \| 1] | Describes if System should use mocked data for internal database |
| USE_MOCK_PRODUCTS | [0 \| 1] | Describes if System should use mocked data for reading products from external database |
| DB_SERVER | String | IP SERVER used in the database connection string |
| DB_PORT | Integer | Port where DB is listening |
| DB_NAME | String | Database name |
| DB_USER | String | User used in the database connection string |
| DB_PASSWORD | String | Password for the DB connection in config.db.js |

## Database
Run the script in order
```
scripts/1.db_price_tracking_monitor.sql
scripts/2.insert_soap_products.sql
scripts/3.insert_base_records.sql
scripts/4.insert_product_related_records.sql
```

## User test
> [!WARNING]
> ToDo

## Run app
```
Server running on port 5001

Open http://localhost:5001/
```

## Debugging
```
$ npm run debug
```

## External Libraries

| Library | Dsc  |
|---|---|
| [exceljs](https://www.npmjs.com/package/exceljs) | Build a file excel to download |
| []() | Bootstrap Iconset | |
| [bootstrapcdn](https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css) | CSS Layout framework | 

## CDN Immagini
To serve the images app calls the nodejs express server that reads the images directly from the `//192.168.0.141/as-f/scambio/FOTODC_AGENTI` folder.
Read more information in the [static-images application](https://github.com/dcgroupitalia/static-images)

```HTML
<!-- usage example -->
<img src="http://192.168.0.232:3005/images/0004987.jpg">
```