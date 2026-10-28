CREATE DATABASE IF NOT EXISTS klein_shoppers;
USE klein_shoppers;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SHOW TABLES;
INSERT INTO products (name, description, category, price, stock, image)
VALUES
('Samsung Galaxy A55', '128
GB, 8GB RAM', 'Phones', 1200000.00, 15, 'galaxy_a55.jpg'),

('HP EliteBook 840', 'Core i5, 16GB RAM, 512GB SSD', 'Laptops', 2500000.00, 8, 'elitebook840.jpg'),

('Sony WH-1000XM5', 'Noise Cancelling Headphones', 'Audio', 1500000.00, 12, 'sonyxm5.jpg');
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('customer','admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SHOW TABLES;
INSERT INTO users
(first_name, last_name, email, phone, password, role)
VALUES
('Klein', 'Admin', 'admin@kleinshoppers.com', '0700000000', 'admin123', 'admin');
SELECT * FROM users;
USE klein_shoppers;
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO categories (category_name, description)
VALUES
('Phones','Smartphones and Accessories'),
('Laptops','Computers and Accessories'),
('Fashion','Clothes and Shoes'),
('Home Appliances','Kitchen and Home Equipment'),
('Electronics','Electronic Devices');
SELECT * FROM categories;
SELECT COUNT(*) AS total_categories
FROM categories;
INSERT INTO categories (category_name, description)
VALUES
('Phones', 'Smartphones and Accessories'),
('Laptops', 'Computers and Accessories'),
('Fashion', 'Clothes and Shoes'),
('Home Appliances', 'Kitchen and Home Equipment'),
('Electronics', 'Electronic Devices');
SELECT * FROM categories;
SELECT COUNT(*) AS total_categories FROM categories;
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,

    total DECIMAL(10,2) NOT NULL,

    status ENUM('Pending','Processing','Delivered','Cancelled')
    DEFAULT 'Pending',

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL,

    price DECIMAL(10,2),

    FOREIGN KEY (order_id) REFERENCES orders(id),

    FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE TABLE payments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    payment_method VARCHAR(50),

    amount DECIMAL(10,2),

    payment_status ENUM('Pending','Paid','Failed')
    DEFAULT 'Pending',

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id)

);
SHOW TABLES;
ALTER TABLE products
ADD COLUMN badge VARCHAR(100),
ADD COLUMN rating DECIMAL(2,1) DEFAULT 5.0,
ADD COLUMN tags VARCHAR(255),
ADD COLUMN details TEXT;

UPDATE products
SET
badge='28% OFF',
rating=4.8,
tags='deals,electronics,audio',
details='Portable wireless sound|Rechargeable battery|Great for bedrooms';

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(30),
    role ENUM('Super Admin','Manager','Staff') DEFAULT 'Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products
ADD COLUMN brand VARCHAR(100),
ADD COLUMN badge VARCHAR(100),
ADD COLUMN rating DECIMAL(2,1),
ADD COLUMN quantity INT DEFAULT 0,
ADD COLUMN featured BOOLEAN DEFAULT FALSE,
ADD COLUMN deal BOOLEAN DEFAULT FALSE,
ADD COLUMN specifications TEXT,
ADD COLUMN tags VARCHAR(255);

DESCRIBE products;

CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image VARCHAR(255),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY(cart_id) REFERENCES carts(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(12,2),
    status VARCHAR(50),
    payment_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(12,2),
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

DESCRIBE products;

ALTER TABLE products
ADD COLUMN brand VARCHAR(100),
ADD COLUMN quantity INT DEFAULT 0,
ADD COLUMN featured BOOLEAN DEFAULT FALSE,
ADD COLUMN deal BOOLEAN DEFAULT FALSE,
ADD COLUMN specifications TEXT;

DESCRIBE products;

UPDATE products
SET
brand = 'Samsung',
badge = '28% OFF',
rating = 4.8,
quantity = 15,
featured = TRUE,
deal = TRUE,
specifications = '128GB Storage|8GB RAM|Android 15|5000mAh Battery',
tags = 'phones,electronics,samsung'
WHERE id = 1;

UPDATE products
SET
brand = 'HP',
badge = 'New Arrival',
rating = 4.7,
quantity = 8,
featured = TRUE,
deal = FALSE,
specifications = 'Intel Core i5|16GB RAM|512GB SSD|Windows 11',
tags = 'laptops,electronics,hp'
WHERE id = 2;

UPDATE products
SET
brand = 'Sony',
badge = 'Best Seller',
rating = 4.9,
quantity = 12,
featured = TRUE,
deal = TRUE,
specifications = 'Noise Cancelling|Bluetooth 5.3|30 Hour Battery',
tags = 'audio,headphones,sony'
WHERE id = 3;

SELECT * FROM products;

CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_users (username, password)
VALUES ('admin', 'admin123');

SELECT * FROM products ORDER BY id DESC;

CREATE TABLE categories (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    image VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO categories (name, description) VALUES

('Phones', 'Smartphones and mobile devices'),

('Computers', 'Laptops and desktop computers'),

('Accessories', 'Computer and phone accessories'),

('Televisions', 'Smart TVs and LED TVs'),

('Fashion', 'Clothes, shoes and bags'),

('Home & Living', 'Furniture and home appliances'),

('Beauty', 'Beauty and personal care'),

('Sports', 'Sports equipment and fitness');

CREATE TABLE customers (

    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    phone VARCHAR(30),

    password VARCHAR(255) NOT NULL,

    status ENUM('Active','Blocked') DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE customer_addresses (

    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    address_line1 VARCHAR(255),

    address_line2 VARCHAR(255),

    city VARCHAR(100),

    district VARCHAR(100),

    country VARCHAR(100),

    postal_code VARCHAR(20),

    is_default TINYINT(1) DEFAULT 1,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE

);

CREATE TABLE cart (

    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);

CREATE TABLE orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    total DECIMAL(12,2),

    status ENUM(

        'Pending',

        'Paid',

        'Processing',

        'Shipped',

        'Delivered',

        'Cancelled'

    ) DEFAULT 'Pending',

    payment_method VARCHAR(100),

    payment_status ENUM(

        'Pending',

        'Paid',

        'Failed'

    ) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)

);

CREATE TABLE order_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT,

    price DECIMAL(12,2),

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)

);

CREATE TABLE cart (

    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);

CREATE TABLE wishlist (

    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    product_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_wishlist (customer_id, product_id),

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);

CREATE TABLE reviews (

    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    product_id INT NOT NULL,

    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),

    review TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);

