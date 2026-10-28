const db = require('../config/database');

class Return {
    // Find all returns with filters
    static async findAll({ 
        status = null, 
        search = null,
        dateFrom = null,
        dateTo = null,
        page = 1, 
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC'
    }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM returns WHERE 1=1';
        const params = [];
        
        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }
        
        if (search) {
            query += ' AND (return_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR product_name LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        if (dateFrom) {
            query += ' AND created_at >= ?';
            params.push(dateFrom);
        }
        
        if (dateTo) {
            query += ' AND created_at <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        
        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;
        
        // Get paginated results
        query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [rows] = await db.query(query, params);
        
        // Parse JSON fields
        const data = rows.map(row => ({
            ...row,
            images: row.images ? JSON.parse(row.images) : [],
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
        
        return {
            data: data,
            total: total,
            hasMore: offset + rows.length < total,
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }
    
    // Find return by ID
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM returns WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            images: rows[0].images ? JSON.parse(rows[0].images) : [],
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Find return by return number
    static async findByReturnNumber(returnNumber) {
        const [rows] = await db.query(
            'SELECT * FROM returns WHERE return_number = ?',
            [returnNumber]
        );
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            images: rows[0].images ? JSON.parse(rows[0].images) : [],
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Find returns by order ID
    static async findByOrderId(orderId) {
        const [rows] = await db.query(
            'SELECT * FROM returns WHERE order_id = ? ORDER BY created_at DESC',
            [orderId]
        );
        
        return rows.map(row => ({
            ...row,
            images: row.images ? JSON.parse(row.images) : [],
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
    }
    
    // Create new return
    static async create(data) {
        const {
            return_number, order_id, customer_id, customer_name, customer_email, customer_phone,
            product_id, product_name, product_sku, quantity, return_reason, return_reason_detail,
            refund_amount, refund_method = 'original_payment',
            shipping_method, tracking_number, shipping_cost = 0,
            images = [], notes = '', metadata = null
        } = data;
        
        const [result] = await db.query(
            `INSERT INTO returns (
                return_number, order_id, customer_id, customer_name, customer_email, customer_phone,
                product_id, product_name, product_sku, quantity, return_reason, return_reason_detail,
                refund_amount, refund_method,
                shipping_method, tracking_number, shipping_cost,
                images, notes, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                return_number, order_id, customer_id || null, customer_name, customer_email, customer_phone,
                product_id || null, product_name, product_sku || null, quantity, return_reason, return_reason_detail,
                refund_amount, refund_method,
                shipping_method || null, tracking_number || null, shipping_cost,
                images.length > 0 ? JSON.stringify(images) : null,
                notes, metadata ? JSON.stringify(metadata) : null
            ]
        );
        
        const returnData = await this.findById(result.insertId);
        
        // Add timeline entry
        await this.addTimeline(result.insertId, 'pending', 'Return request submitted');
        
        return returnData;
    }
    
    // Update return
    static async update(id, data) {
        const fields = [];
        const values = [];
        
        const allowedFields = [
            'product_name', 'quantity', 'return_reason', 'return_reason_detail',
            'refund_amount', 'refund_method', 'status',
            'shipping_method', 'tracking_number', 'shipping_cost',
            'notes', 'rejection_reason',
            'approved_by', 'approved_at',
            'refund_processed_at', 'refund_transaction_id'
        ];
        
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }
        
        if (data.images !== undefined) {
            fields.push('images = ?');
            values.push(data.images.length > 0 ? JSON.stringify(data.images) : null);
        }
        
        if (data.metadata !== undefined) {
            fields.push('metadata = ?');
            values.push(data.metadata ? JSON.stringify(data.metadata) : null);
        }
        
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        
        values.push(id);
        const query = `UPDATE returns SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.query(query, values);
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Update status with timeline
    static async updateStatus(id, status, note = null, userId = null) {
        const [result] = await db.query(
            'UPDATE returns SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        // Add timeline entry
        await this.addTimeline(id, status, note || `Status updated to ${status}`, userId);
        
        return this.findById(id);
    }
    
    // Add timeline entry
    static async addTimeline(returnId, status, note, performedBy = null) {
        const [result] = await db.query(
            `INSERT INTO return_timeline (return_id, status, note, performed_by) 
             VALUES (?, ?, ?, ?)`,
            [returnId, status, note, performedBy]
        );
        
        return result.insertId;
    }
    
    // Get timeline for a return
    static async getTimeline(returnId) {
        const [rows] = await db.query(
            `SELECT * FROM return_timeline 
             WHERE return_id = ? 
             ORDER BY created_at ASC`,
            [returnId]
        );
        
        return rows;
    }
    
    // Get return statistics
    static async getStatistics() {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
                SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
                SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(refund_amount) as total_refund_amount,
                AVG(refund_amount) as avg_refund_amount
            FROM returns
        `);
        
        const [byReason] = await db.query(`
            SELECT 
                return_reason,
                COUNT(*) as count,
                SUM(refund_amount) as total_amount
            FROM returns
            GROUP BY return_reason
        `);
        
        const [byMonth] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count,
                SUM(refund_amount) as total_amount
            FROM returns
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);
        
        return {
            ...stats[0],
            by_reason: byReason,
            by_month: byMonth
        };
    }
    
    // Search returns
    static async search(query) {
        const [rows] = await db.query(`
            SELECT * FROM returns 
            WHERE return_number LIKE ? 
               OR customer_name LIKE ? 
               OR customer_email LIKE ? 
               OR product_name LIKE ?
            LIMIT 20
        `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
        
        return rows.map(row => ({
            ...row,
            images: row.images ? JSON.parse(row.images) : [],
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
    }
}

module.exports = Return;