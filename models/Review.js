const db = require("../config/db");

const Review = {

    // =====================================
    // Add Review
    // =====================================

    add(review, callback) {

        const sql = `

            INSERT INTO reviews
            (
                customer_id,
                product_id,
                rating,
                review
            )
            VALUES (?, ?, ?, ?)

        `;

        db.query(

            sql,

            [

                review.customer_id,

                review.product_id,

                review.rating,

                review.review

            ],

            callback

        );

    },

    // =====================================
    // Product Reviews
    // =====================================

    getProductReviews(productId, callback) {

        const sql = `

            SELECT

                reviews.*,

                customers.first_name,

                customers.last_name

            FROM reviews

            INNER JOIN customers

                ON customers.id = reviews.customer_id

            WHERE reviews.product_id = ?

            ORDER BY reviews.created_at DESC

        `;

        db.query(sql, [productId], callback);

    },

    // =====================================
    // Average Rating
    // =====================================

    getAverageRating(productId, callback) {

        const sql = `

            SELECT

                ROUND(AVG(rating),1) AS average,

                COUNT(*) AS total

            FROM reviews

            WHERE product_id = ?

        `;

        db.query(sql, [productId], callback);

    },

    // =====================================
    // Delete Review
    // =====================================

    delete(id, callback) {

        db.query(

            "DELETE FROM reviews WHERE id=?",

            [id],

            callback

        );

    }

};

module.exports = Review;