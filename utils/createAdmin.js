const bcrypt = require("bcrypt");
const db = require("../config/db");

const password = "admin123";

bcrypt.hash(password, 10, (err, hash) => {

    if (err) {

        console.log(err);
        return;

    }

    db.query(

        `INSERT INTO admins
        (full_name,email,password,role,status)
        VALUES(?,?,?,?,?)`,

        [

            "System Administrator",

            "admin@kleinshoppers.com",

            hash,

            "Super Admin",

            "Active"

        ],

        (err) => {

            if (err) {

                console.log(err);

            } else {

                console.log("Admin Created");

            }

            process.exit();

        }

    );

});