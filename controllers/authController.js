const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Customer = require("../models/customerAuthModel");
const emailService = require("../services/emailService");

const JWT_SECRET =
    process.env.JWT_SECRET || "klein_shoppers_secret";

const JWT_EXPIRES =
    process.env.JWT_EXPIRES || "7d";

const MAX_FAILED_ATTEMPTS = 5;

// =====================================================
// CREATE JWT TOKEN
// =====================================================

function createToken(customer) {

    return jwt.sign(

        {

            id: customer.id,

            email: customer.email

        },

        JWT_SECRET,

        {

            expiresIn: JWT_EXPIRES

        }

    );

}

// =====================================================
// CUSTOMER REGISTRATION
// =====================================================

exports.register = async (req, res) => {

    try {

        const {

            first_name,

            last_name,

            email,

            phone,

            password,

            confirm_password

        } = req.body;

        // -------------------------------
        // Validation
        // -------------------------------

        if (

            !first_name ||

            !last_name ||

            !email ||

            !password ||

            !confirm_password

        ) {

            return res.status(400).json({

                success: false,

                message: "Please complete all required fields."

            });

        }

        if (password !== confirm_password) {

            return res.status(400).json({

                success: false,

                message: "Passwords do not match."

            });

        }

        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message: "Password must be at least 8 characters."

            });

        }

        // -------------------------------
        // Existing customer?
        // -------------------------------

        Customer.findByEmail(

            email,

            async (err, rows) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message: "Database error."

                    });

                }

                if (rows.length) {

                    return res.status(409).json({

                        success: false,

                        message: "Email already registered."

                    });

                }

                // -------------------------------
                // Hash Password
                // -------------------------------

                const hashedPassword =

                    await bcrypt.hash(

                        password,

                        12

                    );

                // -------------------------------
                // Verification Token
                // -------------------------------

                const verificationToken =

                    crypto.randomBytes(32)

                    .toString("hex");

                // -------------------------------
                // Save Customer
                // -------------------------------

                Customer.create(

                    {

                        first_name,

                        last_name,

                        email,

                        phone,

                        password: hashedPassword,

                        verified: 0,

                        verification_token:
                            verificationToken

                    },

                    async (err2) => {

                        if (err2) {

                            console.error(err2);

                            return res.status(500).json({

                                success: false,

                                message:

                                "Unable to create account."

                            });

                        }

                        // -------------------------------
                        // Send Verification Email
                        // -------------------------------

                        try {

                            await emailService.sendVerificationEmail(

                                email,

                                first_name,

                                verificationToken

                            );

                        }

                        catch (mailError) {

                            console.error(mailError);

                        }

                        res.status(201).json({

                            success: true,

                            message:

                            "Registration successful. Please verify your email."

                        });

                    }

                );

            }

        );

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

};

// =====================================================
// CUSTOMER LOGIN
// =====================================================

exports.login = async (req, res) => {

    try {

        const {

            email,

            password,

            remember

        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }

        Customer.findByEmail(

            email,

            async (err, rows) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message: "Database error."

                    });

                }

                if (!rows.length) {

                    return res.status(401).json({

                        success: false,

                        message: "Invalid email or password."

                    });

                }

                const customer = rows[0];

                // -------------------------------------
                // ACCOUNT STATUS
                // -------------------------------------

                if (customer.status === "Blocked") {

                    return res.status(403).json({

                        success: false,

                        message: "Your account has been blocked."

                    });

                }

                // -------------------------------------
                // ACCOUNT LOCKED
                // -------------------------------------

                if (

                    customer.locked_until &&

                    new Date(customer.locked_until) >

                    new Date()

                ) {

                    return res.status(423).json({

                        success: false,

                        message:

                        "Account temporarily locked. Please try again later."

                    });

                }

                // -------------------------------------
                // EMAIL VERIFIED?
                // -------------------------------------

                if (!customer.verified) {

                    return res.status(403).json({

                        success: false,

                        message:

                        "Please verify your email before logging in."

                    });

                }

                // -------------------------------------
                // PASSWORD CHECK
                // -------------------------------------

                const match =

                    await bcrypt.compare(

                        password,

                        customer.password

                    );

                if (!match) {

                    Customer.incrementFailedAttempts(

                        customer.id,

                        () => {}

                    );

                    const attempts =

                        (customer.failed_attempts || 0) + 1;

                    if (

                        attempts >=

                        MAX_FAILED_ATTEMPTS

                    ) {

                        Customer.lockAccount(

                            customer.id,

                            () => {}

                        );

                    }

                    return res.status(401).json({

                        success: false,

                        message:

                        "Invalid email or password."

                    });

                }

                // -------------------------------------
                // RESET FAILED ATTEMPTS
                // -------------------------------------

                Customer.resetFailedAttempts(

                    customer.id,

                    () => {}

                );

                // -------------------------------------
                // UPDATE LAST LOGIN
                // -------------------------------------

                Customer.updateLastLogin(

                    customer.id,

                    () => {}

                );

                // -------------------------------------
                // JWT
                // -------------------------------------

                const token =

                    createToken(customer);

                // -------------------------------------
                // REMEMBER ME
                // -------------------------------------

                if (remember) {

                    const rememberToken =

                        crypto.randomBytes(40)

                        .toString("hex");

                    Customer.updateRememberToken(

                        customer.id,

                        rememberToken,

                        () => {}

                    );

                    res.cookie(

                        "remember_token",

                        rememberToken,

                        {

                            maxAge:

                            1000 *

                            60 *

                            60 *

                            24 *

                            30,

                            httpOnly: true,

                            sameSite: "strict"

                        }

                    );

                }

                // -------------------------------------
                // JWT COOKIE
                // -------------------------------------

                res.cookie(

                    "customer_token",

                    token,

                    {

                        httpOnly: true,

                        sameSite: "strict",

                        maxAge:

                        1000 *

                        60 *

                        60 *

                        24 *

                        7

                    }

                );

                // -------------------------------------
                // RESPONSE
                // -------------------------------------

                res.json({

                    success: true,

                    message: "Login successful.",

                    token,

                    customer: {

                        id: customer.id,

                        first_name:

                        customer.first_name,

                        last_name:

                        customer.last_name,

                        email:

                        customer.email

                    }

                });

            }

        );

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

};

