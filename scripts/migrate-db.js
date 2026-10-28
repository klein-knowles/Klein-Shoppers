require("dotenv").config();

const mysql = require("mysql2/promise");

const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Database migration requires: ${missing.join(", ")}.`);

const tables = [
    `CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(150) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL, phone VARCHAR(40), role VARCHAR(30) DEFAULT 'admin', status VARCHAR(30) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(100), last_name VARCHAR(100), name VARCHAR(200),
        email VARCHAR(255), phone VARCHAR(40), password VARCHAR(255), role VARCHAR(30), is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, description TEXT, image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, category VARCHAR(150),
        price DECIMAL(10,2) NOT NULL DEFAULT 0, stock INT NOT NULL DEFAULT 0, image VARCHAR(500), badge VARCHAR(80),
        rating DECIMAL(3,2) DEFAULT 0, tags TEXT, details TEXT, brand VARCHAR(150), specifications JSON,
        featured TINYINT(1) DEFAULT 0, deal TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT, user_id INT, product_id INT NOT NULL, quantity INT NOT NULL DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT, user_id INT, total DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(10,2), payment_method VARCHAR(80), payment_status VARCHAR(40) DEFAULT 'pending',
        status VARCHAR(40) DEFAULT 'pending', order_date DATETIME DEFAULT CURRENT_TIMESTAMP, created_at DATETIME,
        customer_name VARCHAR(200), coupon_code VARCHAR(80), discount DECIMAL(10,2) DEFAULT 0
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, product_id INT NOT NULL, quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, payment_method VARCHAR(80), amount DECIMAL(10,2) DEFAULT 0,
        payment_status VARCHAR(40) DEFAULT 'pending', payment_date DATETIME, transaction_reference VARCHAR(190),
        external_reference VARCHAR(190), phone VARCHAR(50), currency VARCHAR(10) DEFAULT 'KES', provider VARCHAR(80),
        status VARCHAR(40), message TEXT, created_at DATETIME, updated_at DATETIME
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE, phone VARCHAR(40), password VARCHAR(255) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'active', verified TINYINT(1) NOT NULL DEFAULT 1,
        verification_token VARCHAR(255), reset_token VARCHAR(255), reset_expires DATETIME,
        remember_token VARCHAR(255), failed_attempts INT NOT NULL DEFAULT 0, locked_until DATETIME,
        last_login DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT NOT NULL, product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_wishlist_customer_product(customer_id,product_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(128) NOT NULL PRIMARY KEY, sess JSON NOT NULL, expires DATETIME NOT NULL,
        INDEX idx_sessions_expires (expires)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, tracking_number VARCHAR(100), courier_name VARCHAR(150),
        courier_phone VARCHAR(50), delivery_address TEXT, delivery_fee DECIMAL(10,2) DEFAULT 0,
        estimated_date DATETIME, delivered_date DATETIME, status VARCHAR(40) DEFAULT 'pending', notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_deliveries_tracking(tracking_number)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(80) NOT NULL UNIQUE, discount_type VARCHAR(20) DEFAULT 'percent',
        discount_value DECIMAL(10,2) NOT NULL DEFAULT 0, minimum_amount DECIMAL(10,2) DEFAULT 0,
        max_uses INT, uses INT NOT NULL DEFAULT 0, expires_at DATETIME, active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT, name VARCHAR(150),
        rating TINYINT NOT NULL, comment TEXT, status VARCHAR(30) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY, setting_key VARCHAR(120) NOT NULL UNIQUE, setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), message TEXT, type VARCHAR(50), is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS couriers (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, phone VARCHAR(50), email VARCHAR(255),
        status VARCHAR(30) DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS courier_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY, delivery_id INT, order_id INT, status VARCHAR(80), location VARCHAR(255),
        notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS returns (
        id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, customer_id INT, reason TEXT, status VARCHAR(40) DEFAULT 'requested',
        refund_amount DECIMAL(10,2) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS return_timeline (
        id INT AUTO_INCREMENT PRIMARY KEY, return_id INT NOT NULL, status VARCHAR(80), note TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS refunds (
        id INT AUTO_INCREMENT PRIMARY KEY, order_id INT, return_id INT, amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(40) DEFAULT 'pending', reason TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS gift_cards (
        id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(100) NOT NULL UNIQUE, initial_balance DECIMAL(10,2) NOT NULL,
        balance DECIMAL(10,2) NOT NULL, status VARCHAR(30) DEFAULT 'active', expires_at DATETIME,
        customer_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS gift_card_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY, gift_card_id INT NOT NULL, amount DECIMAL(10,2) NOT NULL,
        transaction_type VARCHAR(30), order_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT, name VARCHAR(150), email VARCHAR(255), subject VARCHAR(255),
        message TEXT, status VARCHAR(30) DEFAULT 'open', priority VARCHAR(30) DEFAULT 'normal', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS support_replies (
        id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT NOT NULL, sender VARCHAR(30), message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS support_chats (
        id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT, session_id VARCHAR(128), sender VARCHAR(30), message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS cms_pages (
        id INT AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(180) NOT NULL UNIQUE, title VARCHAR(255), content LONGTEXT,
        meta_description TEXT, status VARCHAR(30) DEFAULT 'draft', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS cms_blog (
        id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), slug VARCHAR(180) UNIQUE, excerpt TEXT, content LONGTEXT,
        featured_image VARCHAR(500), category VARCHAR(150), tags TEXT, author_id INT, status VARCHAR(30) DEFAULT 'draft',
        published_at DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS cms_faq (
        id INT AUTO_INCREMENT PRIMARY KEY, question TEXT, answer LONGTEXT, category VARCHAR(150), sort_order INT DEFAULT 0,
        status VARCHAR(30) DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS inventory_history (
        id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, previous_stock INT, new_stock INT,
        quantity_changed INT, action VARCHAR(80), notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, movement_type VARCHAR(40), quantity INT,
        previous_stock INT, new_stock INT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS emails (
        id INT AUTO_INCREMENT PRIMARY KEY, recipient VARCHAR(255), subject VARCHAR(255), message LONGTEXT,
        type VARCHAR(80), status VARCHAR(40), sent_at DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS support_chat (
        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, message TEXT, is_agent TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS videos (
        id VARCHAR(64) NOT NULL PRIMARY KEY, title VARCHAR(120) NOT NULL, description TEXT,
        category VARCHAR(150), product_id VARCHAR(64), product_name VARCHAR(255), video_type VARCHAR(20) NOT NULL,
        filename VARCHAR(255), original_name VARCHAR(255), mime_type VARCHAR(120), video_url VARCHAR(1000),
        stream_url VARCHAR(1000), embed_url VARCHAR(1000), file_size BIGINT, uploaded_by JSON,
        is_active TINYINT(1) NOT NULL DEFAULT 1, views INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_videos_product(product_id), INDEX idx_videos_category(category)
    ) ENGINE=InnoDB`
];

const additions = {
    admins: ["full_name VARCHAR(150) NULL", "status VARCHAR(30) NOT NULL DEFAULT 'active'"],
    users: ["name VARCHAR(200) NULL", "is_admin TINYINT(1) NOT NULL DEFAULT 0"],
    categories: ["name VARCHAR(150) NULL", "image VARCHAR(500) NULL"],
    products: ["brand VARCHAR(150) NULL", "specifications JSON NULL", "featured TINYINT(1) NOT NULL DEFAULT 0", "deal TINYINT(1) NOT NULL DEFAULT 0", "updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
    cart: ["customer_id INT NULL", "user_id INT NULL"],
    orders: ["customer_id INT NULL", "user_id INT NULL", "payment_method VARCHAR(80) NULL", "payment_status VARCHAR(40) NOT NULL DEFAULT 'pending'", "created_at DATETIME NULL", "customer_name VARCHAR(200) NULL", "total_amount DECIMAL(10,2) NULL", "coupon_code VARCHAR(80) NULL", "discount DECIMAL(10,2) NOT NULL DEFAULT 0"],
    payments: ["transaction_reference VARCHAR(190) NULL", "external_reference VARCHAR(190) NULL", "phone VARCHAR(50) NULL", "currency VARCHAR(10) DEFAULT 'KES'", "provider VARCHAR(80) NULL", "status VARCHAR(40) NULL", "message TEXT NULL", "created_at DATETIME NULL", "updated_at DATETIME NULL"],
    notifications: ["status VARCHAR(40) DEFAULT 'unread'"],
    couriers: ["type VARCHAR(80) NULL", "code VARCHAR(80) NULL", "address TEXT NULL", "contact_person VARCHAR(150) NULL", "base_charge DECIMAL(10,2) DEFAULT 0", "per_km_charge DECIMAL(10,2) DEFAULT 0", "delivery_time_estimate VARCHAR(120) NULL", "service_area TEXT NULL", "rating DECIMAL(4,2) DEFAULT 0", "metadata JSON NULL", "total_deliveries INT DEFAULT 0", "successful_deliveries INT DEFAULT 0", "failed_deliveries INT DEFAULT 0"],
    courier_tracking: ["courier_id INT NULL", "tracking_number VARCHAR(100) NULL", "pickup_location VARCHAR(255) NULL", "delivery_location VARCHAR(255) NULL", "pickup_time DATETIME NULL", "estimated_delivery DATETIME NULL", "actual_delivery DATETIME NULL", "driver_name VARCHAR(150) NULL", "driver_phone VARCHAR(50) NULL", "location_history JSON NULL", "metadata JSON NULL", "customer_signature TEXT NULL"],
    returns: ["return_number VARCHAR(100) NULL", "customer_name VARCHAR(200) NULL", "customer_email VARCHAR(255) NULL", "customer_phone VARCHAR(50) NULL", "product_id INT NULL", "product_name VARCHAR(255) NULL", "product_sku VARCHAR(100) NULL", "quantity INT DEFAULT 1", "return_reason VARCHAR(120) NULL", "return_reason_detail TEXT NULL", "refund_amount DECIMAL(10,2) DEFAULT 0", "refund_method VARCHAR(80) NULL", "refund_processed_at DATETIME NULL", "refund_transaction_id VARCHAR(190) NULL", "shipping_cost DECIMAL(10,2) DEFAULT 0", "shipping_method VARCHAR(100) NULL", "tracking_number VARCHAR(100) NULL", "approved_by INT NULL", "approved_at DATETIME NULL", "rejection_reason TEXT NULL", "images JSON NULL", "metadata JSON NULL"],
    return_timeline: ["performed_by INT NULL"],
    refunds: ["refund_number VARCHAR(100) NULL", "customer_id INT NULL", "customer_name VARCHAR(200) NULL", "refund_amount DECIMAL(10,2) DEFAULT 0", "refund_method VARCHAR(80) NULL", "payment_gateway VARCHAR(100) NULL", "transaction_id VARCHAR(190) NULL", "gateway_response JSON NULL", "notes TEXT NULL", "metadata JSON NULL", "processed_by INT NULL", "processed_at DATETIME NULL", "completed_at DATETIME NULL"],
    gift_cards: ["amount DECIMAL(10,2) NULL", "remaining_balance DECIMAL(10,2) NULL", "currency VARCHAR(10) DEFAULT 'KES'", "created_by INT NULL", "recipient_email VARCHAR(255) NULL", "recipient_name VARCHAR(255) NULL", "message TEXT NULL", "expiry_date DATETIME NULL", "redeemed_at DATETIME NULL", "redeemed_by INT NULL", "order_id INT NULL", "updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
    gift_card_transactions: ["type VARCHAR(30) NULL", "note TEXT NULL", "date DATETIME NULL"],
    support_tickets: ["user_id INT NULL", "description TEXT NULL"],
    support_replies: ["user_id INT NULL", "is_agent TINYINT(1) DEFAULT 0"],
    support_chat: ["user_id INT NULL", "is_agent TINYINT(1) DEFAULT 0"]
};

async function main() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 2
    });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        for (const sql of tables) await connection.query(sql);

        for (const [table, definitions] of Object.entries(additions)) {
            const [rows] = await connection.query(
                "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                [table]
            );
            const existing = new Set(rows.map(row => row.COLUMN_NAME));
            for (const definition of definitions) {
                const name = definition.split(" ")[0];
                if (!existing.has(name)) await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${name}\` ${definition.slice(name.length + 1)}`);
            }
        }

        const [userColumns] = await connection.query(
            "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
        );
        const legacyUserColumns = new Set(userColumns.map(row => row.COLUMN_NAME));
        if (["id", "first_name", "last_name", "email", "password"].every(column => legacyUserColumns.has(column))) {
            const phoneValue = legacyUserColumns.has("phone") ? "phone" : "NULL";
            const createdValue = legacyUserColumns.has("created_at") ? "created_at" : "CURRENT_TIMESTAMP";
            const roleFilter = legacyUserColumns.has("role") ? " AND (role IS NULL OR LOWER(role) NOT IN ('admin', 'administrator'))" : "";
            const adminFilter = legacyUserColumns.has("is_admin") ? " AND COALESCE(is_admin, 0) = 0" : "";
            await connection.query(`
                INSERT IGNORE INTO customers (id, first_name, last_name, email, phone, password, created_at)
                SELECT id, COALESCE(first_name, ''), COALESCE(last_name, ''), email, ${phoneValue}, password, ${createdValue}
                FROM users WHERE email IS NOT NULL AND password IS NOT NULL${roleFilter}${adminFilter}
            `);
        }

        for (const table of ["cart", "orders"]) {
            const [columns] = await connection.query(
                "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                [table]
            );
            const names = new Set(columns.map(row => row.COLUMN_NAME));
            if (names.has("user_id") && names.has("customer_id")) {
                await connection.query(`UPDATE \`${table}\` SET customer_id = user_id WHERE customer_id IS NULL AND user_id IS NOT NULL`);
                await connection.query(`ALTER TABLE \`${table}\` MODIFY COLUMN user_id INT NULL`);
            }
        }

        await connection.query("UPDATE admins SET full_name = fullname WHERE (full_name IS NULL OR full_name = '') AND fullname IS NOT NULL").catch(() => {});
        await connection.query("UPDATE users SET name = CONCAT_WS(' ', first_name, last_name) WHERE (name IS NULL OR name = '')").catch(() => {});
        await connection.query("UPDATE categories SET name = category_name WHERE (name IS NULL OR name = '') AND category_name IS NOT NULL").catch(() => {});
        await connection.query("UPDATE orders SET created_at = order_date WHERE created_at IS NULL AND order_date IS NOT NULL").catch(() => {});
        await connection.query("UPDATE orders SET total_amount = total WHERE total_amount IS NULL AND total IS NOT NULL").catch(() => {});
        await connection.commit();
        console.log(`Database schema is ready (${tables.length} tables checked and legacy columns reconciled).`);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(error => {
    console.error(`Database migration failed: ${error.code || error.message}`);
    process.exitCode = 1;
});
