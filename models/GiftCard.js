const db = require('../config/database');

class GiftCard {
    // Create gift cards table
    static async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS gift_cards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                remaining_balance DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'USD',
                status ENUM('active', 'redeemed', 'expired', 'cancelled') DEFAULT 'active',
                created_by INT NOT NULL,
                recipient_email VARCHAR(255) NOT NULL,
                recipient_name VARCHAR(255),
                message TEXT,
                expiry_date DATETIME NOT NULL,
                redeemed_at DATETIME,
                redeemed_by INT,
                order_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id),
                FOREIGN KEY (redeemed_by) REFERENCES users(id)
            )
        `;
        return db.execute(sql);
    }

    // Create transactions table
    static async createTransactionsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS gift_card_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                gift_card_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                type ENUM('created', 'redeemed', 'refunded') NOT NULL,
                note TEXT,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id) ON DELETE CASCADE
            )
        `;
        return db.execute(sql);
    }

    // Create new gift card
    static async create(data) {
        const { code, amount, createdBy, recipientEmail, recipientName, message, expiryDate } = data;
        
        const sql = `
            INSERT INTO gift_cards 
            (code, amount, remaining_balance, created_by, recipient_email, recipient_name, message, expiry_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(sql, [
            code, amount, amount, createdBy, recipientEmail, 
            recipientName || null, message || null, expiryDate
        ]);
        
        // Add transaction record
        await db.execute(
            'INSERT INTO gift_card_transactions (gift_card_id, amount, type, note) VALUES (?, ?, ?, ?)',
            [result.insertId, amount, 'created', `Gift card created for ${recipientEmail}`]
        );
        
        return { id: result.insertId, code };
    }

    // Find by code
    static async findByCode(code) {
        const sql = `
            SELECT g.*, 
                   u1.name as created_by_name, u1.email as created_by_email,
                   u2.name as redeemed_by_name
            FROM gift_cards g
            LEFT JOIN users u1 ON g.created_by = u1.id
            LEFT JOIN users u2 ON g.redeemed_by = u2.id
            WHERE g.code = ?
        `;
        const [rows] = await db.execute(sql, [code.toUpperCase()]);
        return rows[0] || null;
    }

    // Find by ID
    static async findById(id) {
        const sql = `
            SELECT g.*, 
                   u1.name as created_by_name,
                   u2.name as redeemed_by_name
            FROM gift_cards g
            LEFT JOIN users u1 ON g.created_by = u1.id
            LEFT JOIN users u2 ON g.redeemed_by = u2.id
            WHERE g.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    }

    // Get user's gift cards
    static async getUserCards(email) {
        const sql = `
            SELECT * FROM gift_cards 
            WHERE recipient_email = ? 
            ORDER BY created_at DESC
        `;
        const [rows] = await db.execute(sql, [email]);
        return rows;
    }

    // Get all gift cards (admin)
    static async getAll(filters = {}) {
        let sql = `
            SELECT g.*, 
                   u1.name as created_by_name,
                   u2.name as redeemed_by_name
            FROM gift_cards g
            LEFT JOIN users u1 ON g.created_by = u1.id
            LEFT JOIN users u2 ON g.redeemed_by = u2.id
            WHERE 1=1
        `;
        const params = [];
        
        if (filters.status) {
            sql += ' AND g.status = ?';
            params.push(filters.status);
        }
        
        sql += ' ORDER BY g.created_at DESC';
        
        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }
        
        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // Update status
    static async updateStatus(id, status) {
        const sql = 'UPDATE gift_cards SET status = ? WHERE id = ?';
        const [result] = await db.execute(sql, [status, id]);
        return result.affectedRows > 0;
    }

    // Redeem gift card
    static async redeem(id, amount, userId, orderId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Get current balance
            const [card] = await connection.execute(
                'SELECT remaining_balance, status, expiry_date FROM gift_cards WHERE id = ? FOR UPDATE',
                [id]
            );
            
            if (!card.length) throw new Error('Gift card not found');
            if (card[0].status !== 'active') throw new Error('Gift card is not active');
            if (card[0].expiry_date < new Date()) throw new Error('Gift card has expired');
            if (amount > card[0].remaining_balance) throw new Error('Insufficient balance');
            
            // Update balance
            const newBalance = card[0].remaining_balance - amount;
            let status = 'active';
            if (newBalance === 0) status = 'redeemed';
            
            await connection.execute(
                'UPDATE gift_cards SET remaining_balance = ?, status = ?, redeemed_at = ?, redeemed_by = ?, order_id = ? WHERE id = ?',
                [newBalance, status, new Date(), userId, orderId, id]
            );
            
            // Add transaction
            await connection.execute(
                'INSERT INTO gift_card_transactions (gift_card_id, amount, type, note) VALUES (?, ?, ?, ?)',
                [id, amount, 'redeemed', `Redeemed for order #${orderId}`]
            );
            
            await connection.commit();
            return { newBalance, status };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get transactions for a card
    static async getTransactions(cardId) {
        const sql = 'SELECT * FROM gift_card_transactions WHERE gift_card_id = ? ORDER BY date DESC';
        const [rows] = await db.execute(sql, [cardId]);
        return rows;
    }

    // Delete expired cards
    static async deleteExpired() {
        const sql = 'DELETE FROM gift_cards WHERE expiry_date < NOW() AND status = "expired"';
        const [result] = await db.execute(sql);
        return result.affectedRows;
    }
}

module.exports = GiftCard;