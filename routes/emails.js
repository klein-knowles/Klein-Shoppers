const express = require("express");

const router = express.Router();

const emailController = require("../controllers/emailController");

const adminAuth = require("../middleware/adminAuth");

// ======================================================
// EMAIL STATISTICS
// ======================================================

router.get(

    "/stats",

    adminAuth,

    emailController.statistics

);

// ======================================================
// GET ALL EMAILS
// ======================================================

router.get(

    "/",

    adminAuth,

    emailController.getAllEmails

);

// ======================================================
// GET SINGLE EMAIL
// ======================================================

router.get(

    "/:id",

    adminAuth,

    emailController.getEmail

);

// ======================================================
// SEND SINGLE EMAIL
// ======================================================

router.post(

    "/send",

    adminAuth,

    emailController.sendEmail

);

// ======================================================
// SEND NEWSLETTER
// ======================================================

router.post(

    "/newsletter",

    adminAuth,

    emailController.sendNewsletter

);

// ======================================================
// SEND PROMOTIONAL EMAIL
// ======================================================

router.post(

    "/promotion",

    adminAuth,

    emailController.sendPromotion

);

// ======================================================
// SEND BULK EMAIL
// ======================================================

router.post(

    "/bulk",

    adminAuth,

    emailController.sendBulk

);

// ======================================================
// SEND TEST EMAIL
// ======================================================

router.post(

    "/test",

    adminAuth,

    emailController.sendTestEmail

);

// ======================================================
// UPDATE EMAIL
// ======================================================

router.put(

    "/:id",

    adminAuth,

    emailController.updateEmail

);

// ======================================================
// DELETE EMAIL
// ======================================================

router.delete(

    "/:id",

    adminAuth,

    emailController.deleteEmail

);

module.exports = router;