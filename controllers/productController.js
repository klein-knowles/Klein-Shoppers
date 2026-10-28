const Product = require("../models/productModel");

// ======================================
// Get All Products
// Supports Search & Filters
// ======================================

exports.getAllProducts = (req, res) => {

    const filters = {

        search: req.query.search || "",

        category: req.query.category || "",

        brand: req.query.brand || "",

        minPrice: req.query.minPrice || 0,

        maxPrice: req.query.maxPrice || 999999999,

        rating: req.query.rating || 0,

        stock: req.query.stock || "",

        sort: req.query.sort || ""

    };

    Product.search(filters, (err, products) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load products."
            });

        }

        res.json(products);

    });

};

// ======================================
// Get One Product
// ======================================

exports.getProduct = (req, res) => {

    Product.getById(req.params.id, (err, rows) => {

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

        res.json(rows[0]);

    });

};

// ======================================
// Update Product
// ======================================

exports.updateProduct = (req, res) => {

    Product.update(

        req.params.id,

        req.body,

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

};

// ======================================
// Add New Product (ADMIN)
// ======================================

exports.addProduct = (req, res) => {


    const product = {


        name:
        req.body.name,


        description:
        req.body.description,


        category:
        req.body.category,


        brand:
        req.body.brand,


        price:
        req.body.price,


        stock:
        req.body.stock,


        badge:
        req.body.badge,


        rating:
        req.body.rating,


        tags:
        req.body.tags,


        specifications:
        req.body.specifications,


        image:
        req.file
        ?
        req.file.filename
        :
        null


    };



    Product.create(

        product,

        (err, result)=>{


            if(err){


                console.error(err);


                return res.status(500).json({

                    success:false,

                    message:
                    "Unable to add product."

                });


            }



            res.json({

                success:true,

                message:
                "Product added successfully.",

                product_id:
                result.insertId

            });



        }

    );


};






// ======================================
// Delete Product (ADMIN)
// ======================================

exports.deleteProduct = (req,res)=>{


    Product.delete(

        req.params.id,

        (err)=>{


            if(err){


                console.error(err);


                return res.status(500).json({

                    success:false,

                    message:
                    "Unable to delete product."

                });


            }



            res.json({

                success:true,

                message:
                "Product deleted successfully."

            });


        }

    );


};