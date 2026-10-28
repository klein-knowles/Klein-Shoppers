const express = require("express");

const router = express.Router();

const couponController =
    require("../controllers/couponController");

// ================================
// Get All Coupons
// ================================

router.get("/", couponController.getCoupons);

// ================================
// Add Coupon
// ================================

router.post("/add", couponController.addCoupon);

// ================================
// Validate Coupon
// ================================

router.post("/validate", couponController.validateCoupon);

// ================================
// Delete Coupon
// ================================

router.delete("/:id", couponController.deleteCoupon);

module.exports = router;
