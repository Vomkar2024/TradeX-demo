const Order = require("../models/orderSchema.js");

const fetchOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Fetch orders error:", err);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

module.exports = { fetchOrders };
