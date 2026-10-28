const jwt = require("jsonwebtoken");

const Customer = require("../models/customerAuthModel");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "klein_shoppers_secret";

// =====================================================
// CUSTOMER AUTHENTICATION MIDDLEWARE
// =====================================================

module.exports = (req, res, next) => {

    try {

        if (req.session && req.session.customer) {
            req.customer = req.session.customer;
            req.user = req.session.customer;
            return next();
        }

        let token = null;

        // ----------------------------------------
        // Authorization Header
        // ----------------------------------------

        const authHeader =

            req.headers.authorization;

        if (

            authHeader &&

            authHeader.startsWith("Bearer ")

        ) {

            token = authHeader.split(" ")[1];

        }

        // ----------------------------------------
        // Cookie
        // ----------------------------------------

        if (

            !token &&

            req.cookies &&

            req.cookies.customer_token

        ) {

            token =

                req.cookies.customer_token;

        }

        // ----------------------------------------
        // No Token
        // ----------------------------------------

        if (!token) {

            return res.status(401).json({

                success: false,

                message: "Authentication required."

            });

        }

        // ----------------------------------------
        // Verify JWT
        // ----------------------------------------

        jwt.verify(

            token,

            JWT_SECRET,

            (err, decoded) => {

                if (err) {

                    return res.status(401).json({

                        success: false,

                        message:

                        "Invalid or expired session."

                    });

                }

                Customer.findById(

                    decoded.id,

                    (dbErr, rows) => {

                        if (dbErr) {

                            console.error(dbErr);

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

                        // ----------------------------
                        // Blocked
                        // ----------------------------

                        if (

                            customer.status ===

                            "Blocked"

                        ) {

                            return res.status(403).json({

                                success: false,

                                message:

                                "Account has been blocked."

                            });

                        }

                        req.customer = customer;
                req.user = customer;
                if (req.session) {
                    req.session.customer = {
                        id: customer.id,
                        first_name: customer.first_name,
                        last_name: customer.last_name,
                        email: customer.email
                    };
                }

                        next();

                    }

                );

            }

        );

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Authentication failed."

        });

    }

};
