const pool = require('../config/database');

class Reply {
    static async create(ticketId, userId, message, isAgent = false) {
        const [result] = await pool.execute(
            'INSERT INTO support_replies (ticket_id, user_id, message, is_agent) VALUES (?, ?, ?, ?)',
            [ticketId, userId, message, isAgent]
        );
        return result.insertId;
    }

    static async findByTicketId(ticketId) {
        const [rows] = await pool.execute(
            'SELECT * FROM support_replies WHERE ticket_id = ? ORDER BY created_at ASC',
            [ticketId]
        );
        return rows;
    }
}

module.exports = Reply;