require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoute.js");
const transactionRoutes = require("./routes/transactionRoute.js");
const orderRoutes = require("./routes/orderRoute.js");
const stockRoutes = require("./routes/stockRoute.js");

const app = express();

// Core Middleware
app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) or if in allowedOrigins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive for local development environments
        }
    },
    credentials: true
}));

// Health check and connectivity verification endpoint
app.get("/api/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "healthy" : "database_disconnected",
        database: isDbConnected ? "connected" : "disconnected",
        service: "TradeX Server API",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Database connection verification middleware:
// Ensures the database is connected before performing any action through the backend
app.use((req, res, next) => {
    // mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database is not connected. Action cannot be performed through backend.",
            status: "database_disconnected"
        });
    }
    next();
});

// Mount application routes
app.use([userRoutes, transactionRoutes, orderRoutes, stockRoutes]);

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handling middleware
app.use((err, req, res, _next) => {
    console.error("Unhandled server error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 8000;
let server;

// Start server only after database is successfully connected
const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            console.log(`TradeX Server is running on port ${PORT}`);
        });

        // Graceful shutdown
        const handleShutdown = () => {
            console.log("Shutting down TradeX server gracefully...");
            if (server) {
                server.close(() => {
                    console.log("TradeX HTTP server closed.");
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        };

        process.on("SIGTERM", handleShutdown);
        process.on("SIGINT", handleShutdown);
    } catch (error) {
        console.error("Fatal Error: Could not connect to database during startup:", error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
