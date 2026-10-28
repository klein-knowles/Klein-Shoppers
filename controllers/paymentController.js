const db = require("../config/db");
const yoPayments = require("../services/yoPaymentsService");

// =========================================
// Initiate Payment
// =========================================

exports.pay = async (req, res) => {

    try {

        const {

            orderId,

            phone,

            amount,

            customer

        } = req.body;

        if (!orderId || !phone || !amount) {

            return res.status(400).json({

                success: false,

                message: "Missing required fields."

            });

        }

        const payment = await yoPayments.collectMoney({

            orderId,

            phone,

            amount,

            customer

        });

        if (!payment.success) {

            return res.status(400).json(payment);

        }

        db.query(

            `

            INSERT INTO payments

            (

                order_id,

                transaction_reference,

                phone,

                amount,

                provider,

                status

            )

            VALUES

            (

                ?,

                ?,

                ?,

                ?,

                'YO_PAYMENTS',

                'PENDING'

            )

            `,

            [

                orderId,

                payment.reference,

                phone,

                amount

            ],

            (err) => {

                if (err) {

                    console.error(err);

                }

            }

        );

        res.json({

            success: true,

            message: "Payment request sent.",

            reference: payment.reference,

            data: payment.data

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

// =========================================
// Check Payment Status
// =========================================

exports.status = async (req, res) => {

    try {

        const reference = req.params.reference;

        const status = await yoPayments.checkStatus(reference);

        if (status.success && status.status === "SUCCESS") {

            db.query(

                `

                UPDATE payments

                SET status='PAID'

                WHERE transaction_reference=?

                `,

                [reference]

            );

        }

        res.json(status);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// =========================================
// Payment Callback
// =========================================

exports.callback = (req, res) => {

    console.log("Payment Callback");

    console.log(req.body);

    res.sendStatus(200);

};

// =========================================
// Payment Webhook
// =========================================

exports.webhook = (req, res) => {

    console.log("Webhook");

    console.log(req.body);

    res.sendStatus(200);

};

// =========================================
// Payment History
// =========================================

exports.history = (req, res) => {

    db.query(

        `

        SELECT *

        FROM payments

        ORDER BY id DESC

        `,

        (err, rows) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

};