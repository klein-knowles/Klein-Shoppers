const db = require('../config/database');

class CourierTracking {
    // Create new tracking record
    static async create(data) {
        const {
            courier_id, order_id, tracking_number, status = 'pending',
            pickup_location, delivery_location, pickup_time, estimated_delivery,
            driver_name, driver_phone, notes, metadata = null
        } = data;
        
        const [result] = await db.query(
            `INSERT INTO courier_tracking (
                courier_id, order_id, tracking_number, status,
                pickup_location, delivery_location, pickup_time, estimated_delivery,
                driver_name, driver_phone, notes, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                courier_id, order_id, tracking_number, status,
                pickup_location, delivery_location, pickup_time, estimated_delivery,
                driver_name, driver_phone, notes,
                metadata ? JSON.stringify(metadata) : null
            ]
        );
        
        return this.findById(result.insertId);
    }
    
    // Find tracking by ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT t.*, c.name as courier_name, c.type as courier_type, c.phone as courier_phone
            FROM courier_tracking t
            LEFT JOIN couriers c ON t.courier_id = c.id
            WHERE t.id = ?
        `, [id]);
        
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            location_history: rows[0].location_history ? JSON.parse(rows[0].location_history) : [],
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Find tracking by tracking number
    static async findByTrackingNumber(trackingNumber) {
        const [rows] = await db.query(`
            SELECT t.*, c.name as courier_name, c.type as courier_type, c.phone as courier_phone
            FROM courier_tracking t
            LEFT JOIN couriers c ON t.courier_id = c.id
            WHERE t.tracking_number = ?
        `, [trackingNumber]);
        
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            location_history: rows[0].location_history ? JSON.parse(rows[0].location_history) : [],
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Find all tracking records for a courier
    static async findByCourierId(courierId, limit = 10) {
        const [rows] = await db.query(`
            SELECT * FROM courier_tracking
            WHERE courier_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `, [courierId, limit]);
        
        return rows.map(row => ({
            ...row,
            location_history: row.location_history ? JSON.parse(row.location_history) : [],
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
    }
    
    // Update tracking status
    static async updateStatus(id, status, notes = null) {
        const [result] = await db.query(
            'UPDATE courier_tracking SET status = ?, notes = ? WHERE id = ?',
            [status, notes, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Update location history
    static async addLocationUpdate(id, locationData) {
        const tracking = await this.findById(id);
        if (!tracking) return null;
        
        const history = tracking.location_history || [];
        history.push({
            ...locationData,
            timestamp: new Date().toISOString()
        });
        
        const [result] = await db.query(
            'UPDATE courier_tracking SET location_history = ? WHERE id = ?',
            [JSON.stringify(history), id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Mark delivery as complete
    static async completeDelivery(id, signature = null, notes = null) {
        const [result] = await db.query(
            `UPDATE courier_tracking 
             SET status = 'delivered', 
                 actual_delivery = NOW(),
                 customer_signature = ?,
                 notes = ?
             WHERE id = ?`,
            [signature, notes, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        // Update courier statistics
        const tracking = await this.findById(id);
        if (tracking) {
            await db.query(
                `UPDATE couriers 
                 SET total_deliveries = total_deliveries + 1,
                     successful_deliveries = successful_deliveries + 1
                 WHERE id = ?`,
                [tracking.courier_id]
            );
        }
        
        return this.findById(id);
    }
    
    // Mark delivery as failed
    static async failDelivery(id, reason) {
        const [result] = await db.query(
            `UPDATE courier_tracking 
             SET status = 'failed', 
                 notes = ?
             WHERE id = ?`,
            [reason, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        // Update courier statistics
        const tracking = await this.findById(id);
        if (tracking) {
            await db.query(
                `UPDATE couriers 
                 SET total_deliveries = total_deliveries + 1,
                     failed_deliveries = failed_deliveries + 1
                 WHERE id = ?`,
                [tracking.courier_id]
            );
        }
        
        return this.findById(id);
    }
    
    // Get tracking statistics
    static async getStatistics() {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'picked_up' THEN 1 ELSE 0 END) as picked_up,
                SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
                SUM(CASE WHEN status = 'out_for_delivery' THEN 1 ELSE 0 END) as out_for_delivery,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned
            FROM courier_tracking
        `);
        
        const [byCourier] = await db.query(`
            SELECT 
                c.name,
                c.type,
                COUNT(t.id) as total_deliveries,
                SUM(CASE WHEN t.status = 'delivered' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN t.status = 'failed' THEN 1 ELSE 0 END) as failed
            FROM couriers c
            LEFT JOIN courier_tracking t ON c.id = t.courier_id
            GROUP BY c.id, c.name, c.type
        `);
        
        return {
            ...stats[0],
            by_courier: byCourier
        };
    }
}

module.exports = CourierTracking;