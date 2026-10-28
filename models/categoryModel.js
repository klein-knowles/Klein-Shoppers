const db = require("../config/db");


const Category = {

    // GET ALL CATEGORIES
    getAll(callback) {

        const sql = `
            SELECT * 
            FROM categories 
            ORDER BY id DESC
        `;

        db.query(sql, callback);

    },


    // GET CATEGORY BY ID
    getById(id, callback) {

        const sql = `
            SELECT * 
            FROM categories 
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            callback
        );

    },


    // CREATE CATEGORY
    create(category, callback) {

        const sql = `
            INSERT INTO categories
            (
                name,
                description,
                image
            )
            VALUES (?, ?, ?)
        `;


        db.query(
            sql,
            [
                category.name,
                category.description,
                category.image
            ],
            callback
        );

    },


    // UPDATE CATEGORY
    update(id, category, callback) {

        const sql = `
            UPDATE categories
            SET
                name = ?,
                description = ?,
                image = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                category.name,
                category.description,
                category.image,
                id
            ],
            callback
        );

    },


    // DELETE CATEGORY
    delete(id, callback) {

        const sql = `
            DELETE FROM categories 
            WHERE id = ?
        `;


        db.query(
            sql,
            [id],
            callback
        );

    }

};


module.exports = Category;