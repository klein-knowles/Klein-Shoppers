const pool = require('../config/database');

class Chat {
    static async saveMessage(userId, message, isAgent = false) {
        const [result] = await pool.execute(
            'INSERT INTO support_chat (user_id, message, is_agent) VALUES (?, ?, ?)',
            [userId, message, isAgent]
        );
        return result.insertId;
    }

    static async getMessages(userId = null, limit = 50) {
        let query = 'SELECT * FROM support_chat';
        const params = [];

        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        const [rows] = await pool.execute(query, params);
        return rows.reverse();
    }

    static async getActiveUsers() {
        const [rows] = await pool.execute(`
            SELECT DISTINCT user_id,
                   MAX(created_at) as last_message
            FROM support_chat
            WHERE is_agent = 0
            GROUP BY user_id
            ORDER BY last_message DESC
        `);
        return rows;
    }
}

module.exports = Chat;