const db = require("../config/db");

const Inventory = {

    // =====================================
    // Get All Products with Stock
    // =====================================

    getAll(callback) {

        db.query(

            `
            SELECT
                id,
                name,
                category,
                stock
            FROM products
            ORDER BY name
            `,

            callback

        );

    },

    // =====================================
    // Update Stock
    // =====================================

    updateStock(id, stock, callback) {

        db.query(

            "UPDATE products SET stock=? WHERE id=?",

            [stock, id],

            callback

        );

    },

    // =====================================
    // Get Stock
    // =====================================

    getStock(id, callback) {

        db.query(

            "SELECT stock FROM products WHERE id=?",

            [id],

            callback

        );

    },

    // =====================================
    // Save Inventory History
    // =====================================

    addHistory(data, callback) {

        db.query(

            `
            INSERT INTO inventory_history
            (
                product_id,
                previous_stock,
                new_stock,
                quantity_changed,
                action,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,

            [

                data.product_id,

                data.previous_stock,

                data.new_stock,

                data.quantity_changed,

                data.action,

                data.notes

            ],

            callback

        );

    }

};

module.exports = Inventory;