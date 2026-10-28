const Order = require("../models/orderModel");

// ===========================================
// GET ALL ORDERS
// ===========================================

exports.getAllOrders = (req, res) => {

    Order.getAll((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load orders."
            });

        }

        res.json(rows);

    });

};


// ===========================================
// GET SINGLE ORDER
// ===========================================

exports.getOrder = (req, res) => {

    const id = req.params.id;

    Order.getById(id, (err, orderRows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database error."
            });

        }

        if (orderRows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Order not found."
            });

        }

        Order.getItems(id, (err, itemRows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to load order items."
                });

            }

            res.json({

                order: orderRows[0],

                items: itemRows

            });

        });

    });

};


// ===========================================
// UPDATE ORDER STATUS
// ===========================================

exports.updateStatus = (req, res) => {

    const id = req.params.id;

    const { status } = req.body;

    Order.updateStatus(id, status, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to update order status."
            });

        }

        res.json({

            success: true,

            message: "Order status updated."

        });

    });

};


// ===========================================
// UPDATE PAYMENT STATUS
// ===========================================

exports.updatePaymentStatus = (req, res) => {

    const id = req.params.id;

    const { payment_status } = req.body;

    Order.updatePayment(id, payment_status, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to update payment status."
            });

        }

        res.json({

            success: true,

            message: "Payment status updated."

        });

    });

};
