const User = require("./models/userModel.js");
const Stock = require("./models/stockSchema.js");
const Order = require("./models/orderSchema.js");
const Transaction = require("./models/transactionModel.js");

module.exports = {
    User,
    Stock,
    Order,
    Transaction,
    userSchema: User.schema,
    stocksSchema: Stock.schema,
    ordersSchema: Order.schema,
    transactionSchema: Transaction.schema
};
