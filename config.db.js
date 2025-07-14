var connection = {
    server: "192.168.0.232,1434",
    database: "MonitorRilevamentoPrezzi",
    user: "sa",
    password: process.env.DB_PASSWORD,
    options: {
        //trustedConnection: true, // Set to true if using Windows Authentication
        trustServerCertificate: true, // Set to true if using self-signed certificates
    },
    driver: "msnodesqlv8", // Required if using Windows Authentication
}
module.exports = connection;