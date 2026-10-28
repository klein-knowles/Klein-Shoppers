const express = require("express");

const router = express.Router();

const cartController = require("../controllers/cartController");

// ===========================================
// View Cart
// ===========================================

router.get(
    "/",
    cartController.getCart
);

// ===========================================
// Add To Cart
// ===========================================

router.post(
    "/add",
    cartController.addToCart
);

// ===========================================
// Increase Quantity
// ===========================================

router.put(
    "/increase/:id",
    cartController.increaseQuantity
);

// ===========================================
// Decrease Quantity
// ===========================================

router.put(
    "/decrease/:id",
    cartController.decreaseQuantity
);

// ===========================================
// Remove Item
// ===========================================

router.delete(
    "/remove/:id",
    cartController.removeItem
);

// ===========================================
// Clear Cart
// ===========================================

router.delete(
    "/clear",
    cartController.clearCart
);

module.exports = router;