CREATE TABLE coupons (

    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,

    discount_type ENUM('percentage','fixed') NOT NULL,

    discount_value DECIMAL(10,2) NOT NULL,

    minimum_order DECIMAL(10,2) DEFAULT 0,

    expiry_date DATE NOT NULL,

    status ENUM('Active','Inactive') DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

ALTER TABLE orders
ADD COLUMN coupon_code VARCHAR(50) NULL,
ADD COLUMN discount DECIMAL(10,2) DEFAULT 0;

CREATE TABLE inventory_history (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    previous_stock INT NOT NULL,

    new_stock INT NOT NULL,

    quantity_changed INT NOT NULL,

    action ENUM(
        'Added',
        'Reduced',
        'Adjusted'
    ) NOT NULL,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);

SHOW COLUMNS FROM products;

CREATE TABLE stock_movements (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    movement_type ENUM('IN','OUT','ADJUSTMENT') NOT NULL,

    quantity INT NOT NULL,

    previous_stock INT NOT NULL,

    new_stock INT NOT NULL,

    notes VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);

CREATE TABLE admins (

    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role ENUM('Super Admin','Manager','Staff')
        DEFAULT 'Staff',

    status ENUM('Active','Inactive')
        DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO admins
(
    full_name,
    email,
    password,
    role
)

VALUES
(
    'System Administrator',
    'admin@kleinshoppers.com',
    'admin123',
    'Super Admin'
);

CREATE TABLE payments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    transaction_reference VARCHAR(120),

    external_reference VARCHAR(120),

    phone VARCHAR(20),

    amount DECIMAL(12,2),

    currency VARCHAR(10) DEFAULT 'UGX',

    provider VARCHAR(30) DEFAULT 'YO_PAYMENTS',

    status VARCHAR(30) DEFAULT 'PENDING',

    message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);

CREATE TABLE payment_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    payment_id INT,

    log_type VARCHAR(50),

    response TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE deliveries (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    tracking_number VARCHAR(100) UNIQUE,

    courier_name VARCHAR(150),

    courier_phone VARCHAR(30),

    delivery_address TEXT,

    delivery_fee DECIMAL(12,2) DEFAULT 0,

    estimated_date DATE,

    delivered_date DATE,

    status ENUM(

        'Pending',

        'Picked Up',

        'In Transit',

        'Out For Delivery',

        'Delivered',

        'Cancelled',

        'Returned'

    ) DEFAULT 'Pending',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(order_id)

    REFERENCES orders(id)

    ON DELETE CASCADE

);

CREATE TABLE deliveries (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    customer_name VARCHAR(255),

    phone VARCHAR(50),

    address TEXT,

    rider VARCHAR(255),

    status ENUM(
        'pending',
        'assigned',
        'in_transit',
        'delivered',
        'cancelled'
    )
    DEFAULT 'pending',

    delivered_at DATETIME NULL,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP

);

ALTER TABLE deliveries
ADD tracking_number VARCHAR(100) UNIQUE;

ALTER TABLE deliveries
ADD COLUMN tracking_number VARCHAR(100) UNIQUE AFTER address;

CREATE TABLE emails (

    id INT AUTO_INCREMENT PRIMARY KEY,

    recipient VARCHAR(255) NOT NULL,

    subject VARCHAR(255) NOT NULL,

    message LONGTEXT,

    type ENUM(

        'Newsletter',

        'Promotion',

        'Order',

        'Password Reset',

        'General'

    ) DEFAULT 'General',

    status ENUM(

        'Pending',

        'Sent',

        'Failed'

    ) DEFAULT 'Pending',

    sent_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('orders', 'stock', 'customers', 'reviews', 'delivery') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('read', 'unread') DEFAULT 'unread',
    action_label VARCHAR(100),
    action_url VARCHAR(255),
    metadata JSON,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id),
    INDEX idx_type_status (type, status),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create trigger to update updated_at
DELIMITER //
CREATE TRIGGER update_notifications_updated_at 
BEFORE UPDATE ON notifications 
FOR EACH ROW 
BEGIN 
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Sample data
INSERT INTO notifications (type, title, message, priority, status, metadata) VALUES
('orders', 'New Order #1001', 'Customer John Doe placed a new order', 'high', 'unread', '{"orderId": 1001, "amount": 299.99}'),
('stock', 'Low Stock Alert', 'Product X has only 5 units remaining', 'high', 'unread', '{"productId": 101, "currentStock": 5}'),
('customers', 'New Customer Registration', 'Jane Smith just created an account', 'medium', 'unread', '{"customerId": 201}'),
('reviews', 'Review Pending Approval', 'New review for Product Y needs moderation', 'medium', 'unread', '{"reviewId": 301}'),
('delivery', 'Delivery Update', 'Package #789 is out for delivery', 'low', 'read', '{"deliveryId": 401}');

CREATE TABLE settings (

    id INT AUTO_INCREMENT PRIMARY KEY,

    setting_key VARCHAR(100) UNIQUE,

    setting_value TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);

-- Create couriers table
CREATE TABLE IF NOT EXISTS couriers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('dhl', 'fedex', 'ups', 'rider', 'company_driver') NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    contact_person VARCHAR(100),
    base_charge DECIMAL(10, 2) DEFAULT 0.00,
    per_km_charge DECIMAL(10, 2) DEFAULT 0.00,
    delivery_time_estimate VARCHAR(50),
    service_area TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_deliveries INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    failed_deliveries INT DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create courier tracking table
CREATE TABLE IF NOT EXISTS courier_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    courier_id INT NOT NULL,
    order_id INT,
    tracking_number VARCHAR(100) UNIQUE,
    status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned') DEFAULT 'pending',
    pickup_location TEXT,
    delivery_location TEXT,
    pickup_time DATETIME,
    estimated_delivery DATETIME,
    actual_delivery DATETIME,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    notes TEXT,
    location_history JSON,
    customer_signature VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
    INDEX idx_courier_id (courier_id),
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample couriers
INSERT INTO couriers (name, type, code, email, phone, address, contact_person, base_charge, per_km_charge, delivery_time_estimate, service_area, rating) VALUES
('DHL Express', 'dhl', 'DHL001', 'dhl@kleinshoppers.com', '+1-800-225-5345', '1200 International Pkwy, Miami, FL 33166', 'John Smith', 15.00, 2.50, '1-3 business days', 'International', 4.8),
('FedEx Priority', 'fedex', 'FED001', 'fedex@kleinshoppers.com', '+1-800-463-3339', '942 S Shady Grove Rd, Memphis, TN 38120', 'Sarah Johnson', 12.00, 2.00, '2-4 business days', 'National', 4.6),
('UPS Ground', 'ups', 'UPS001', 'ups@kleinshoppers.com', '+1-800-742-5877', '55 Glenlake Pkwy NE, Atlanta, GA 30328', 'Mike Wilson', 10.00, 1.75, '3-5 business days', 'National', 4.5),
('Swift Rider', 'rider', 'RID001', 'rider@kleinshoppers.com', '+1-555-0123', '456 Main St, City Center', 'David Brown', 5.00, 1.00, 'Same day (within 4 hrs)', 'Local', 4.2),
('Company Driver', 'company_driver', 'COM001', 'driver@kleinshoppers.com', '+1-555-0456', '789 Corporate Dr, Business Park', 'Robert Davis', 8.00, 1.50, 'Next day', 'Regional', 4.4);

-- Insert sample tracking
INSERT INTO courier_tracking (courier_id, order_id, tracking_number, status, pickup_location, delivery_location, estimated_delivery, driver_name, driver_phone) VALUES
(1, 1001, 'DHL123456789', 'in_transit', 'Miami, FL', 'New York, NY', DATE_ADD(NOW(), INTERVAL 2 DAY), 'John Smith', '+1-555-0001'),
(2, 1002, 'FED987654321', 'pending', 'Memphis, TN', 'Los Angeles, CA', DATE_ADD(NOW(), INTERVAL 3 DAY), 'Sarah Johnson', '+1-555-0002'),
(3, 1003, 'UPS456789123', 'delivered', 'Atlanta, GA', 'Chicago, IL', DATE_ADD(NOW(), INTERVAL -1 DAY), 'Mike Wilson', '+1-555-0003'),
(4, 1004, 'RID789123456', 'out_for_delivery', 'City Center', 'Suburb Area', DATE_ADD(NOW(), INTERVAL 2 HOUR), 'David Brown', '+1-555-0004'),
(5, 1005, 'COM321654987', 'picked_up', 'Business Park', 'Industrial Zone', DATE_ADD(NOW(), INTERVAL 1 DAY), 'Robert Davis', '+1-555-0005');

-- Create returns table
CREATE TABLE IF NOT EXISTS returns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    return_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    customer_id INT,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    
    -- Return details
    product_id INT,
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1,
    return_reason ENUM(
        'defective',
        'wrong_item',
        'size_issue',
        'damaged',
        'not_as_described',
        'changed_mind',
        'other'
    ) NOT NULL,
    return_reason_detail TEXT,
    
    -- Financial
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_method ENUM('original_payment', 'store_credit', 'bank_transfer', 'other') DEFAULT 'original_payment',
    
    -- Status tracking
    status ENUM(
        'pending',
        'approved',
        'rejected',
        'processing',
        'shipped',
        'received',
        'refunded',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',
    
    -- Return shipping
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Images/Documents
    images JSON,
    notes TEXT,
    
    -- Approval
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    
    -- Refund
    refund_processed_at DATETIME,
    refund_transaction_id VARCHAR(100),
    
    -- Metadata
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_return_number (return_number),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_created_at (created_at),
    INDEX idx_refund_amount (refund_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create return timeline table
CREATE TABLE IF NOT EXISTS return_timeline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    return_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
    INDEX idx_return_id (return_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create refunds table (separate for detailed tracking)
CREATE TABLE IF NOT EXISTS refunds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    return_id INT NOT NULL,
    order_id INT NOT NULL,
    customer_id INT,
    
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_method ENUM('original_payment', 'store_credit', 'bank_transfer', 'other') NOT NULL,
    
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(100),
    gateway_response JSON,
    
    processed_by INT,
    processed_at DATETIME,
    completed_at DATETIME,
    
    notes TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
    INDEX idx_refund_number (refund_number),
    INDEX idx_return_id (return_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO returns (return_number, order_id, customer_name, customer_email, product_name, quantity, return_reason, refund_amount, status, notes) VALUES
('RET-2024-001', 1001, 'John Doe', 'john@example.com', 'Wireless Headphones', 1, 'defective', 79.99, 'pending', 'Headphones not charging properly'),
('RET-2024-002', 1002, 'Jane Smith', 'jane@example.com', 'Leather Jacket', 1, 'size_issue', 149.99, 'approved', 'Ordered L, received XL'),
('RET-2024-003', 1003, 'Bob Johnson', 'bob@example.com', 'Smart Watch', 1, 'not_as_described', 199.99, 'processing', 'Features not as advertised'),
('RET-2024-004', 1004, 'Alice Brown', 'alice@example.com', 'Running Shoes', 2, 'wrong_item', 89.98, 'received', 'Received wrong color'),
('RET-2024-005', 1005, 'Charlie Wilson', 'charlie@example.com', 'Backpack', 1, 'damaged', 59.99, 'refunded', 'Zipper broken on arrival');

INSERT INTO return_timeline (return_id, status, note) VALUES
(1, 'pending', 'Return request submitted'),
(2, 'pending', 'Return request submitted'),
(2, 'approved', 'Return approved by admin'),
(3, 'pending', 'Return request submitted'),
(3, 'approved', 'Return approved by admin'),
(3, 'processing', 'Return processed for refund');

INSERT INTO refunds (refund_number, return_id, order_id, customer_name, refund_amount, refund_method, status, processed_at) VALUES
('REF-2024-001', 5, 1005, 'Charlie Wilson', 59.99, 'original_payment', 'completed', NOW()),
('REF-2024-002', 2, 1002, 'Jane Smith', 149.99, 'store_credit', 'pending', NULL);


ALTER TABLE customers

ADD COLUMN verified TINYINT(1) NOT NULL DEFAULT 0 AFTER status,

ADD COLUMN verification_token VARCHAR(255) NULL AFTER verified,

ADD COLUMN reset_token VARCHAR(255) NULL AFTER verification_token,

ADD COLUMN reset_expires DATETIME NULL AFTER reset_token,

ADD COLUMN remember_token VARCHAR(255) NULL AFTER reset_expires,

ADD COLUMN failed_attempts INT NOT NULL DEFAULT 0 AFTER remember_token,

ADD COLUMN locked_until DATETIME NULL AFTER failed_attempts,

ADD COLUMN last_login DATETIME NULL AFTER locked_until,

ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

DESCRIBE customers;

-- Run this in your MySQL database
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gift_cards table
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
);

-- Create gift_card_transactions table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gift_card_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('created', 'redeemed', 'refunded') NOT NULL,
    note TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id) ON DELETE CASCADE
);

-- Run this in MySQL Workbench to add support tables to your existing database
USE your_existing_database;

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_agent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_chat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_agent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

USE your_existing_database;

-- CMS Pages Table
CREATE TABLE IF NOT EXISTS cms_pages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT,
    content TEXT,
    status ENUM('published', 'draft') DEFAULT 'draft',
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS cms_blog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT,
    featured_image VARCHAR(255),
    category VARCHAR(100),
    tags VARCHAR(500),
    author_id INT,
    status ENUM('published', 'draft') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- FAQ Table
CREATE TABLE IF NOT EXISTS cms_faq (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    sort_order INT DEFAULT 0,
    status ENUM('published', 'draft') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default pages
INSERT INTO cms_pages (slug, title, content, status) VALUES
('about-us', 'About Us', '<h2>About Our Company</h2><p>We are dedicated to providing excellent service...</p>', 'published'),
('privacy-policy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Your privacy is important to us...</p>', 'published'),
('terms', 'Terms and Conditions', '<h2>Terms and Conditions</h2><p>By using our service, you agree to these terms...</p>', 'published');

-- Insert sample FAQs
INSERT INTO cms_faq (question, answer, category, sort_order) VALUES
('How do I create an account?', 'Click the Sign Up button and fill in your details.', 'Account', 1),
('How can I reset my password?', 'Click Forgot Password on the login page.', 'Account', 2),
('What payment methods do you accept?', 'We accept credit cards, PayPal, and bank transfers.', 'Payments', 1),
('How long does shipping take?', 'Standard shipping takes 3-5 business days.', 'Shipping', 1);

