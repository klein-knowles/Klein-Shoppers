const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "klein_shoppers",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection check failed:", err.message || err.code || err);
        return;
    }

    console.log("Connected to MySQL Database.");
    connection.release();
});

module.exports = db;
