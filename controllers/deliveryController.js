const Delivery = require("../models/deliveryModel");

// =========================================
// GET ALL DELIVERIES
// =========================================

exports.getAllDeliveries = (req, res) => {

    Delivery.getAll((err, deliveries) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load deliveries."
            });

        }

        res.json(deliveries);

    });

};

// =========================================
// DELIVERY STATISTICS
// =========================================

exports.statistics = (req, res) => {

    Delivery.stats((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load delivery statistics."
            });

        }

        res.json(rows[0] || {});

    });

};

// =========================================
// TRACK DELIVERY
// =========================================

exports.trackDelivery = (req, res) => {

    Delivery.getByTracking(req.params.tracking, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to track delivery."
            });

        }

        if (!rows.length) {

            return res.status(404).json({
                success: false,
                message: "Tracking number not found."
            });

        }

        res.json(rows[0]);

    });

};

// =========================================
// GET SINGLE DELIVERY
// =========================================

exports.getDelivery = (req, res) => {

    Delivery.getById(req.params.id, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load delivery."
            });

        }

        if (!rows.length) {

            return res.status(404).json({
                success: false,
                message: "Delivery not found."
            });

        }

        res.json(rows[0]);

    });

};

// =========================================
// CREATE DELIVERY
// =========================================

exports.createDelivery = (req, res) => {

    const data = {
        ...req.body,
        tracking_number: req.body.tracking_number || `KLS-${Date.now()}`,
        status: req.body.status || "Pending"
    };

    Delivery.create(data, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to create delivery."
            });

        }

        res.status(201).json({
            success: true,
            message: "Delivery created successfully.",
            delivery_id: result.insertId,
            tracking_number: data.tracking_number
        });

    });

};

// =========================================
// UPDATE DELIVERY
// =========================================

exports.updateDelivery = (req, res) => {

    Delivery.update(req.params.id, req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to update delivery."
            });

        }

        res.json({
            success: true,
            message: "Delivery updated successfully."
        });

    });

};

// =========================================
// DELETE DELIVERY
// =========================================

exports.deleteDelivery = (req, res) => {

    Delivery.delete(req.params.id, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to delete delivery."
            });

        }

        res.json({
            success: true,
            message: "Delivery deleted successfully."
        });

    });

};
