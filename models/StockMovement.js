const db = require("../config/db");

const StockMovement = {

    // ======================================
    // Get All Stock Movements
    // ======================================

    getAll(callback) {

        db.query(

            `
            SELECT

                stock_movements.*,

                products.name

            FROM stock_movements

            INNER JOIN products

                ON products.id = stock_movements.product_id

            ORDER BY stock_movements.created_at DESC
            `,

            callback

        );

    },

    // ======================================
    // Add Movement
    // ======================================

    add(movement, callback) {

        db.query(

            `
            INSERT INTO stock_movements
            (
                product_id,
                movement_type,
                quantity,
                previous_stock,
                new_stock,
                notes
            )

            VALUES (?, ?, ?, ?, ?, ?)
            `,

            [

                movement.product_id,

                movement.movement_type,

                movement.quantity,

                movement.previous_stock,

                movement.new_stock,

                movement.notes

            ],

            callback

        );

    }

};

module.exports = StockMovement;