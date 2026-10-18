const Order = require("../models/orderSchema.js");
const Stock = require("../models/stockSchema.js");
const User = require("../models/userModel.js");

const buyStock = async (req, res) => {
    // app.post('/buyStock', async (req, res) => {
    const { user, symbol, name, stockType, stockExchange, price, count, totalPrice } = req.body;
    try {
        const stock = await Stock.findOne({ user: user, symbol });
        const userData = await User.findById(user);
        if (parseInt(userData.balance) >= parseInt(totalPrice)) {
            if (stock) {
                stock.price = (parseInt(stock.price) + parseInt(price)) / (parseInt(stock.count) + parseInt(count));
                stock.count = parseInt(stock.count) + parseInt(count);
                stock.totalPrice = parseInt(stock.totalPrice) + parseInt(totalPrice);
                await stock.save();
            } else {
                const newStock = new Stock({
                    user,
                    symbol,
                    name,
                    price,
                    count,
                    totalPrice,
                    stockExchange
                });
                await newStock.save();
            }
            userData.balance = parseInt(userData.balance) - parseInt(totalPrice);
            const newOrder = new Order({
                user,
                symbol,
                name,
                stockType,
                price,
                count,
                totalPrice,
                orderType: "Buy",
                orderStatus: "Completed"
            });
            await userData.save();
            await newOrder.save();
            res.status(201).json({ message: "success", balance: userData.balance });
        } else {
            res.status(500).json({ message: "error occured" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "error occured" });
    }
};

const sellStock = async (req, res) => {
    // app.post('/sellStock', async (req, res) => {
    const { user, symbol, name, stockType, price, count, totalPrice } = req.body;
    try {
        const stock = await Stock.findOne({ user: user, symbol });
        const userData = await User.findById(user);
        if (stock) {
            if (parseInt(stock.count) > parseInt(count)) {
                stock.count = parseInt(stock.count) - parseInt(count);
                stock.totalPrice = parseInt(stock.totalPrice) - parseInt(totalPrice);
                userData.balance = parseInt(userData.balance) + parseInt(totalPrice);
                await stock.save();
            } else if (parseInt(stock.count) === parseInt(count)) {
                userData.balance = parseInt(userData.balance) + parseInt(totalPrice);
                await Stock.deleteOne({ user: user, symbol });
            } else {
                return res.status(500).json({ message: "error occured" });
            }
            const newOrder = new Order({
                user,
                symbol,
                name,
                stockType,
                price,
                count,
                totalPrice,
                orderType: "Sell",
                orderStatus: "Completed"
            });
            await userData.save();
            await newOrder.save();
            res.status(201).json({ message: "success", balance: userData.balance });
        } else {
            res.status(404).json({ message: "no stocks" });
        }
    } catch (err) {
        res.status(500).json({ message: "error occured" });
    }
};

const fetchStocks = async (req, res) => {
    // app.get('/fetch-stocks', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ message: "error occured" });
    }
};

module.exports = {
    buyStock,
    sellStock,
    fetchStocks
};
