const Category = require("../models/categoryModel");

// ======================================
// Get All Categories
// ======================================

exports.getCategories = (req, res) => {

    Category.getAll((err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch categories."
            });
        }

        res.json(results);

    });

};


// ======================================
// Get One Category
// ======================================

exports.getCategory = (req, res) => {

    Category.getById(req.params.id, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch category."
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Category not found."
            });

        }

        res.json(results[0]);

    });

};


// ======================================
// Create Category
// ======================================

exports.createCategory = (req, res) => {

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
                message: "Unable to create category."
            });

        }

        res.json({
            success: true,
            message: "Category created successfully."
        });

    });

};


// ======================================
// Update Category
// ======================================

exports.updateCategory = (req, res) => {

    Category.getById(req.params.id, (err, rows) => {

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

        const category = {

            name: req.body.name,
            description: req.body.description,
            image: req.file
                ? req.file.filename
                : rows[0].image

        };

        Category.update(req.params.id, category, (err) => {

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

};


// ======================================
// Delete Category
// ======================================

exports.deleteCategory = (req, res) => {

    Category.delete(req.params.id, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to delete category."
            });

        }

        res.json({
            success: true,
            message: "Category deleted successfully."
        });

    });

};