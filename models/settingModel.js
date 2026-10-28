const db = require("../config/db");

// =====================================================
// GET ALL SETTINGS
// =====================================================

exports.getAll = (callback) => {

    db.query(

        "SELECT * FROM settings ORDER BY id ASC",

        callback

    );

};

// =====================================================
// GET ONE SETTING
// =====================================================

exports.get = (key, callback) => {

    db.query(

        "SELECT * FROM settings WHERE setting_key=? LIMIT 1",

        [key],

        callback

    );

};

// =====================================================
// UPDATE SETTING
// =====================================================

exports.update = (key, value, callback) => {

    db.query(

        `UPDATE settings
         SET setting_value=?
         WHERE setting_key=?`,

        [

            value,

            key

        ],

        callback

    );

};

// =====================================================
// CREATE SETTING
// =====================================================

exports.create = (data, callback) => {

    db.query(

        `INSERT INTO settings
        (

            setting_key,

            setting_value

        )

        VALUES (?,?)`,

        [

            data.setting_key,

            data.setting_value

        ],

        callback

    );

};

// =====================================================
// UPSERT
// =====================================================

exports.save = (key, value, callback) => {

    db.query(

        `INSERT INTO settings
        (

            setting_key,

            setting_value

        )

        VALUES (?,?)

        ON DUPLICATE KEY UPDATE

        setting_value=VALUES(setting_value)`,

        [

            key,

            value

        ],

        callback

    );

};

// =====================================================
// SAVE MULTIPLE SETTINGS
// =====================================================

exports.saveMany = (settings, callback) => {

    let completed = 0;

    let failed = false;

    if (settings.length === 0) {

        return callback(null);

    }

    settings.forEach(setting => {

        exports.save(

            setting.key,

            setting.value,

            err => {

                if (failed) return;

                if (err) {

                    failed = true;

                    return callback(err);

                }

                completed++;

                if (completed === settings.length) {

                    callback(null);

                }

            }

        );

    });

};

// =====================================================
// DELETE
// =====================================================

exports.delete = (key, callback) => {

    db.query(

        "DELETE FROM settings WHERE setting_key=?",

        [key],

        callback

    );

};

// =====================================================
// RESET DEFAULTS
// =====================================================

exports.resetDefaults = callback => {

    db.query(

        "DELETE FROM settings",

        err => {

            if (err) return callback(err);

            const defaults = [

                ["website_name","Klein Shoppers"],

                ["tagline","Everything in One Place"],

                ["currency","UGX"],

                ["tax_rate","18"],

                ["shipping_fee","10000"],

                ["free_shipping","200000"],

                ["theme","light"],

                ["maintenance","0"],

                ["email","admin@kleinshoppers.com"],

                ["phone","+256700000000"],

                ["address","Kampala, Uganda"],

                ["facebook",""],

                ["twitter",""],

                ["instagram",""],

                ["youtube",""],

                ["logo","logo.png"]

            ];

            let completed = 0;

            defaults.forEach(item => {

                exports.save(

                    item[0],

                    item[1],

                    () => {

                        completed++;

                        if (completed === defaults.length) {

                            callback(null);

                        }

                    }

                );

            });

        }

    );

};