// =====================================================
// CUSTOMER LOGOUT
// =====================================================

exports.logout = (req, res) => {

    res.clearCookie(

        "customer_token"

    );

    res.clearCookie(

        "remember_token"

    );

    res.json({

        success: true,

        message: "Logged out successfully."

    });

};

// =====================================================
// CURRENT CUSTOMER
// =====================================================

exports.me = (req, res) => {

    if (!req.customer) {

        return res.status(401).json({

            success: false,

            message: "Unauthorized."

        });

    }

    Customer.findById(

        req.customer.id,

        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message: "Database error."

                });

            }

            if (!rows.length) {

                return res.status(404).json({

                    success: false,

                    message: "Customer not found."

                });

            }

            res.json({

                success: true,

                customer: rows[0]

            });

        }

    );

};

// =====================================================
// VERIFY EMAIL
// =====================================================

exports.verifyEmail = (req, res) => {

    const { token } = req.params;

    if (!token) {

        return res.status(400).json({

            success: false,

            message: "Verification token is missing."

        });

    }

    Customer.verifyAccount(

        token,

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message: "Database error."

                });

            }

            if (!result.affectedRows) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid or expired verification link."

                });

            }

            res.json({

                success: true,

                message: "Email verified successfully."

            });

        }

    );

};

// =====================================================
// FORGOT PASSWORD
// =====================================================

exports.forgotPassword = (req, res) => {

    const { email } = req.body;

    if (!email) {

        return res.status(400).json({

            success: false,

            message: "Email address is required."

        });

    }

    Customer.findByEmail(

        email,

        async (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message: "Database error."

                });

            }

            if (!rows.length) {

                return res.json({

                    success: true,

                    message:
                    "If the email exists, a reset link has been sent."

                });

            }

            const token =

                crypto.randomBytes(32)

                .toString("hex");

            const expires =

                new Date(

                    Date.now() +

                    60 *

                    60 *

                    1000

                );

            Customer.saveResetToken(

                email,

                token,

                expires,

                async (err2) => {

                    if (err2) {

                        console.error(err2);

                        return res.status(500).json({

                            success: false,

                            message:
                            "Unable to create reset token."

                        });

                    }

                    try {

                        await emailService.sendPasswordResetEmail(

                            email,

                            rows[0].first_name,

                            token

                        );

                    }

                    catch (mailError) {

                        console.error(mailError);

                    }

                    res.json({

                        success: true,

                        message:
                        "If the email exists, a reset link has been sent."

                    });

                }

            );

        }

    );

};

// =====================================================
// RESET PASSWORD
// =====================================================

exports.resetPassword = async (req, res) => {

    try {

        const { token } = req.params;

        const {

            password,

            confirm_password

        } = req.body;

        if (

            !password ||

            !confirm_password

        ) {

            return res.status(400).json({

                success: false,

                message:
                "Please enter both password fields."

            });

        }

        if (

            password !==

            confirm_password

        ) {

            return res.status(400).json({

                success: false,

                message:
                "Passwords do not match."

            });

        }

        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message:
                "Password must be at least 8 characters."

            });

        }

        Customer.findByResetToken(

            token,

            async (err, rows) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error."

                    });

                }

                if (!rows.length) {

                    return res.status(400).json({

                        success: false,

                        message:
                        "Reset link has expired."

                    });

                }

                const customer = rows[0];

                const hashedPassword =

                    await bcrypt.hash(

                        password,

                        12

                    );

                Customer.updatePassword(

                    customer.id,

                    hashedPassword,

                    err2 => {

                        if (err2) {

                            console.error(err2);

                            return res.status(500).json({

                                success: false,

                                message:
                                "Unable to reset password."

                            });

                        }

                        res.json({

                            success: true,

                            message:
                            "Password reset successfully."

                        });

                    }

                );

            }

        );

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

};

// =====================================================
// RESEND EMAIL VERIFICATION
// =====================================================

exports.resendVerification = (

    req,

    res

) => {

    const { email } = req.body;

    if (!email) {

        return res.status(400).json({

            success: false,

            message:
            "Email is required."

        });

    }

    Customer.findByEmail(

        email,

        async (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                    "Database error."

                });

            }

            if (!rows.length) {

                return res.status(404).json({

                    success: false,

                    message:
                    "Customer not found."

                });

            }

            const customer = rows[0];

            if (customer.verified) {

                return res.status(400).json({

                    success: false,

                    message:
                    "Account is already verified."

                });

            }

            const token =

                crypto.randomBytes(32)

                .toString("hex");

            Customer.updateVerificationToken(

                customer.id,

                token,

                async err2 => {

                    if (err2) {

                        console.error(err2);

                        return res.status(500).json({

                            success: false,

                            message:
                            "Unable to resend verification."

                        });

                    }

                    try {

                        await emailService.sendVerificationEmail(

                            customer.email,

                            customer.first_name,

                            token

                        );

                    }

                    catch (mailError) {

                        console.error(mailError);

                    }

                    res.json({

                        success: true,

                        message:
                        "Verification email sent."

                    });

                }

            );

        }

    );

};