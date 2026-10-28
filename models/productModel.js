const db = require("../config/db");

const Product = {

    // ===========================================
    // SEARCH / FILTER PRODUCTS
    // ===========================================

    search(filters, callback) {

        let sql = `
            SELECT *
            FROM products
            WHERE 1=1
        `;

        let values = [];

        // Search by name
        if (filters.search) {

            sql += " AND name LIKE ?";

            values.push("%" + filters.search + "%");

        }

        // Category
        if (filters.category) {

            sql += " AND category = ?";

            values.push(filters.category);

        }

        // Brand
        if (filters.brand) {

            sql += " AND brand = ?";

            values.push(filters.brand);

        }

        // Minimum Price
        sql += " AND price >= ?";

        values.push(filters.minPrice);

        // Maximum Price
        sql += " AND price <= ?";

        values.push(filters.maxPrice);

        // Minimum Rating
        if (filters.rating > 0) {

            sql += " AND rating >= ?";

            values.push(filters.rating);

        }

        // In Stock
        if (filters.stock === "1") {

            sql += " AND stock > 0";

        }

        // Sorting
        switch (filters.sort) {

            case "price_asc":

                sql += " ORDER BY price ASC";

                break;

            case "price_desc":

                sql += " ORDER BY price DESC";

                break;

            case "rating":

                sql += " ORDER BY rating DESC";

                break;

            case "newest":

                sql += " ORDER BY created_at DESC";

                break;

            case "featured":

                sql += " ORDER BY featured DESC";

                break;

            default:

                sql += " ORDER BY id DESC";

        }

        db.query(sql, values, callback);

    },

    // ===========================================
    // GET ALL PRODUCTS
    // ===========================================

    getAll(callback) {

        db.query(

            "SELECT * FROM products ORDER BY id DESC",

            callback

        );

    },

    // ===========================================
    // GET PRODUCT
    // ===========================================

    getById(id, callback) {

        db.query(

            "SELECT * FROM products WHERE id=?",

            [id],

            callback

        );

    },

    // ===========================================
    // UPDATE PRODUCT
    // ===========================================

    update(id, product, callback) {

        const sql = `
            UPDATE products
            SET
                name=?,
                description=?,
                category=?,
                brand=?,
                price=?,
                stock=?,
                badge=?,
                rating=?,
                tags=?,
                specifications=?
            WHERE id=?
        `;

        db.query(sql, [

            product.name,
            product.description,
            product.category,
            product.brand,
            product.price,
            product.stock,
            product.badge,
            product.rating,
            product.tags,
            product.specifications,
            id

        ], callback);

    },

    // ===========================================
    // DELETE PRODUCT
    // ===========================================

    delete(id, callback) {

        db.query(

            "DELETE FROM products WHERE id=?",

            [id],

            callback

        );

    },

    // ===========================================
    // REDUCE STOCK
    // ===========================================

    reduceStock(id, quantity, callback) {

        db.query(

            `
            UPDATE products
            SET stock = stock - ?
            WHERE id = ?
            `,

            [

                quantity,

                id

            ],

            callback

        );

    }

};

module.exports = Product;

// =====================================
// Get All Products
// =====================================

Product.getAll = function(callback){

    db.query(

        "SELECT * FROM products ORDER BY id DESC",

        callback

    );

};

// =====================================
// Update Stock
// =====================================

Product.updateStock = function(id, stock, callback){

    db.query(

        "UPDATE products SET stock=? WHERE id=?",

        [stock,id],

        callback

    );

};