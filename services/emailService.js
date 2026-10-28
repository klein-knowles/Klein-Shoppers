const nodemailer = require("nodemailer");
const Email = require("../models/emailModel");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

async function verifyConnection() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        return;
    }

    try {
        await transporter.verify();
        console.log("Email server connected.");
    } catch (err) {
        console.error("Email server error.");
        console.error(err.message);
    }
}

function saveLog(data) {
    Email.create({
        recipient: data.recipient,
        subject: data.subject,
        message: data.message,
        type: data.type,
        status: data.status,
        sent_at: new Date()
    }, () => {});
}

async function sendEmail(recipient, subject, html, type = "General") {
    try {
        await transporter.sendMail({
            from: `Klein Shoppers <${process.env.SMTP_EMAIL}>`,
            to: recipient,
            subject,
            html
        });

        saveLog({ recipient, subject, message: html, type, status: "Sent" });
        return { success: true };
    } catch (err) {
        saveLog({ recipient, subject, message: html, type, status: "Failed" });
        return { success: false, error: err.message };
    }
}

async function sendNewsletter(recipients, subject, html) {
    const results = [];

    for (const email of recipients) {
        const result = await sendEmail(email, subject, html, "Newsletter");
        results.push({ email, success: result.success });
    }

    return results;
}

async function sendPromotion(recipients, title, html) {
    return sendNewsletter(recipients, title, html);
}

async function sendOrderConfirmation(customer, order) {
    const html = `
    <div style="font-family:Arial">
        <h2>Thank you for shopping with Klein Shoppers</h2>
        <p>Hello <b>${customer.name}</b>,</p>
        <p>Your order has been received successfully.</p>
        <hr>
        <h3>Order #${order.id}</h3>
        <p>Amount: <b>UGX ${Number(order.total).toLocaleString()}</b></p>
        <p>Payment Status: ${order.payment_status}</p>
        <p>Delivery Address: ${order.address}</p>
        <br>
        <p>Thank you for choosing us.</p>
    </div>
    `;

    return sendEmail(customer.email, "Order Confirmation", html, "Order");
}

async function sendPasswordReset(email, name, link) {
    const html = `
    <div style="font-family:Arial">
        <h2>Password Reset</h2>
        <p>Hello ${name},</p>
        <p>Click the button below to reset your password.</p>
        <br>
        <a href="${link}" style="background:#0d6efd;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;">Reset Password</a>
        <br><br>
        <p>If you didn't request this, ignore this email.</p>
    </div>
    `;

    return sendEmail(email, "Reset Your Password", html, "Password Reset");
}

async function sendBulk(recipients, subject, html, type = "General") {
    const sent = [];
    const failed = [];

    for (const email of recipients) {
        const result = await sendEmail(email, subject, html, type);
        if (result.success) {
            sent.push(email);
        } else {
            failed.push(email);
        }
    }

    return {
        total: recipients.length,
        sent: sent.length,
        failed: failed.length,
        successful: sent,
        unsuccessful: failed
    };
}

async function sendTestEmail(email) {
    const html = `
    <h2>Klein Shoppers</h2>
    <p>SMTP configuration is working correctly.</p>
    `;

    return sendEmail(email, "SMTP Test", html, "General");
}

module.exports = {
    verifyConnection,
    sendEmail,
    sendNewsletter,
    sendPromotion,
    sendOrderConfirmation,
    sendPasswordReset,
    sendBulk,
    sendTestEmail
};
