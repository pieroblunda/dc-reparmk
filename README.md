# dc-it-web-app-monitor-rilevamento-prezzi

## Architecture

![Senza-architettura](https://github.com/user-attachments/assets/bec55523-85c8-41cc-8868-612f741abfc6)

## File Host
```
192.168.0.232 dc.net.web.service
192.168.0.232 dc.app.monitor.giacenze
192.168.0.232 dc.app.rilevamento.prezzi
192.168.0.232 cdn.dcgroup
```

## Dependencies

* [Driver - SQL Server Express Edition](https://www.microsoft.com/en-us/download/details.aspx?id=104781)
* Repository [dc-net-web-service](https://github.com/dcgroupitalia/dc-net-web-service)
* VPN to access to Company LAN
* NodeJs

## Install
```
$ git clone xxx
$ npm install
$ node .\index.js
```

## Environment variables

| Variable | Range | Dsc  |
|---|---|---|
| USE_MOCK | [0 \| 1] | Describes if System should use mocked data for internal database |
| USE_MOCK_PRODUCTS | [0 \| 1] | Describes if System should use mocked data for reading products from external database |
| DB_PASSWORD | String | Password for the DB connection in config.db.js |
| DB_USER | String | User used in the database connection string |
| DB_SERVER | String | IP SERVER used in the database connection string |

## Database

Restore the DB located in `/fixtures/db-prezzi.bak`

## User test

```
acquisti2@dcgroupitalia.com
Fed.Buy2024!
```

Run app
```
Server running on port 5001

Open http://localhost:5001/
```

![Screenshot 2025-07-04 152917](https://github.com/user-attachments/assets/81058005-49ea-4da7-a2d2-53aa201018ea)
![Screenshot 2025-07-04 154716](https://github.com/user-attachments/assets/fe532c45-4283-428a-8a0e-63bfd9e03195)
![Screenshot 2025-07-04 154736](https://github.com/user-attachments/assets/38eb9692-7cc1-4a39-a8a4-d5295627600e)
![Screenshot 2025-07-04 154753](https://github.com/user-attachments/assets/ddfc3529-48b7-4c90-b26f-a20dfedea009)
