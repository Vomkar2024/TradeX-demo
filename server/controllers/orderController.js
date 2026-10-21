const Order = require("../models/orderSchema.js");

const fetchOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'error occured' });
    }
};

module.exports = { fetchOrders };
