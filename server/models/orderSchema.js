const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String },
    price: { type: Number, required: true },
    count: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    stockType: { type: String, default: "Equity" }, // Equity / Crypto / Intraday / Delivery
    orderType: { type: String, required: true }, // Buy / Sell
    orderStatus: { type: String, default: "Completed" },
    date: { type: Date, default: Date.now }
});

const Order = mongoose.models.orders || mongoose.model("orders", orderSchema);

module.exports = Order;
module.exports.Order = Order;
module.exports.orderSchema = orderSchema;
module.exports.OrderSchema = orderSchema;
module.exports.ordersSchema = orderSchema;
module.exports.OrdersSchema = orderSchema;
