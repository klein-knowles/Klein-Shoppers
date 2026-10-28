const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const adminAuth = require("../middleware/adminAuth");

// ======================================
// Dashboard Summary
// ======================================

router.get(

    "/",

    adminAuth,

    dashboardController.getDashboard

);

// ======================================
// Dashboard Statistics
// ======================================

router.get(

    "/stats",

    adminAuth,

    dashboardController.getStats

);

// ======================================
// Monthly Revenue
// ======================================

router.get(

    "/monthly-revenue",

    adminAuth,

    dashboardController.getMonthlyRevenue

);

// ======================================
// Recent Orders
// ======================================

router.get(

    "/recent-orders",

    adminAuth,

    dashboardController.getRecentOrders

);

// ======================================
// Low Stock
// ======================================

router.get(

    "/low-stock",

    adminAuth,

    dashboardController.getLowStock

);

// ======================================
// Best Selling Products
// ======================================

router.get(

    "/best-selling",

    adminAuth,

    dashboardController.getBestSelling

);

module.exports = router;