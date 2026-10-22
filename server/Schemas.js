const User = require("./models/userModel.js");
const Stock = require("./models/stockSchema.js");
const Order = require("./models/orderSchema.js");
const Transaction = require("./models/transactionModel.js");

const userSchema = User.schema;
const stocksSchema = Stock.schema;
const orderSchema = Order.schema;
const transactionSchema = Transaction.schema;

module.exports = {
    // Models
    User,
    Stock,
    Order,
    Transaction,

    // User Schema variations
    userSchema,
    UserSchema: userSchema,
    usersSchema: userSchema,
    UsersSchema: userSchema,

    // Stocks Schema variations
    stocksSchema,
    StocksSchema: stocksSchema,
    stockSchema: stocksSchema,
    StockSchema: stocksSchema,

    // Orders Schema variations
    orderSchema,
    OrderSchema: orderSchema,
    ordersSchema: orderSchema,
    OrdersSchema: orderSchema,

    // Transactions Schema variations
    transactionSchema,
    TransactionSchema: transactionSchema,
    transactionsSchema: transactionSchema,
    TransactionsSchema: transactionSchema
};

