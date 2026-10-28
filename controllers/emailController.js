const Email = require("../models/emailModel");
const emailService = require("../services/emailService");

// ======================================================
// GET ALL EMAILS
// ======================================================

exports.getAllEmails = (req, res) => {

    Email.getAll((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load emails."
            });

        }

        res.json(rows);

    });

};

// ======================================================
// GET EMAIL
// ======================================================

exports.getEmail = (req, res) => {

    Email.getById(req.params.id, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch email."
            });

        }

        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Email not found."
            });

        }

        res.json(rows[0]);

    });

};

// ======================================================
// EMAIL STATISTICS
// ======================================================

exports.statistics = (req, res) => {

    Email.statistics((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load statistics."
            });

        }

        res.json(rows[0]);

    });

};

// ======================================================
// SEND SINGLE EMAIL
// ======================================================

exports.sendEmail = async (req, res) => {

    try {

        const {

            recipient,

            subject,

            message,

            type

        } = req.body;

        const result = await emailService.sendEmail(

            recipient,

            subject,

            message,

            type || "General"

        );

        if (!result.success) {

            return res.status(500).json(result);

        }

        res.json({

            success: true,

            message: "Email sent successfully."

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================================
// SEND NEWSLETTER
// ======================================================

exports.sendNewsletter = async (req, res) => {

    try {

        const {

            recipients,

            subject,

            message

        } = req.body;

        const result = await emailService.sendNewsletter(

            recipients,

            subject,

            message

        );

        res.json({

            success: true,

            results: result

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================================
// SEND PROMOTION
// ======================================================

exports.sendPromotion = async (req, res) => {

    try {

        const {

            recipients,

            subject,

            message

        } = req.body;

        const result = await emailService.sendPromotion(

            recipients,

            subject,

            message

        );

        res.json({

            success: true,

            results: result

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================================
// SEND BULK EMAIL
// ======================================================

exports.sendBulk = async (req, res) => {

    try {

        const {

            recipients,

            subject,

            message,

            type

        } = req.body;

        const result = await emailService.sendBulk(

            recipients,

            subject,

            message,

            type || "General"

        );

        res.json({

            success: true,

            report: result

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================================
// SEND TEST EMAIL
// ======================================================

exports.sendTestEmail = async (req, res) => {

    try {

        const {

            email

        } = req.body;

        const result = await emailService.sendTestEmail(

            email

        );

        if (!result.success) {

            return res.status(500).json(result);

        }

        res.json({

            success: true,

            message: "Test email sent successfully."

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================================
// DELETE EMAIL
// ======================================================

exports.deleteEmail = (req, res) => {

    Email.delete(req.params.id, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to delete email."

            });

        }

        res.json({

            success: true,

            message: "Email deleted successfully."

        });

    });

};

// ======================================================
// UPDATE EMAIL
// ======================================================

exports.updateEmail = (req, res) => {

    Email.update(

        req.params.id,

        req.body,

        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message: "Unable to update email."

                });

            }

            res.json({

                success: true,

                message: "Email updated successfully."

            });

        }

    );

};