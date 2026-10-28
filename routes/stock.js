const express = require("express");

const router = express.Router();

const stockController =
require("../controllers/stockController");

// Inventory

router.get("/", stockController.getInventory);

// History

router.get("/history", stockController.getStockHistory);

// Restock

router.put("/restock/:id", stockController.restockProduct);

module.exports = router;
