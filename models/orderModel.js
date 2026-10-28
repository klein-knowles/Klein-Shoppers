const db = require("../config/db");

const Order = {

    // ==========================================
    // CUSTOMER
    // ==========================================

    create(order, callback) {

        const sql = `

            INSERT INTO orders
            (
                customer_id,
                total,
                payment_method,
                payment_status,
                status
            )

            VALUES (?, ?, ?, ?, ?)

        `;

        db.query(

            sql,

            [

                order.customer_id,
                order.total,
                order.payment_method,
                order.payment_status,
                order.status

            ],

            callback

        );

    },

    addItem(item, callback) {

        db.query(

            `

            INSERT INTO order_items

            (

                order_id,
                product_id,
                quantity,
                price

            )

            VALUES (?, ?, ?, ?)

            `,

            [

                item.order_id,
                item.product_id,
                item.quantity,
                item.price

            ],

            callback

        );

    },

    getCustomerOrders(customerId, callback) {

        db.query(

            `

            SELECT *

            FROM orders

            WHERE customer_id=?

            ORDER BY created_at DESC

            `,

            [customerId],

            callback

        );

    },

    // ==========================================
    // ADMIN
    // ==========================================

    getAll(callback) {

        const sql = `

            SELECT

                orders.*,

                customers.first_name,

                customers.last_name,

                customers.email

            FROM orders

            INNER JOIN customers

                ON orders.customer_id = customers.id

            ORDER BY orders.created_at DESC

        `;

        db.query(sql, callback);

    },

    getById(id, callback) {

        const sql = `

            SELECT

                orders.*,

                customers.first_name,

                customers.last_name,

                customers.email,

                customers.phone

            FROM orders

            INNER JOIN customers

                ON orders.customer_id = customers.id

            WHERE orders.id = ?

        `;

        db.query(sql, [id], callback);

    },

    getItems(orderId, callback) {

        const sql = `

            SELECT

                order_items.*,

                products.name,

                products.image

            FROM order_items

            INNER JOIN products

                ON products.id = order_items.product_id

            WHERE order_items.order_id = ?

        `;

        db.query(sql, [orderId], callback);

    },

    updateStatus(id, status, callback) {

        db.query(

            "UPDATE orders SET status=? WHERE id=?",

            [

                status,

                id

            ],

            callback

        );

    },

    updatePayment(id, paymentStatus, callback) {

        db.query(

            "UPDATE orders SET payment_status=? WHERE id=?",

            [

                paymentStatus,

                id

            ],

            callback

        );

    }

};

module.exports = Order;