const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

// ===========================================
// GET ALL CATEGORIES
// ===========================================

router.get("/", categoryController.getCategories);

// ===========================================
// GET SINGLE CATEGORY
// ===========================================

router.get("/:id", categoryController.getCategory);

module.exports = router;