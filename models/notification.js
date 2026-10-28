const db = require('../config/database');

class Notification {
    // Find all notifications with pagination and filters
    static async findAll({ filter = null, page = 1, limit = 10, userId = null }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM notifications WHERE 1=1';
        const params = [];
        
        if (filter && filter !== 'all') {
            query += ' AND type = ?';
            params.push(filter);
        }
        
        if (userId) {
            query += ' AND (user_id = ? OR user_id IS NULL)';
            params.push(userId);
        }
        
        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;
        
        // Get paginated results
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [rows] = await db.query(query, params);
        
        return {
            data: rows,
            total: total,
            hasMore: offset + rows.length < total
        };
    }
    
    // Find notification by ID
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }
    
    // Create new notification
    static async create(data) {
        const {
            type, title, message, priority = 'medium',
            action_label = null, action_url = null,
            metadata = null, user_id = null
        } = data;
        
        const [result] = await db.query(
            `INSERT INTO notifications 
            (type, title, message, priority, action_label, action_url, metadata, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [type, title, message, priority, action_label, action_url, JSON.stringify(metadata), user_id]
        );
        
        return this.findById(result.insertId);
    }
    
    // Update notification status
    static async updateStatus(id, status) {
        const [result] = await db.query(
            'UPDATE notifications SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows > 0) {
            return this.findById(id);
        }
        return null;
    }
    
    // Mark all as read
    static async markAllAsRead(userId = null) {
        let query = 'UPDATE notifications SET status = ? WHERE status = ?';
        const params = ['read', 'unread'];
        
        if (userId) {
            query += ' AND (user_id = ? OR user_id IS NULL)';
            params.push(userId);
        }
        
        const [result] = await db.query(query, params);
        return result.affectedRows;
    }
    
    // Delete notification
    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM notifications WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
    
    // Get unread count
    static async getUnreadCount(userId = null) {
        let query = 'SELECT COUNT(*) as count FROM notifications WHERE status = ?';
        const params = ['unread'];
        
        if (userId) {
            query += ' AND (user_id = ? OR user_id IS NULL)';
            params.push(userId);
        }
        
        const [rows] = await db.query(query, params);
        return rows[0].count;
    }
    
    // Get notifications by type
    static async findByType(type, limit = 10) {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE type = ? ORDER BY created_at DESC LIMIT ?',
            [type, limit]
        );
        return rows;
    }
    
    // Delete old notifications
    static async deleteOld(days = 30) {
        const [result] = await db.query(
            'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND status = ?',
            [days, 'read']
        );
        return result.affectedRows;
    }
}

module.exports = Notification;