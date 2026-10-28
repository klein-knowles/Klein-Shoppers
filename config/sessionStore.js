const session = require("express-session");
const pool = require("./database");

class MySQLSessionStore extends session.Store {
    constructor(options = {}) {
        super();
        this.tableName = options.tableName || "sessions";
        this.initError = null;
        this.ready = this.ensureTable().catch((error) => {
            this.initError = error;
            console.error("Session store initialization failed:", error.message || error.code || error);
        });
    }

    async ensureTable() {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                sid VARCHAR(128) NOT NULL PRIMARY KEY,
                sess JSON NOT NULL,
                expires DATETIME NOT NULL,
                INDEX idx_sessions_expires (expires)
            )
        `);
    }

    async get(sid, callback) {
        try {
            await this.assertReady();
            const [rows] = await pool.execute(
                `SELECT sess FROM ${this.tableName} WHERE sid = ? AND expires > NOW()`,
                [sid]
            );

            callback(null, rows.length ? rows[0].sess : null);
        } catch (error) {
            callback(error);
        }
    }

    async set(sid, sess, callback = () => {}) {
        try {
            await this.assertReady();
            const expires = this.getExpiry(sess);

            await pool.execute(
                `REPLACE INTO ${this.tableName} (sid, sess, expires) VALUES (?, CAST(? AS JSON), ?)`,
                [sid, JSON.stringify(sess), expires]
            );

            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async destroy(sid, callback = () => {}) {
        try {
            await this.assertReady();
            await pool.execute(
                `DELETE FROM ${this.tableName} WHERE sid = ?`,
                [sid]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async touch(sid, sess, callback = () => {}) {
        try {
            await this.assertReady();
            await pool.execute(
                `UPDATE ${this.tableName} SET expires = ? WHERE sid = ?`,
                [this.getExpiry(sess), sid]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async assertReady() {
        await this.ready;

        if (this.initError) {
            throw this.initError;
        }
    }

    getExpiry(sess) {
        if (sess.cookie && sess.cookie.expires) {
            return new Date(sess.cookie.expires);
        }

        return new Date(Date.now() + Number(process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000));
    }
}

module.exports = MySQLSessionStore;
