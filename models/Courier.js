const db = require('../config/database');

class Courier {
    // Find all couriers with filters
    static async findAll({ 
        type = null, 
        status = null, 
        search = null,
        page = 1, 
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC'
    }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM couriers WHERE 1=1';
        const params = [];
        
        if (type && type !== 'all') {
            query += ' AND type = ?';
            params.push(type);
        }
        
        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }
        
        if (search) {
            query += ' AND (name LIKE ? OR code LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;
        
        // Get paginated results
        query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [rows] = await db.query(query, params);
        
        // Parse metadata JSON for each row
        const data = rows.map(row => ({
            ...row,
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
    
    // Find courier by ID
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM couriers WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Find courier by code
    static async findByCode(code) {
        const [rows] = await db.query(
            'SELECT * FROM couriers WHERE code = ?',
            [code]
        );
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : null
        };
    }
    
    // Create new courier
    static async create(data) {
        const {
            name, type, code, email, phone, address, contact_person,
            base_charge, per_km_charge, delivery_time_estimate,
            service_area, status = 'active', rating = 0,
            metadata = null
        } = data;
        
        // Check if code exists
        const existing = await this.findByCode(code);
        if (existing) {
            throw new Error('Courier code already exists');
        }
        
        const [result] = await db.query(
            `INSERT INTO couriers (
                name, type, code, email, phone, address, contact_person,
                base_charge, per_km_charge, delivery_time_estimate,
                service_area, status, rating, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, type, code, email, phone, address, contact_person,
                base_charge || 0, per_km_charge || 0, delivery_time_estimate,
                service_area, status, rating || 0,
                metadata ? JSON.stringify(metadata) : null
            ]
        );
        
        return this.findById(result.insertId);
    }
    
    // Update courier
    static async update(id, data) {
        const fields = [];
        const values = [];
        
        const allowedFields = [
            'name', 'type', 'email', 'phone', 'address', 'contact_person',
            'base_charge', 'per_km_charge', 'delivery_time_estimate',
            'service_area', 'status', 'rating'
        ];
        
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }
        
        if (data.metadata !== undefined) {
            fields.push('metadata = ?');
            values.push(data.metadata ? JSON.stringify(data.metadata) : null);
        }
        
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        
        values.push(id);
        const query = `UPDATE couriers SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.query(query, values);
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Delete courier
    static async delete(id) {
        // Check if courier has tracking records
        const [tracking] = await db.query(
            'SELECT COUNT(*) as count FROM courier_tracking WHERE courier_id = ?',
            [id]
        );
        
        if (tracking[0].count > 0) {
            throw new Error('Cannot delete courier with existing tracking records');
        }
        
        const [result] = await db.query(
            'DELETE FROM couriers WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
    
    // Update courier status
    static async updateStatus(id, status) {
        const [result] = await db.query(
            'UPDATE couriers SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return this.findById(id);
    }
    
    // Update courier rating
    static async updateRating(id, rating) {
        const [result] = await db.query(
            'UPDATE couriers SET rating = ? WHERE id = ?',
            [rating, id]
        );
        
        return result.affectedRows > 0;
    }
    
    // Get courier statistics
    static async getStatistics() {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
                AVG(rating) as avg_rating,
                SUM(total_deliveries) as total_deliveries,
                SUM(successful_deliveries) as successful_deliveries,
                SUM(failed_deliveries) as failed_deliveries
            FROM couriers
        `);
        
        const [byType] = await db.query(`
            SELECT 
                type,
                COUNT(*) as count,
                AVG(rating) as avg_rating
            FROM couriers
            GROUP BY type
        `);
        
        return {
            ...stats[0],
            by_type: byType
        };
    }
    
    // Search couriers
    static async search(query) {
        const [rows] = await db.query(`
            SELECT * FROM couriers 
            WHERE name LIKE ? 
               OR code LIKE ? 
               OR email LIKE ? 
               OR phone LIKE ?
            LIMIT 20
        `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
        
        return rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
    }
}

module.exports = Courier;