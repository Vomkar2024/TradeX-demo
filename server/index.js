require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connectToDB = require("./config/db.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoute.js");
const transactionRoutes = require("./routes/transactionRoute.js");
const orderRoutes = require("./routes/orderRoute.js");
const stockRoutes = require("./routes/stockRoute.js");

const app = express();
connectToDB();

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
    credentials: true
}));

// Health check and connectivity verification endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "TradeX Server API",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use([userRoutes, transactionRoutes, orderRoutes, stockRoutes]);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`TradeX Server is running on port ${PORT}`);
});

module.exports = app;
