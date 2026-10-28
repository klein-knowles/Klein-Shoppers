const express = require("express");

const router = express.Router();

const adminOrderController =
    require("../controllers/adminOrderController");

// ===========================================
// GET ALL ORDERS
// ===========================================

router.get(
    "/",
    adminOrderController.getAllOrders
);

// ===========================================
// GET ONE ORDER
// ===========================================

router.get(
    "/:id",
    adminOrderController.getOrder
);

// ===========================================
// UPDATE ORDER STATUS
// ===========================================

router.put(
    "/status/:id",
    adminOrderController.updateStatus
);

// ===========================================
// UPDATE PAYMENT STATUS
// ===========================================

router.put(
    "/payment/:id",
    adminOrderController.updatePaymentStatus
);

module.exports = router;