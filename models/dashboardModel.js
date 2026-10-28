const db = require("../config/db");

const Dashboard = {};

// ======================================
// Dashboard Statistics
// ======================================

Dashboard.getStats = (callback) => {

    const sql = `
        SELECT

        (SELECT COUNT(*) FROM products) AS totalProducts,

        (SELECT COUNT(*) FROM customers) AS totalCustomers,

        (SELECT COUNT(*) FROM orders) AS totalOrders,

        (SELECT IFNULL(SUM(total_amount),0) FROM orders) AS totalRevenue,

        (SELECT IFNULL(SUM(total_amount),0)
         FROM orders
         WHERE DATE(created_at)=CURDATE()) AS todayRevenue,

        (SELECT COUNT(*)
         FROM orders
         WHERE DATE(created_at)=CURDATE()) AS todayOrders
    `;

    db.query(sql, callback);

};

// ======================================
// Monthly Revenue
// ======================================

Dashboard.monthlyRevenue = (callback) => {

    const sql = `

    SELECT

        DATE_FORMAT(created_at,'%b') AS month,

        SUM(total_amount) AS revenue

    FROM orders

    GROUP BY MONTH(created_at)

    ORDER BY MONTH(created_at)

    `;

    db.query(sql, callback);

};

// ======================================
// Recent Orders
// ======================================

Dashboard.recentOrders = (callback) => {

    db.query(

        `

        SELECT

            id,

            customer_name,

            total_amount,

            payment_status,

            created_at

        FROM orders

        ORDER BY created_at DESC

        LIMIT 10

        `,

        callback

    );

};

// ======================================
// Low Stock
// ======================================

Dashboard.lowStock = (callback) => {

    db.query(

        `

        SELECT

            id,

            name,

            stock

        FROM products

        WHERE stock<=5

        ORDER BY stock ASC

        `,

        callback

    );

};

// ======================================
// Best Sellers
// ======================================

Dashboard.bestSelling = (callback) => {

    db.query(

        `

        SELECT

            p.name,

            SUM(oi.quantity) AS sold

        FROM order_items oi

        INNER JOIN products p

            ON oi.product_id=p.id

        GROUP BY oi.product_id

        ORDER BY sold DESC

        LIMIT 10

        `,

        callback

    );

};

module.exports = Dashboard;