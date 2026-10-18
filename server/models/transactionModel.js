const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user: { type: String, required: true },
    type: { type: String, required: true }, // Deposit / Withdraw
    paymentMode: { type: String, required: true },
    amount: { type: Number, required: true },
    time: { type: String, default: () => new Date().toISOString() }
});

const Transaction = mongoose.models.transactions || mongoose.model("transactions", transactionSchema);

module.exports = Transaction;
module.exports.Transaction = Transaction;
module.exports.transactionSchema = transactionSchema;