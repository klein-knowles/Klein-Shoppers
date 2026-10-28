const express = require("express");

const router = express.Router();

const couponController =
    require("../controllers/couponController");
const adminAuth = require("../middleware/adminAuth");

// ================================
// Get All Coupons
// ================================

router.get("/", adminAuth, couponController.getCoupons);

// ================================
// Add Coupon
// ================================

router.post("/add", adminAuth, couponController.addCoupon);

// ================================
// Validate Coupon
// ================================

router.post("/validate", couponController.validateCoupon);

// ================================
// Delete Coupon
// ================================

router.delete("/:id", adminAuth, couponController.deleteCoupon);

module.exports = router;
