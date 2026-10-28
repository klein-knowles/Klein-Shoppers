const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const adminCategories = require("../models/adminCategories");

const fs = require("fs");
const path = require("path");

// ======================================================
// ADD CATEGORY
// ======================================================

router.post("/add", upload.single("image"), (req, res) => {

    const category = {

        name: req.body.name,
        description: req.body.description,
        image: req.file ? req.file.filename : null

    };

    Category.create(category, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to add category."
            });

        }

        res.json({
            success: true,
            message: "Category added successfully."
        });

    });

});


// ======================================================
// UPDATE CATEGORY
// ======================================================

router.put("/update/:id", upload.single("image"), (req, res) => {

    const id = req.params.id;

    Category.getById(id, (err, rows) => {

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
                message: "Category not found."
            });

        }

        let image = rows[0].image;

        if (req.file) {

            // Delete old image
            if (image) {

                const oldImage = path.join(
                    __dirname,
                    "../public/uploads",
                    image
                );

                if (fs.existsSync(oldImage)) {

                    fs.unlinkSync(oldImage);

                }

            }

            image = req.file.filename;

        }

        const category = {

            name: req.body.name,
            description: req.body.description,
            image

        };

        Category.update(id, category, (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to update category."
                });

            }

            res.json({
                success: true,
                message: "Category updated successfully."
            });

        });

    });

});


// ======================================================
// DELETE CATEGORY
// ======================================================

router.delete("/delete/:id", (req, res) => {

    const id = req.params.id;

    Category.getById(id, (err, rows) => {

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
                message: "Category not found."
            });

        }

        const image = rows[0].image;

        Category.delete(id, (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to delete category."
                });

            }

            if (image) {

                const imagePath = path.join(
                    __dirname,
                    "../public/uploads",
                    image
                );

                if (fs.existsSync(imagePath)) {

                    fs.unlinkSync(imagePath);

                }

            }

            res.json({
                success: true,
                message: "Category deleted successfully."
            });

        });

    });

});

module.exports = router;