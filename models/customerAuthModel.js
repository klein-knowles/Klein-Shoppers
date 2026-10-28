const db = require("../config/db");

// ===========================================
// FIND CUSTOMER BY EMAIL
// ===========================================

exports.findByEmail = (email, callback) => {

    const sql = `
        SELECT *
        FROM customers
        WHERE email = ?
        LIMIT 1
    `;

    db.query(sql, [email], callback);

};

// ===========================================
// FIND CUSTOMER BY ID
// ===========================================

exports.findById = (id, callback) => {

    const sql = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            verified,
            last_login,
            created_at
        FROM customers
        WHERE id = ?
        LIMIT 1
    `;

    db.query(sql, [id], callback);

};

// ===========================================
// CREATE CUSTOMER ACCOUNT
// ===========================================

exports.create = (customer, callback) => {

    const sql = `
        INSERT INTO customers
        (
            first_name,
            last_name,
            email,
            phone,
            password,
            verified,
            verification_token,
            created_at
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(

        sql,

        [

            customer.first_name,

            customer.last_name,

            customer.email,

            customer.phone,

            customer.password,

            customer.verified,

            customer.verification_token

        ],

        callback

    );

};

// ===========================================
// VERIFY ACCOUNT
// ===========================================

exports.verifyAccount = (token, callback) => {

    const sql = `
        UPDATE customers
        SET
            verified = 1,
            verification_token = NULL
        WHERE verification_token = ?
    `;

    db.query(sql, [token], callback);

};

// ===========================================
// SAVE PASSWORD RESET TOKEN
// ===========================================

exports.saveResetToken = (

    email,

    token,

    expires,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            reset_token = ?,
            reset_expires = ?
        WHERE email = ?
    `;

    db.query(

        sql,

        [

            token,

            expires,

            email

        ],

        callback

    );

};

// ===========================================
// FIND CUSTOMER USING RESET TOKEN
// ===========================================

exports.findByResetToken = (

    token,

    callback

) => {

    const sql = `
        SELECT *
        FROM customers
        WHERE
            reset_token = ?
        AND
            reset_expires > NOW()
        LIMIT 1
    `;

    db.query(

        sql,

        [

            token

        ],

        callback

    );

};

// ===========================================
// UPDATE PASSWORD
// ===========================================

exports.updatePassword = (

    customerId,

    password,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            password = ?,
            reset_token = NULL,
            reset_expires = NULL
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            password,

            customerId

        ],

        callback

    );

};

// ===========================================
// UPDATE LAST LOGIN
// ===========================================

exports.updateLastLogin = (

    customerId,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            last_login = NOW()
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            customerId

        ],

        callback

    );

};

// ===========================================
// UPDATE REMEMBER TOKEN
// ===========================================

exports.updateRememberToken = (

    customerId,

    token,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            remember_token = ?
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            token,

            customerId

        ],

        callback

    );

};

// ===========================================
// INCREMENT FAILED LOGINS
// ===========================================

exports.incrementFailedAttempts = (

    customerId,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            failed_attempts = failed_attempts + 1
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            customerId

        ],

        callback

    );

};

// ===========================================
// RESET FAILED LOGINS
// ===========================================

exports.resetFailedAttempts = (

    customerId,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            failed_attempts = 0,
            locked_until = NULL
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            customerId

        ],

        callback

    );

};

// ===========================================
// LOCK ACCOUNT
// ===========================================

exports.lockAccount = (

    customerId,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            customerId

        ],

        callback

    );

};

// ===========================================
// CHECK REMEMBER TOKEN
// ===========================================

exports.findByRememberToken = (

    token,

    callback

) => {

    const sql = `
        SELECT *
        FROM customers
        WHERE remember_token = ?
        LIMIT 1
    `;

    db.query(

        sql,

        [

            token

        ],

        callback

    );

};

// ===========================================
// UPDATE EMAIL VERIFICATION TOKEN
// ===========================================

exports.updateVerificationToken = (

    customerId,

    token,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            verification_token = ?
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            token,

            customerId

        ],

        callback

    );

};

// ===========================================
// UNLOCK CUSTOMER ACCOUNT
// ===========================================

exports.unlockAccount = (

    customerId,

    callback

) => {

    const sql = `
        UPDATE customers
        SET

            failed_attempts = 0,

            locked_until = NULL

        WHERE id = ?
    `;

    db.query(

        sql,

        [

            customerId

        ],

        callback

    );

};

// ===========================================
// UPDATE CUSTOMER STATUS
// ===========================================

exports.updateStatus = (

    customerId,

    status,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            status = ?
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            status,

            customerId

        ],

        callback

    );

};

// ===========================================
// CHANGE CUSTOMER PASSWORD
// ===========================================

exports.changePassword = (

    customerId,

    password,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            password = ?
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            password,

            customerId

        ],

        callback

    );

};

// ===========================================
// REMOVE REMEMBER TOKEN
// ===========================================

exports.clearRememberToken = (

    customerId,

    callback

) => {

    const sql = `
        UPDATE customers
        SET
            remember_token = NULL
        WHERE id = ?
    `;

    db.query(

        sql,

        [

            customerId

        ],

        callback

    );

};

// ===========================================
// GET ALL VERIFIED CUSTOMERS
// ===========================================

exports.getVerifiedCustomers = (

    callback

) => {

    const sql = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            status,
            verified,
            last_login,
            created_at
        FROM customers
        WHERE verified = 1
        ORDER BY id DESC
    `;

    db.query(

        sql,

        callback

    );

};

// ===========================================
// GET ALL UNVERIFIED CUSTOMERS
// ===========================================

exports.getUnverifiedCustomers = (

    callback

) => {

    const sql = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            status,
            verified,
            created_at
        FROM customers
        WHERE verified = 0
        ORDER BY id DESC
    `;

    db.query(

        sql,

        callback

    );

};