const db = require("../config/db");

const Cart = {

    // ===============================
    // Get Customer Cart
    // ===============================

    getCart(customerId, callback) {

        const sql = `

            SELECT

                cart.id,

                cart.quantity,

                products.id AS product_id,

                products.name,

                products.price,

                products.image,

                products.stock

            FROM cart

            INNER JOIN products

                ON cart.product_id = products.id

            WHERE cart.customer_id = ?

            ORDER BY cart.id DESC

        `;

        db.query(sql, [customerId], callback);

    },

    // ===============================
    // Check if Product Exists in Cart
    // ===============================

    getItem(customerId, productId, callback) {

        db.query(

            "SELECT * FROM cart WHERE customer_id=? AND product_id=?",

            [customerId, productId],

            callback

        );

    },

    // ===============================
    // Add New Item
    // ===============================

    add(customerId, productId, quantity, callback) {

        db.query(

            `

            INSERT INTO cart

            (

                customer_id,

                product_id,

                quantity

            )

            VALUES (?, ?, ?)

            `,

            [

                customerId,

                productId,

                quantity

            ],

            callback

        );

    },

    // ===============================
    // Update Quantity
    // ===============================

    updateQuantity(id, quantity, callback) {

        db.query(

            "UPDATE cart SET quantity=? WHERE id=?",

            [

                quantity,

                id

            ],

            callback

        );

    },

    // ===============================
    // Remove Item
    // ===============================

    remove(id, callback) {

        db.query(

            "DELETE FROM cart WHERE id=?",

            [id],

            callback

        );

    },

    // ===============================
    // Clear Cart
    // ===============================

    clear(customerId, callback) {

        db.query(

            "DELETE FROM cart WHERE customer_id=?",

            [customerId],

            callback

        );

    }

};

module.exports = Cart;