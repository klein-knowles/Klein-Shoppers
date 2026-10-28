const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/paymentController");

const adminAuth = require("../middleware/adminAuth");

// =========================================
// Customer Payment
// =========================================

router.post(

    "/pay",

    paymentController.pay

);

// =========================================
// Check Status
// =========================================

router.get(

    "/status/:reference",

    paymentController.status

);

// =========================================
// Callback
// =========================================

router.post(

    "/callback",

    paymentController.callback

);

// =========================================
// Webhook
// =========================================

router.post(

    "/webhook",

    paymentController.webhook

);

// =========================================
// Payment History
// =========================================

router.get(

    "/history",

    adminAuth,

    paymentController.history

);

module.exports = router;