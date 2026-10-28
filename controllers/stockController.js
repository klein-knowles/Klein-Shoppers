const Product = require("../models/productModel");
const StockMovement = require("../models/StockMovement");

// =====================================
// Inventory List
// =====================================

exports.getInventory = (req, res) => {

    Product.getAll((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load inventory."
            });

        }

        res.json(rows);

    });

};

// =====================================
// Stock History
// =====================================

exports.getStockHistory = (req, res) => {

    StockMovement.getAll((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load stock history."
            });

        }

        res.json(rows);

    });

};

// =====================================
// Restock Product
// =====================================

exports.restockProduct = (req, res) => {

    const productId = req.params.id;

    const quantity = parseInt(req.body.quantity);

    const notes = req.body.notes || "Product Restocked";

    Product.getById(productId, (err, rows) => {

        if (err)
            return res.status(500).json(err);

        if (rows.length === 0) {

            return res.status(404).json({
                message: "Product not found."
            });

        }

        const product = rows[0];

        const previousStock = Number(product.stock);

        const newStock = previousStock + quantity;

        Product.updateStock(productId, newStock, (err) => {

            if (err)
                return res.status(500).json(err);

            StockMovement.add({

                product_id: productId,

                movement_type: "IN",

                quantity,

                previous_stock: previousStock,

                new_stock: newStock,

                notes

            }, (err) => {

                if (err)
                    return res.status(500).json(err);

                res.json({

                    success: true,

                    message: "Product restocked successfully."

                });

            });

        });

    });

};