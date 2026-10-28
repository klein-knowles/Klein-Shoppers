const db = require('../config/database');

class Refund {
    // Create new refund
    static async create(data) {
        const {
            refund_number, return_id, order_id, customer_id, customer_name,
            refund_amount, refund_method = 'original_payment',
            payment_gateway, transaction_id, gateway_response = null,
            notes = '', metadata = null
        } = data;
        
        const [result] = await db.query(
            `INSERT INTO refunds (
                refund_number, return_id, order_id, customer_id, customer_name,
                refund_amount, refund_method,
                payment_gateway, transaction_id, gateway_response,
                notes, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                refund_number, return_id, order_id, customer_id || null, customer_name,
                refund_amount, refund_method,
                payment_gateway || null, transaction_id || null,
                gateway_response ? JSON.stringify(gateway_response) : null,
                notes, metadata ? JSON.stringify(metadata) : null
            ]
        );
        
        return this.findById(result.insertId);
    }
    
    // Find refund by ID
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM refunds WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            gateway_response: rows[0].gateway_response ? JSON.parse(rows[0].gateway_response) : null,
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Find refund by refund number
    static async findByRefundNumber(refundNumber) {
        const [rows] = await db.query(
            'SELECT * FROM refunds WHERE refund_number = ?',
            [refundNumber]
        );
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            gateway_response: rows[0].gateway_response ? JSON.parse(rows[0].gateway_response) : null,
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Find refund by return ID
    static async findByReturnId(returnId) {
        const [rows] = await db.query(
            'SELECT * FROM refunds WHERE return_id = ?',
            [returnId]
        );
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            gateway_response: rows[0].gateway_response ? JSON.parse(rows[0].gateway_response) : null,
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Update refund status
    static async updateStatus(id, status, notes = null) {
        const [result] = await db.query(
            'UPDATE refunds SET status = ?, notes = ? WHERE id = ?',
            [status, notes, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Process refund (mark as processing)
    static async processRefund(id, processedBy = null) {
        const [result] = await db.query(
            `UPDATE refunds 
             SET status = 'processing', 
                 processed_by = ?,
                 processed_at = NOW()
             WHERE id = ?`,
            [processedBy, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Complete refund
    static async completeRefund(id, transactionId = null, gatewayResponse = null) {
        const [result] = await db.query(
            `UPDATE refunds 
             SET status = 'completed',
                 transaction_id = ?,
                 gateway_response = ?,
                 completed_at = NOW()
             WHERE id = ?`,
            [transactionId, gatewayResponse ? JSON.stringify(gatewayResponse) : null, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Fail refund
    static async failRefund(id, reason) {
        const [result] = await db.query(
            `UPDATE refunds 
             SET status = 'failed',
                 notes = ?
             WHERE id = ?`,
            [reason, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Get refund statistics
    static async getStatistics() {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(refund_amount) as total_refunded,
                AVG(refund_amount) as avg_refund
            FROM refunds
        `);
        
        const [byMethod] = await db.query(`
            SELECT 
                refund_method,
                COUNT(*) as count,
                SUM(refund_amount) as total_amount
            FROM refunds
            WHERE status = 'completed'
            GROUP BY refund_method
        `);
        
        return {
            ...stats[0],
            by_method: byMethod
        };
    }
}

module.exports = Refund;