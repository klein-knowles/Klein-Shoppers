const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const customerAuth = require("../middleware/customerAuth");
// ======================================================
// PUBLIC ROUTES
// ======================================================

// Register Customer
router.post(
    "/register",
    authController.register
);

// Login Customer
router.post(
    "/login",
    authController.login
);

// Verify Email
router.get(
    "/verify/:token",
    authController.verifyEmail
);

// Forgot Password
router.post(
    "/forgot-password",
    authController.forgotPassword
);

// Reset Password
router.post(
    "/reset-password/:token",
    authController.resetPassword
);

// Resend Verification Email
router.post(
    "/resend-verification",
    authController.resendVerification
);

// ======================================================
// PROTECTED ROUTES
// ======================================================

// Logged-in Customer
router.get(
    "/me",
    customerAuth,
    authController.me
);

// Logout
router.post(
    "/logout",
    customerAuth,
    authController.logout
);

module.exports = router;
