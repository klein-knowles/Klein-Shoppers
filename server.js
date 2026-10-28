require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const OpenAI = require("openai");
const MySQLSessionStore = require("./config/sessionStore");

require("./config/db");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET;

if (isProduction && (!SESSION_SECRET || SESSION_SECRET.length < 32)) {
    throw new Error("SESSION_SECRET must be set to a strong value of at least 32 characters in production.");
}

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    if (isProduction) {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    next();
});

app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: process.env.FORM_LIMIT || "1mb"
}));

app.use(session({
    name: process.env.SESSION_NAME || "klein.sid",
    store: isProduction ? new MySQLSessionStore() : undefined,
    secret: SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.SESSION_SECURE
            ? process.env.SESSION_SECURE === "true"
            : isProduction,
        httpOnly: true,
        sameSite: "lax",
        maxAge: Number(process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000)
    }
}));

const staticOptions = {
    etag: true,
    maxAge: isProduction ? "1d" : 0
};

app.use(express.static(path.join(__dirname, "public"), staticOptions));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads"), {
    etag: true,
    maxAge: isProduction ? "7d" : 0
}));

app.get("/health", (req, res) => {
    res.json({
        ok: true,
        service: "klein-shoppers",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime()
    });
});

app.use("/admin/auth", require("./routes/adminAuth"));
app.use("/customer", require("./routes/customerAuth"));
app.use("/customers", require("./routes/customer"));
app.use("/products", require("./routes/products"));
app.use("/admin/products", require("./routes/adminproducts"));
app.use("/categories", require("./routes/categories"));
app.use("/admin/categories", require("./routes/adminCategories"));
app.use("/cart", require("./routes/cart"));
app.use("/orders", require("./routes/orders"));
app.use("/admin/orders", require("./routes/adminOrders"));
app.use("/wishlist", require("./routes/wishlist"));
app.use("/reviews", require("./routes/reviews"));
app.use("/admin/reviews", require("./routes/adminReviews"));
app.use("/filters", require("./routes/filters"));
app.use("/coupons", require("./routes/coupons"));
app.use("/stock", require("./routes/stock"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/admins", require("./routes/admins"));
app.use("/reports", require("./routes/reports"));
app.use("/payments", require("./routes/payments"));
app.use("/admin/customers", require("./routes/adminCustomers"));
app.use("/deliveries", require("./routes/deliveries"));
app.use("/emails", require("./routes/emails"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/couriers", require("./routes/couriers"));
app.use("/api/returns", require("./routes/returns"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/giftcards", require("./routes/giftcardRoutes"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/replies", require("./routes/replies"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/cms", require("./routes/cms"));
app.use("/api/videos", require("./routes/videos"));

const sendPublicFile = (...segments) => (req, res) => {
    res.sendFile(path.join(__dirname, "public", ...segments));
};

app.get("/", sendPublicFile("index.html"));
app.get("/login", sendPublicFile("login.html"));
app.get("/shop", sendPublicFile("products.html"));
app.get("/support", sendPublicFile("customer-service.html"));
app.get("/support/tickets", sendPublicFile("customer-service.html"));
app.get("/support/chat", sendPublicFile("customer-service.html"));
app.get("/admin", sendPublicFile("admin", "index.html"));
app.get("/admin/support", sendPublicFile("admin", "index.html"));
app.get("/about", sendPublicFile("pages", "about.html"));
app.get("/privacy", sendPublicFile("pages", "privacy.html"));
app.get("/terms", sendPublicFile("pages", "terms.html"));
app.get("/faq", sendPublicFile("pages", "faq.html"));
app.get("/blog", sendPublicFile("pages", "blog.html"));
app.get("/admin/cms", sendPublicFile("admin", "cms.html"));
app.get("/videos", sendPublicFile("videos.html"));
app.get("/admin/videos", sendPublicFile("admin", "videos.html"));

app.post("/chat", async (req, res, next) => {
    try {
        const userMessage = String(req.body.message || "").trim();

        if (!userMessage) {
            return res.status(400).json({ error: "Message is required." });
        }

        if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith("sk-")) {
            return res.status(503).json({ error: "AI assistant is not configured." });
        }

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "You are Klein Shoppers AI assistant. Help customers buy products, answer questions, and provide shopping advice."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        next(error);
    }
});

app.use((req, res) => {
    if (req.path.startsWith("/api/") || req.accepts("json")) {
        return res.status(404).json({ success: false, message: "Route not found." });
    }

    res.status(404).sendFile(path.join(__dirname, "public", "pages", "faq.html"));
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: isProduction ? "Internal server error." : err.message
    });
});

const server = app.listen(PORT, () => {
    console.log(`Klein Shoppers running on http://localhost:${PORT}`);
});

function shutdown(signal) {
    console.log(`${signal} received. Closing server...`);
    server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
