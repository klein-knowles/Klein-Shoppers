const express = require("express");

const router = express.Router();

const deliveryController =
require("../controllers/deliveryController");

const adminAuth =
require("../middleware/adminAuth");

// =========================================
// Statistics
// =========================================

router.get(

    "/stats",

    adminAuth,

    deliveryController.statistics

);

// =========================================
// Tracking
// =========================================

router.get(

    "/track/:tracking",

    deliveryController.trackDelivery

);

// =========================================
// All Deliveries
// =========================================

router.get(

    "/",

    adminAuth,

    deliveryController.getAllDeliveries

);

// =========================================
// Single Delivery
// =========================================

router.get(

    "/:id",

    adminAuth,

    deliveryController.getDelivery

);

// =========================================
// Create
// =========================================

router.post(

    "/",

    adminAuth,

    deliveryController.createDelivery

);

// =========================================
// Update
// =========================================

router.put(

    "/:id",

    adminAuth,

    deliveryController.updateDelivery

);

// =========================================
// Delete
// =========================================

router.delete(

    "/:id",

    adminAuth,

    deliveryController.deleteDelivery

);

module.exports = router;