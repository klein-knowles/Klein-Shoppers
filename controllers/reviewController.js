const Review = require("../models/Review");

// =====================================
// ADD REVIEW
// =====================================

exports.addReview = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }

    const review = {

        customer_id: req.session.customer.id,

        product_id: req.body.product_id,

        rating: req.body.rating,

        review: req.body.review

    };

    Review.add(review, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to save review."
            });

        }

        res.json({

            success: true,

            message: "Thank you for your review."

        });

    });

};

// =====================================
// GET REVIEWS
// =====================================

exports.getReviews = (req, res) => {

    Review.getProductReviews(

        req.params.productId,

        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

};

// =====================================
// AVERAGE RATING
// =====================================

exports.getAverage = (req, res) => {

    Review.getAverageRating(

        req.params.productId,

        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json(err);

            }

            res.json(rows[0]);

        }

    );

};

// =====================================
// ADMIN
// =====================================

exports.getAllReviews = (req,res)=>{

    Review.getAll((err,rows)=>{

        if(err){

            console.error(err);

            return res.status(500).json(err);

        }

        res.json(rows);

    });

};

exports.deleteReview=(req,res)=>{

    Review.delete(

        req.params.id,

        err=>{

            if(err){

                console.error(err);

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"Review deleted."

            });

        }

    );

};