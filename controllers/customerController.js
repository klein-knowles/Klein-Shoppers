const Customer = require("../models/customerModel");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// ============================================
// CUSTOMER REGISTRATION
// ============================================

exports.register = (req, res) => {

    const {

        first_name,
        last_name,
        email,
        phone,
        password

    } = req.body;

    if (
        !first_name ||
        !last_name ||
        !email ||
        !password
    ) {

        return res.status(400).json({
            success: false,
            message: "Please complete all required fields."
        });

    }

    Customer.getByEmail(email, async (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database error."
            });

        }

        if (rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });

        }

        try {

            const hashedPassword =
                await bcrypt.hash(password, SALT_ROUNDS);

            const customer = {

                first_name,
                last_name,
                email,
                phone,
                password: hashedPassword

            };

            Customer.create(customer, (err) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to register."
                    });

                }

                res.json({
                    success: true,
                    message: "Registration successful."
                });

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Registration failed."
            });

        }

    });

};


// ============================================
// CUSTOMER LOGIN
// ============================================

exports.login = (req, res) => {

    const {

        email,
        password

    } = req.body;

    Customer.getByEmail(email, async (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database error."
            });

        }

        if (rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }

        const customer = rows[0];

        const validPassword =
            await bcrypt.compare(
                password,
                customer.password
            );

        if (!validPassword) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }

        req.session.customer = {

            id: customer.id,

            first_name: customer.first_name,

            last_name: customer.last_name,

            email: customer.email

        };

        res.json({

            success: true,

            message: "Login successful.",

            customer: req.session.customer

        });

    });

};


// ============================================
// CURRENT CUSTOMER
// ============================================

exports.me = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            success: false,
            message: "Not logged in."
        });

    }

    res.json(req.session.customer);

};


// ============================================
// LOGOUT
// ============================================

exports.logout = (req, res) => {

    req.session.destroy(() => {

        res.json({

            success: true,

            message: "Logged out successfully."

        });

    });

};

// ============================================
// CUSTOMER CRUD ROUTES
// ============================================

exports.getAllCustomers = (req, res) => {

    Customer.getAll((err, customers) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load customers."
            });

        }

        res.json(customers);

    });

};

exports.getCustomerById = (req, res) => {

    Customer.getById(req.params.id, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load customer."
            });

        }

        if (!rows.length) {

            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });

        }

        res.json(rows[0]);

    });

};

exports.createCustomer = exports.register;

exports.updateCustomer = (req, res) => {

    const {
        first_name,
        last_name,
        email,
        phone
    } = req.body;

    Customer.update(
        req.params.id,
        {
            first_name,
            last_name,
            email,
            phone
        },
        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to update customer."
                });

            }

            res.json({
                success: true,
                message: "Customer updated successfully."
            });

        }
    );

};

exports.deleteCustomer = (req, res) => {

    Customer.delete(req.params.id, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to delete customer."
            });

        }

        res.json({
            success: true,
            message: "Customer deleted successfully."
        });

    });

};
