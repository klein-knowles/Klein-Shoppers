const Wishlist = require("../models/Wishlist");

exports.getWishlist = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            message: "Please login."
        });

    }

    Wishlist.getAll(

        req.session.customer.id,

        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

};

exports.add = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            message: "Please login."
        });

    }

    Wishlist.add(

        req.session.customer.id,

        req.body.product_id,

        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json(err);

            }

            res.json({

                success: true,

                message: "Added to wishlist."

            });

        }

    );

};

exports.remove = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            message: "Please login."
        });

    }

    Wishlist.remove(

        req.session.customer.id,

        req.params.productId,

        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json(err);

            }

            res.json({

                success: true,

                message: "Removed from wishlist."

            });

        }

    );

};