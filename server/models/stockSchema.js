const mongoose = require("mongoose");

const stocksSchema = new mongoose.Schema({
    user: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String },
    price: { type: Number, required: true },
    count: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    stockExchange: { type: String, default: "NSE" }
});

const Stock = mongoose.models.stocks || mongoose.model("stocks", stocksSchema);

module.exports = Stock;
module.exports.Stock = Stock;
module.exports.stocksSchema = stocksSchema;