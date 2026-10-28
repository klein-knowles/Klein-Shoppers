const db = require("../config/db");

const Coupon = {

    // ================================
    // Get All Coupons
    // ================================

    getAll(callback) {

        db.query(

            "SELECT * FROM coupons ORDER BY id DESC",

            callback

        );

    },

    // ================================
    // Get Coupon By Code
    // ================================

    getByCode(code, callback) {

        db.query(

            `
            SELECT *
            FROM coupons
            WHERE code=?
            AND status='Active'
            AND expiry_date>=CURDATE()
            `,

            [code],

            callback

        );

    },

    // ================================
    // Add Coupon
    // ================================

    add(coupon, callback) {

        db.query(

            `
            INSERT INTO coupons
            (
                code,
                discount_type,
                discount_value,
                minimum_order,
                expiry_date,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,

            [

                coupon.code,

                coupon.discount_type,

                coupon.discount_value,

                coupon.minimum_order,

                coupon.expiry_date,

                coupon.status

            ],

            callback

        );

    },

    // ================================
    // Delete Coupon
    // ================================

    delete(id, callback) {

        db.query(

            "DELETE FROM coupons WHERE id=?",

            [id],

            callback

        );

    }

};

module.exports = Coupon;