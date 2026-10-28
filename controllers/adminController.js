const bcrypt = require("bcrypt");
const Admin = require("../models/adminModel");

// Get all admins
exports.getAdmins = (req, res) => {

    Admin.getAll((err, rows) => {

        if (err) {

            console.log(err);
            return res.status(500).json(err);

        }

        res.json(rows);

    });

};

// Get one admin
exports.getAdmin = (req, res) => {

    Admin.findById(req.params.id, (err, rows) => {

        if (err) {

            return res.status(500).json(err);

        }

        if (rows.length === 0) {

            return res.status(404).json({
                message: "Admin not found"
            });

        }

        res.json(rows[0]);

    });

};

// Create admin
exports.createAdmin = (req, res) => {

    const {

        full_name,

        email,

        password,

        role,

        status

    } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {

        if (err) {

            return res.status(500).json(err);

        }

        Admin.create({

            full_name,

            email,

            password: hash,

            role,

            status

        }, (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.json({

                success: true,

                message: "Administrator created."

            });

        });

    });

};

// Update admin
exports.updateAdmin = (req, res) => {

    Admin.update(

        req.params.id,

        req.body,

        (err) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.json({

                success: true,

                message: "Administrator updated."

            });

        }

    );

};

// Delete admin
exports.deleteAdmin = (req, res) => {

    Admin.delete(

        req.params.id,

        (err) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.json({

                success: true,

                message: "Administrator deleted."

            });

        }

    );

};

// Change password
exports.changePassword = (req, res) => {

    bcrypt.hash(req.body.password, 10, (err, hash) => {

        if (err) {

            return res.status(500).json(err);

        }

        Admin.changePassword(

            req.params.id,

            hash,

            (err) => {

                if (err) {

                    return res.status(500).json(err);

                }

                res.json({

                    success: true,

                    message: "Password updated."

                });

            }

        );

    });

};