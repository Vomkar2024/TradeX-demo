const Transaction = require("../models/transactionModel.js");
const User = require("../models/userModel.js");

const fetchTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        console.error("Fetch transactions error:", err);
        res.status(500).json({ message: "An error occurred while retrieving platform transactions." });
    }
};

const newTransaction = async (req, res) => {
    const { user, type, paymentMode, amount } = req.body;
    try {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({ message: "Transaction amount must be a positive number." });
        }

        const userData = await User.findById(user);
        if (!userData) {
            return res.status(404).json({ message: "User account not found." });
        }

        const normalizedType = type?.toLowerCase();
        const currentBalance = Number(userData.balance);

        if (normalizedType === "deposit") {
            userData.balance = Number((currentBalance + numAmount).toFixed(2));
        } else if (normalizedType === "withdraw") {
            if (currentBalance < numAmount) {
                return res.status(400).json({ 
                    message: `Insufficient balance (₹${currentBalance.toFixed(2)}) for withdrawal of ₹${numAmount.toFixed(2)}.` 
                });
            }
            userData.balance = Number((currentBalance - numAmount).toFixed(2));
        }
        await userData.save();

        const transaction = new Transaction({
            user,
            type: normalizedType === "deposit" ? "Deposit" : "Withdraw",
            paymentMode: paymentMode || "UPI / Net Banking",
            amount: numAmount,
            time: new Date().toISOString()
        });
        await transaction.save();

        return res.status(201).json({ 
            message: `${transaction.type} processed successfully`, 
            balance: userData.balance 
        });
    } catch (err) {
        console.error("New transaction error:", err);
        return res.status(500).json({ message: "An unexpected error occurred while processing the transaction." });
    }
};

module.exports = {
    fetchTransactions,
    newTransaction
};
