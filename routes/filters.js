const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ======================================
// Get Categories
// ======================================

router.get("/categories", (req, res) => {

    db.query(

        `
        SELECT DISTINCT category
        FROM products
        WHERE category IS NOT NULL
        AND category <> ''
        ORDER BY category ASC
        `,

        (err, rows) => {

            if (err) {

                console.error(err);
                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

});

// ======================================
// Get Brands
// ======================================

router.get("/brands", (req, res) => {

    db.query(

        `
        SELECT DISTINCT brand
        FROM products
        WHERE brand IS NOT NULL
        AND brand <> ''
        ORDER BY brand ASC
        `,

        (err, rows) => {

            if (err) {

                console.error(err);
                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

});

module.exports = router;