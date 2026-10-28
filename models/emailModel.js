const db = require("../config/db");

const Email = {};

Email.getAll = (callback) => {
    db.query(
        "SELECT * FROM emails ORDER BY created_at DESC",
        callback
    );
};

Email.getById = (id, callback) => {
    db.query(
        "SELECT * FROM emails WHERE id = ?",
        [id],
        callback
    );
};

Email.create = (data, callback) => {
    db.query(
        `INSERT INTO emails(recipient, subject, message, type, status, sent_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            data.recipient,
            data.subject,
            data.message,
            data.type,
            data.status,
            data.sent_at
        ],
        callback
    );
};

Email.update = (id, data, callback) => {
    db.query(
        `UPDATE emails
         SET recipient = ?, subject = ?, message = ?, type = ?, status = ?
         WHERE id = ?`,
        [
            data.recipient,
            data.subject,
            data.message,
            data.type,
            data.status,
            id
        ],
        callback
    );
};

Email.delete = (id, callback) => {
    db.query(
        "DELETE FROM emails WHERE id = ?",
        [id],
        callback
    );
};

Email.statistics = (callback) => {
    db.query(
        `SELECT
            COUNT(*) total,
            SUM(status = 'Sent') sent,
            SUM(status = 'Failed') failed,
            SUM(status = 'Pending') pending,
            SUM(type = 'Newsletter') newsletters,
            SUM(type = 'Promotion') promotions
         FROM emails`,
        callback
    );
};

module.exports = Email;
