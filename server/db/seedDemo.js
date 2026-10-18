const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const Stock = require("../models/stockSchema.js");
const Order = require("../models/orderSchema.js");
const Transaction = require("../models/transactionModel.js");

const seedDemoAccounts = async () => {
  try {
    // 1. Check or create Demo Customer
    let demoCustomer = await User.findOne({ email: "demo@tradex.com" });
    if (!demoCustomer) {
      const hashedPassword = await bcrypt.hash("demo123", 10);
      demoCustomer = await User.create({
        username: "Demo Trader",
        email: "demo@tradex.com",
        usertype: "customer",
        password: hashedPassword,
        balance: 25000,
      });
      console.log("Seeded Demo Customer account (demo@tradex.com / demo123)");
    } else if (demoCustomer.balance === 500) {
      demoCustomer.balance = 25000;
      await demoCustomer.save();
    }

    // 2. Check or create Demo Admin
    let demoAdmin = await User.findOne({ email: "admin@tradex.com" });
    if (!demoAdmin) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      demoAdmin = await User.create({
        username: "Demo Administrator",
        email: "admin@tradex.com",
        usertype: "admin",
        password: hashedAdminPassword,
        balance: 100000,
      });
      console.log("Seeded Demo Admin account (admin@tradex.com / admin123)");
    }

    // 3. Seed Demo Stocks if customer has no holdings
    if (demoCustomer) {
      const existingStocks = await Stock.find({ user: demoCustomer._id });
      if (existingStocks.length === 0) {
        await Stock.create([
          {
            user: demoCustomer._id,
            symbol: "TATASTEEL",
            name: "Tata Steel Limited",
            price: 158.40,
            count: 2,
            totalPrice: 316.80,
            stockExchange: "NSE",
          },
          {
            user: demoCustomer._id,
            symbol: "DOGE",
            name: "Dogecoin (INR)",
            price: 12.50,
            count: 10,
            totalPrice: 125.00,
            stockExchange: "Crypto",
          },
        ]);
        console.log("Seeded initial demo stock holdings for demo customer");
      }

      // 4. Seed initial orders if none exist
      const existingOrders = await Order.find({ user: demoCustomer._id });
      if (existingOrders.length === 0) {
        await Order.create([
          {
            user: demoCustomer._id,
            symbol: "TATASTEEL",
            name: "Tata Steel Limited",
            stockType: "Equity",
            price: 158.40,
            count: 2,
            totalPrice: 316.80,
            orderType: "Buy",
            orderStatus: "Completed",
          },
          {
            user: demoCustomer._id,
            symbol: "DOGE",
            name: "Dogecoin (INR)",
            stockType: "Crypto",
            price: 12.50,
            count: 10,
            totalPrice: 125.00,
            orderType: "Buy",
            orderStatus: "Completed",
          },
        ]);
      }

      // 5. Seed initial transaction
      const existingTx = await Transaction.find({ user: demoCustomer._id });
      if (existingTx.length === 0) {
        await Transaction.create({
          user: demoCustomer._id,
          type: "Deposit",
          paymentMode: "UPI",
          amount: 25000,
          time: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("Notice: Demo account seeding deferred (MongoDB may be connecting or offline):", err.message);
  }
};

module.exports = seedDemoAccounts;
