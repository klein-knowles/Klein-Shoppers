const path = require("path");
const fs = require("fs");

const Setting = require("../models/settingModel");

// =====================================================
// GET ALL SETTINGS
// =====================================================

exports.getSettings = (req, res) => {

    Setting.getAll((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to load settings."

            });

        }

        const settings = {};

        rows.forEach(row => {

            settings[row.setting_key] = row.setting_value;

        });

        res.json({

            success: true,

            settings

        });

    });

};

// =====================================================
// GET SINGLE SETTING
// =====================================================

exports.getSetting = (req, res) => {

    const key = req.params.key;

    Setting.get(key, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch setting."

            });

        }

        if (!rows.length) {

            return res.status(404).json({

                success: false,

                message: "Setting not found."

            });

        }

        res.json({

            success: true,

            setting: rows[0]

        });

    });

};

// =====================================================
// UPDATE SINGLE SETTING
// =====================================================

exports.updateSetting = (req, res) => {

    const key = req.params.key;

    const value = req.body.value;

    Setting.save(

        key,

        value,

        err => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message: "Unable to save setting."

                });

            }

            res.json({

                success: true,

                message: "Setting updated successfully."

            });

        }

    );

};

// =====================================================
// SAVE ALL SETTINGS
// =====================================================

exports.saveSettings = (req, res) => {

    const settings = [];

    Object.keys(req.body).forEach(key => {

        settings.push({

            key,

            value: req.body[key]

        });

    });

    Setting.saveMany(

        settings,

        err => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message: "Unable to save settings."

                });

            }

            res.json({

                success: true,

                message: "Settings saved successfully."

            });

        }

    );

};

// =====================================================
// UPLOAD WEBSITE LOGO
// =====================================================

exports.uploadLogo = (req, res) => {

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message: "Please choose a logo."

        });

    }

    const filename = req.file.filename;

    Setting.save(

        "logo",

        filename,

        err => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message: "Unable to save logo."

                });

            }

            res.json({

                success: true,

                message: "Logo uploaded successfully.",

                logo: filename

            });

        }

    );

};

// =====================================================
// DELETE WEBSITE LOGO
// =====================================================

exports.deleteLogo = (req, res) => {

    Setting.get(

        "logo",

        (err, rows) => {

            if (err || !rows.length) {

                return res.status(404).json({

                    success: false,

                    message: "Logo not found."

                });

            }

            const filename = rows[0].setting_value;

            const filePath = path.join(

                __dirname,

                "../public/uploads/logo",

                filename

            );

            if (fs.existsSync(filePath)) {

                fs.unlinkSync(filePath);

            }

            Setting.save(

                "logo",

                "",

                err2 => {

                    if (err2) {

                        return res.status(500).json({

                            success: false,

                            message: "Unable to delete logo."

                        });

                    }

                    res.json({

                        success: true,

                        message: "Logo removed."

                    });

                }

            );

        }

    );

};

// =====================================================
// RESET DEFAULT SETTINGS
// =====================================================

exports.resetDefaults = (req, res) => {

    Setting.resetDefaults(err => {

        if (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to reset settings."

            });

        }

        res.json({

            success: true,

            message: "Settings restored successfully."

        });

    });

};

// =====================================================
// WEBSITE INFORMATION
// =====================================================

exports.websiteInfo = (req, res) => {

    Setting.getAll((err, rows) => {

        if (err) {

            return res.status(500).json({

                success: false

            });

        }

        const data = {};

        rows.forEach(item => {

            data[item.setting_key] = item.setting_value;

        });

        res.json({

            success: true,

            website_name: data.website_name || "Klein Shoppers",

            tagline: data.tagline || "",

            logo: data.logo || "",

            currency: data.currency || "UGX",

            theme: data.theme || "light",

            maintenance: data.maintenance || 0,

            email: data.email || "",

            phone: data.phone || "",

            address: data.address || ""

        });

    });

};