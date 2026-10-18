const mongoose = require("mongoose");

const stocksSchema = new mongoose.Schema({
    user: { type: String },
    symbol: { type: String },
    name: { type: String },
    price: { type: Number },
    count: { type: Number },
    totalPrice: { type: Number },
    stockExchange: { type: String }
});

const Stock = mongoose.model('stocks', stocksSchema);

module.exports = Stock;
module.exports.Stock = Stock;