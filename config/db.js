const mysql = require("mysql2");

const production = process.env.NODE_ENV === "production";
const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
if (production) {
    const missing = required.filter(name => !process.env[name]);
    if (missing.length) {
        throw new Error(`Missing production database settings: ${missing.join(", ")}.`);
    }
}

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "klein_shoppers",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
    queueLimit: 0
});

module.exports = db;
