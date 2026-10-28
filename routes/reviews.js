const express = require("express");

const router = express.Router();

const reviewController = require("../controllers/reviewController");

// ======================================
// Add Review
// ======================================

router.post(
    "/add",
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

module.exports = router;
