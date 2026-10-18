const Order = require("../models/orderSchema.js");
const Stock = require("../models/stockSchema.js");
const User = require("../models/userModel.js");

const buyStock = async (req, res) => {
    const { user, symbol, name, stockType, stockExchange, price, count, totalPrice } = req.body;
    try {
        const numCount = Number(count);
        const unitPrice = Number(price);
        const orderTotal = Number(totalPrice) || Number((unitPrice * numCount).toFixed(2));

        const userData = await User.findById(user);
        if (!userData) {
            return res.status(404).json({ message: "User account not found." });
        }

        const currentBalance = Number(userData.balance);
        if (currentBalance < orderTotal) {
            return res.status(400).json({ 
                message: `Insufficient account balance (₹${currentBalance.toFixed(2)}) for order total of ₹${orderTotal.toFixed(2)}.` 
            });
        }

        const existingStock = await Stock.findOne({ user, symbol });
        if (existingStock) {
            const prevCount = Number(existingStock.count);
            const prevTotal = Number(existingStock.totalPrice) || Number(existingStock.price) * prevCount;
            const updatedCount = prevCount + numCount;
            const updatedTotal = Number((prevTotal + orderTotal).toFixed(2));
            const updatedAvgPrice = Number((updatedTotal / updatedCount).toFixed(2));

            existingStock.price = updatedAvgPrice;
            existingStock.count = updatedCount;
            existingStock.totalPrice = updatedTotal;
            await existingStock.save();
        } else {
            const newStock = new Stock({
                user,
                symbol,
                name,
                price: unitPrice,
                count: numCount,
                totalPrice: orderTotal,
                stockExchange: stockExchange || "NSE"
            });
            await newStock.save();
        }

        userData.balance = Number((currentBalance - orderTotal).toFixed(2));
        await userData.save();

        const newOrder = new Order({
            user,
            symbol,
            name,
            stockType: stockType || "Equity",
            price: unitPrice,
            count: numCount,
            totalPrice: orderTotal,
            orderType: "Buy",
            orderStatus: "Completed"
        });
        await newOrder.save();

        return res.status(201).json({ 
            message: "Purchase executed successfully", 
            balance: userData.balance 
        });
    } catch (err) {
        console.error("Buy stock order error:", err);
        return res.status(500).json({ message: "An unexpected error occurred while executing buy order." });
    }
};

const sellStock = async (req, res) => {
    const { user, symbol, name, stockType, price, count, totalPrice } = req.body;
    try {
        const numCount = Number(count);
        const unitPrice = Number(price);
        const orderTotal = Number(totalPrice) || Number((unitPrice * numCount).toFixed(2));

        const stock = await Stock.findOne({ user, symbol });
        const userData = await User.findById(user);

        if (!userData) {
            return res.status(404).json({ message: "User account not found." });
        }

        if (!stock) {
            return res.status(404).json({ message: `No holdings found for symbol ${symbol}.` });
        }

        const heldCount = Number(stock.count);
        if (heldCount < numCount) {
            return res.status(400).json({ 
                message: `Insufficient shares held (${heldCount}) to fulfill sell order of ${numCount} units.` 
            });
        }

        if (heldCount > numCount) {
            const remainingCount = heldCount - numCount;
            const remainingTotal = Number((Number(stock.totalPrice) - orderTotal).toFixed(2));
            stock.count = remainingCount;
            stock.totalPrice = remainingTotal;
            await stock.save();
        } else {
            // All shares sold, remove stock holding from user portfolio
            await Stock.deleteOne({ user, symbol });
        }

        userData.balance = Number((Number(userData.balance) + orderTotal).toFixed(2));
        await userData.save();

        const newOrder = new Order({
            user,
            symbol,
            name,
            stockType: stockType || "Equity",
            price: unitPrice,
            count: numCount,
            totalPrice: orderTotal,
            orderType: "Sell",
            orderStatus: "Completed"
        });
        await newOrder.save();

        return res.status(201).json({ 
            message: "Sale executed successfully", 
            balance: userData.balance 
        });
    } catch (err) {
        console.error("Sell stock order error:", err);
        return res.status(500).json({ message: "An unexpected error occurred while executing sell order." });
    }
};

const fetchStocks = async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (err) {
        console.error("Fetch stocks error:", err);
        res.status(500).json({ message: "An error occurred while retrieving platform stock holdings." });
    }
};

module.exports = {
    buyStock,
    sellStock,
    fetchStocks
};
