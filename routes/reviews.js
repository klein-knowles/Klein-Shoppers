const express = require("express");

const router = express.Router();

const reviewController = require("../controllers/reviewController");
const customerAuth = require("../middleware/customerAuth");
const adminAuth = require("../middleware/adminAuth");

// ======================================
// Add Review
// ======================================

router.post(
    "/add",
    customerAuth,
    reviewController.addReview
);

// ======================================
// Product Reviews
// ======================================

router.get(
    "/product/:productId",
    reviewController.getReviews
);

// ======================================
// Average Rating
// ======================================

router.get(
    "/average/:productId",
    reviewController.getAverage
);

router.delete("/:id", adminAuth, reviewController.deleteReview);

module.exports = router;
