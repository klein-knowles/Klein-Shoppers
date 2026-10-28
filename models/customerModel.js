const db = require("../config/db");

const Customer = {


    getByEmail(email, callback) {

        db.query(

            "SELECT * FROM customers WHERE email=?",

            [email],

            callback

        );

    },



    getById(id, callback) {

        db.query(

            "SELECT * FROM customers WHERE id=?",

            [id],

            callback

        );

    },



    create(customer, callback) {

        const sql = `

            INSERT INTO customers

            (

                first_name,

                last_name,

                email,

                phone,

                password

            )

            VALUES (?, ?, ?, ?, ?)

        `;


        db.query(

            sql,

            [

                customer.first_name,

                customer.last_name,

                customer.email,

                customer.phone,

                customer.password

            ],

            callback

        );

    },




    // ==========================================
    // ADMIN: GET ALL CUSTOMERS
    // ==========================================

    getAll(callback) {


        db.query(

            `

            SELECT

                id,

                first_name,

                last_name,

                email,

                phone,

                created_at

            FROM customers

            ORDER BY id DESC

            `,

            callback

        );


    }
,


    update(id, customer, callback) {


        db.query(

            `
            UPDATE customers
            SET
                first_name = ?,
                last_name = ?,
                email = ?,
                phone = ?
            WHERE id = ?
            `,

            [
                customer.first_name,
                customer.last_name,
                customer.email,
                customer.phone,
                id
            ],

            callback

        );


    },


    delete(id, callback) {


        db.query(

            "DELETE FROM customers WHERE id = ?",

            [id],

            callback

        );


    }


};


module.exports = Customer;
