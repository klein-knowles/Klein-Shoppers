const Coupon = require("../models/Coupon");

// =====================================
// Get All Coupons
// =====================================

exports.getCoupons = (req, res) => {

    Coupon.getAll((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load coupons."
            });

        }

        res.json(rows);

    });

};

// =====================================
// Add Coupon
// =====================================

exports.addCoupon = (req, res) => {

    Coupon.add(req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to add coupon."
            });

        }

        res.json({

            success: true,

            message: "Coupon created successfully."

        });

    });

};

// =====================================
// Validate Coupon
// =====================================

exports.validateCoupon = (req, res) => {

    Coupon.getByCode(req.body.code, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database error."
            });

        }

        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Invalid or expired coupon."

            });

        }

        res.json({

            success: true,

            coupon: rows[0]

        });

    });

};

// =====================================
// Delete Coupon
// =====================================

exports.deleteCoupon = (req, res) => {

    Coupon.delete(req.params.id, err => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to delete coupon."
            });

        }

        res.json({

            success: true,

            message: "Coupon deleted."

        });

    });

};