const Cart = require("../models/Cart");

// ===========================================
// VIEW CART
// ===========================================

exports.getCart = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }

    Cart.getCart(req.session.customer.id, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load cart."
            });

        }

        res.json(rows);

    });

};


// ===========================================
// ADD TO CART
// ===========================================

exports.addToCart = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }

    const customerId = req.session.customer.id;

    const productId = req.body.product_id;

    const quantity = parseInt(req.body.quantity || 1);

    Cart.getItem(customerId, productId, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database error."
            });

        }

        // Product already exists in cart
        if (rows.length > 0) {

            const item = rows[0];

            const newQuantity = item.quantity + quantity;

            Cart.updateQuantity(item.id, newQuantity, (err) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to update cart."
                    });

                }

                res.json({

                    success: true,

                    message: "Cart updated successfully."

                });

            });

        }

        // New product
        else {

            Cart.add(customerId, productId, quantity, (err) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to add product."
                    });

                }

                res.json({

                    success: true,

                    message: "Product added to cart."

                });

            });

        }

    });

};


// ===========================================
// INCREASE QUANTITY
// ===========================================

exports.increaseQuantity = (req, res) => {

    const id = req.params.id;

    Cart.getCart(req.session.customer.id, (err, rows) => {

        if (err) {

            return res.status(500).json(err);

        }

        const item = rows.find(i => i.id == id);

        if (!item) {

            return res.status(404).json({
                success: false,
                message: "Item not found."
            });

        }

        Cart.updateQuantity(

            id,

            item.quantity + 1,

            (err) => {

                if (err) {

                    return res.status(500).json(err);

                }

                res.json({

                    success: true,

                    message: "Quantity increased."

                });

            }

        );

    });

};


// ===========================================
// DECREASE QUANTITY
// ===========================================

exports.decreaseQuantity = (req, res) => {

    const id = req.params.id;

    Cart.getCart(req.session.customer.id, (err, rows) => {

        if (err) {

            return res.status(500).json(err);

        }

        const item = rows.find(i => i.id == id);

        if (!item) {

            return res.status(404).json({
                success: false,
                message: "Item not found."
            });

        }

        if (item.quantity <= 1) {

            return Cart.remove(id, (err) => {

                if (err) {

                    return res.status(500).json(err);

                }

                res.json({

                    success: true,

                    message: "Item removed."

                });

            });

        }

        Cart.updateQuantity(

            id,

            item.quantity - 1,

            (err) => {

                if (err) {

                    return res.status(500).json(err);

                }

                res.json({

                    success: true,

                    message: "Quantity decreased."

                });

            }

        );

    });

};


// ===========================================
// REMOVE ITEM
// ===========================================

exports.removeItem = (req, res) => {

    Cart.remove(req.params.id, (err) => {

        if (err) {

            return res.status(500).json(err);

        }

        res.json({

            success: true,

            message: "Item removed successfully."

        });

    });

};


// ===========================================
// CLEAR CART
// ===========================================

exports.clearCart = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({

            success: false,

            message: "Please login first."

        });

    }

    Cart.clear(req.session.customer.id, (err) => {

        if (err) {

            return res.status(500).json(err);

        }

        res.json({

            success: true,

            message: "Cart cleared."

        });

    });

};