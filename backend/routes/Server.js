
"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

// API ROUTES
const offersRouter = require("./routes/offers");
const ordersRouter = require("./routes/orders");

const app = express();

const PORT = process.env.PORT || 3000;

// =====================================
// SECURITY
// =====================================

app.disable("x-powered-by");

app.use(helmet());

const allowedOrigins = (
    process.env.FRONTEND_URL || ""
)
    .split(",")
    .map(origin => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed"));
    }
}));

// =====================================
// REQUEST LIMITS
// =====================================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false
});

app.use("/api", apiLimiter);

// =====================================
// WEBHOOK ROUTE
// Raw body required for HMAC verification
// =====================================

app.post(
    "/api/webhooks/autobundles",
    express.raw({
        type: "application/json",
        limit: "100kb"
    }),
    (req, res) => {
        // Temporary placeholder.
        // HMAC verification and event processing
        // will be implemented separately.

        return res.status(503).json({
            success: false,
            message: "Webhook handler not configured"
        });
    }
);

// =====================================
// JSON BODY PARSER
// =====================================

app.use(express.json({
    limit: "100kb"
}));

// =====================================
// HEALTH CHECK
// =====================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "BINGWAHUB API",
        status: "running",
        timestamp: new Date().toISOString()
    });
});

// =====================================
// API ROUTES
// =====================================

app.use("/api/offers", offersRouter);
app.use("/api/orders", ordersRouter);

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to BINGWAHUB API"
    });
});

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});

// =====================================
// ERROR HANDLER
// =====================================

app.use((error, req, res, next) => {
    console.error("Server error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
    console.log(
        `BINGWAHUB backend running on port ${PORT}`
    );
});
