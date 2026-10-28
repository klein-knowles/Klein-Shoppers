const db = require("../config/db");

const Admin = {};

Admin.getAll = function(callback){

    db.query(

        `SELECT
            id,
            full_name,
            email,
            role,
            status,
            created_at
         FROM admins
         ORDER BY id DESC`,

        callback

    );

};

Admin.findById = function(id, callback){

    db.query(

        "SELECT * FROM admins WHERE id=?",

        [id],

        callback

    );

};

Admin.findByEmail = function(email, callback){

    db.query(

        "SELECT * FROM admins WHERE email=?",

        [email],

        callback

    );

};

Admin.create = function(admin, callback){

    db.query(

        `INSERT INTO admins
        (full_name,email,password,role,status)
        VALUES(?,?,?,?,?)`,

        [

            admin.full_name,

            admin.email,

            admin.password,

            admin.role,

            admin.status

        ],

        callback

    );

};

Admin.update = function(id, admin, callback){

    db.query(

        `UPDATE admins

        SET

        full_name=?,

        email=?,

        role=?,

        status=?

        WHERE id=?`,

        [

            admin.full_name,

            admin.email,

            admin.role,

            admin.status,

            id

        ],

        callback

    );

};

Admin.delete=function(id,callback){

    db.query(

        "DELETE FROM admins WHERE id=?",

        [id],

        callback

    );

};

Admin.changePassword=function(id,password,callback){

    db.query(

        "UPDATE admins SET password=? WHERE id=?",

        [

            password,

            id

        ],

        callback

    );

};

module.exports=Admin;