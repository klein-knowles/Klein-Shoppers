const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const db = require("../config/db");

const fs = require("fs");
const path = require("path");


// ======================================================
// ADD PRODUCT
// ======================================================

router.post("/add", upload.single("image"), (req, res) => {

    const {
        name,
        description,
        category,
        brand,
        price,
        stock,
        badge,
        rating,
        tags,
        specifications
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO products
        (
            name,
            description,
            category,
            price,
            stock,
            image,
            brand,
            badge,
            rating,
            tags,
            specifications
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            description,
            category,
            price,
            stock,
            image,
            brand,
            badge,
            rating,
            tags,
            specifications
        ],
        (err) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to add product."
                });
            }

            res.json({
                success: true,
                message: "Product added successfully."
            });

        }
    );

});


// ======================================================
// UPDATE PRODUCT
// ======================================================

router.put("/update/:id", upload.single("image"), (req, res) => {

    const {
        name,
        description,
        category,
        brand,
        price,
        stock,
        badge,
        rating,
        tags,
        specifications
    } = req.body;

    db.query(
        "SELECT image FROM products WHERE id=?",
        [req.params.id],
        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }

            if (rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });

            }

            let image = rows[0].image;

            if (req.file) {

                image = req.file.filename;

            }

            const sql = `
                UPDATE products
                SET
                    name=?,
                    description=?,
                    category=?,
                    brand=?,
                    price=?,
                    stock=?,
                    image=?,
                    badge=?,
                    rating=?,
                    tags=?,
                    specifications=?
                WHERE id=?
            `;

            db.query(
                sql,
                [
                    name,
                    description,
                    category,
                    brand,
                    price,
                    stock,
                    image,
                    badge,
                    rating,
                    tags,
                    specifications,
                    req.params.id
                ],
                (err) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Unable to update product."
                        });

                    }

                    res.json({
                        success: true,
                        message: "Product updated successfully."
                    });

                }
            );

        }
    );

});


// ======================================================
// DELETE PRODUCT
// ======================================================

router.delete("/delete/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT image FROM products WHERE id=?",
        [id],
        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }

            if (rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });

            }

            const image = rows[0].image;

            db.query(
                "DELETE FROM products WHERE id=?",
                [id],
                (err) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Unable to delete product."
                        });

                    }

                    if (image) {

                        const imagePath = path.join(
                            __dirname,
                            "../public/uploads",
                            image
                        );

                        if (fs.existsSync(imagePath)) {

                            fs.unlink(imagePath, (err) => {

                                if (err) {

                                    console.log("Unable to delete image.");

                                }

                            });

                        }

                    }

                    res.json({
                        success: true,
                        message: "Product deleted successfully."
                    });

                }
            );

        }
    );

});

module.exports = router;