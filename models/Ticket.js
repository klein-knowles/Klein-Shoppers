const pool = require('../config/database');

class Ticket {
    static async create(userId, subject, description, priority = 'medium') {
        const [result] = await pool.execute(
            'INSERT INTO support_tickets (user_id, subject, description, priority) VALUES (?, ?, ?, ?)',
            [userId, subject, description, priority]
        );
        return result.insertId;
    }

    static async findAll(filters = {}) {
        let query = 'SELECT * FROM support_tickets WHERE 1=1';
        const params = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.priority) {
            query += ' AND priority = ?';
            params.push(filters.priority);
        }
        if (filters.userId) {
            query += ' AND user_id = ?';
            params.push(filters.userId);
        }

        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM support_tickets WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async updateStatus(id, status) {
        await pool.execute(
            'UPDATE support_tickets SET status = ? WHERE id = ?',
            [status, id]
        );
    }

    static async getStats() {
        const [rows] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
            FROM support_tickets
        `);
        return rows[0];
    }
}

module.exports = Ticket;