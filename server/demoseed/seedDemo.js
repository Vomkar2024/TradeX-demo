const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const Stock = require("../models/stockSchema.js");
const Order = require("../models/orderSchema.js");
const Transaction = require("../models/transactionModel.js");

const seedDemoAccounts = async () => {
  try {
    // 1. Check or create Trader Customer (trader@tradex.com)
    let traderCustomer = await User.findOne({ email: "trader@tradex.com" });
    if (!traderCustomer) {
      const hashedTraderPass = await bcrypt.hash("trader123", 10);
      traderCustomer = await User.create({
        username: "Trader",
        email: "trader@tradex.com",
        usertype: "customer",
        password: hashedTraderPass,
        balance: 25000,
      });
      console.log("Seeded Trader account (trader@tradex.com / trader123)");
    } else {
      const isMatch = await bcrypt.compare("trader123", traderCustomer.password);
      if (!isMatch) {
        traderCustomer.password = await bcrypt.hash("trader123", 10);
        await traderCustomer.save();
      }
      if (traderCustomer.balance < 500) {
        traderCustomer.balance = 25000;
        await traderCustomer.save();
      }
    }

    // 1b. Check or maintain fallback Demo Customer
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

    // 2. Check or create Admin account
    let demoAdmin = await User.findOne({ email: "admin@tradex.com" });
    if (!demoAdmin) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      demoAdmin = await User.create({
        username: "Administrator",
        email: "admin@tradex.com",
        usertype: "admin",
        password: hashedAdminPassword,
        balance: 100000,
      });
      console.log("Seeded Admin account (admin@tradex.com / admin123)");
    } else if (demoAdmin.username !== "Administrator") {
      demoAdmin.username = "Administrator";
      await demoAdmin.save();
    }

    // 3. Seed Demo Stocks if customer has no holdings
    const targetCustomer = traderCustomer || demoCustomer;
    if (targetCustomer) {
      const existingStocks = await Stock.find({ user: targetCustomer._id });
      if (existingStocks.length === 0) {
        await Stock.create([
          {
            user: targetCustomer._id,
            symbol: "TATASTEEL",
            name: "Tata Steel Limited",
            price: 158.40,
            count: 2,
            totalPrice: 316.80,
            stockExchange: "NSE",
          },
          {
            user: targetCustomer._id,
            symbol: "DOGE",
            name: "Dogecoin (INR)",
            price: 12.50,
            count: 10,
            totalPrice: 125.00,
            stockExchange: "Crypto",
          },
        ]);
        console.log("Seeded initial stock holdings for customer");
      }

      // 4. Seed initial orders if none exist
      const existingOrders = await Order.find({ user: targetCustomer._id });
      if (existingOrders.length === 0) {
        await Order.create([
          {
            user: targetCustomer._id,
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
            user: targetCustomer._id,
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
      const existingTx = await Transaction.find({ user: targetCustomer._id });
      if (existingTx.length === 0) {
        await Transaction.create({
          user: targetCustomer._id,
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
