const Transaction = require("../models/transactionModel.js");
const User = require("../models/userModel.js");

const fetchTransactions = async (req, res) => {
    // app.get('/fetch-transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "error occured" });
    }
};

const newTransaction = async (req, res) => {
    // app.post('/newTransaction', async (req, res) => {
    const { user, type, paymentMode, amount } = req.body;
    try {
        const userData = await User.findById(user);
        if (userData) {
            if (type === "Deposit" || type === "deposit") {
                userData.balance = parseInt(userData.balance) + parseInt(amount);
            } else if (type === "Withdraw" || type === "withdraw") {
                if (parseInt(userData.balance) < parseInt(amount)) {
                    return res.status(400).json({ message: "Insufficient balance" });
                }
                userData.balance = parseInt(userData.balance) - parseInt(amount);
            }
            await userData.save();
        }
        const transaction = new Transaction({
            user,
            type,
            paymentMode,
            amount,
            time: new Date().toISOString()
        });
        await transaction.save();
        res.status(201).json({ message: "success" });
    } catch (err) {
        res.status(500).json({ message: "error occured" });
    }
};

module.exports = {
    fetchTransactions,
    newTransaction
};
