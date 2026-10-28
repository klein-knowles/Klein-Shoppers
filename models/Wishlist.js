const db = require("../config/db");

const Wishlist = {

    // ================================
    // Get Customer Wishlist
    // ================================

    getAll(customerId, callback) {

        const sql = `

            SELECT

                wishlist.id,

                products.*

            FROM wishlist

            INNER JOIN products

                ON wishlist.product_id = products.id

            WHERE wishlist.customer_id = ?

            ORDER BY wishlist.created_at DESC

        `;

        db.query(sql, [customerId], callback);

    },

    // ================================
    // Add Product
    // ================================

    add(customerId, productId, callback) {

        db.query(

            `

            INSERT IGNORE INTO wishlist

            (

                customer_id,

                product_id

            )

            VALUES (?, ?)

            `,

            [

                customerId,

                productId

            ],

            callback

        );

    },

    // ================================
    // Remove Product
    // ================================

    remove(customerId, productId, callback) {

        db.query(

            `

            DELETE FROM wishlist

            WHERE customer_id=?

            AND product_id=?

            `,

            [

                customerId,

                productId

            ],

            callback

        );

    }

};

module.exports = Wishlist;