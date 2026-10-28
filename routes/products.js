const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");

// ======================================
// Get all products
// Supports Search & Filters
// ======================================

router.get("/", productController.getAllProducts);

// ======================================
// Get single product
// ======================================

router.get("/:id", productController.getProduct);

// ======================================
// Update product
// ======================================

router.put("/:id", productController.updateProduct);

module.exports = router;
