const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Stocks";

async function runMigration() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    const stocksCollection = mongoose.connection.collection("stocks");
    const ordersCollection = mongoose.connection.collection("orders");
    const usersCollection = mongoose.connection.collection("users");

    // 1. Fetch relevant users
    const priya = await usersCollection.findOne({ email: "priya.sharma@tradex.com" });
    const vikram = await usersCollection.findOne({ email: "vikram.malhotra@tradex.com" });
    const demo = await usersCollection.findOne({ email: "demo@tradex.com" });
    const trader = await usersCollection.findOne({ email: "trader@tradex.com" });

    // 2. Remove old US equities (AAPL, NVDA, TSLA) and old HASMSTER stocks
    await stocksCollection.deleteMany({
      symbol: { $in: ["AAPL", "NVDA", "TSLA", "HASMSTER"] },
    });

    // 3. Remove old US equities (AAPL, NVDA, TSLA) and old HASMSTER orders
    await ordersCollection.deleteMany({
      symbol: { $in: ["AAPL", "NVDA", "TSLA", "HASMSTER"] },
    });

    const now = new Date();

    // 4. Insert updated Indian Equities for Priya Sharma (RELIANCE)
    if (priya) {
      await stocksCollection.insertOne({
        user: priya._id.toString(),
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd.",
        price: 2945.50,
        count: 2,
        totalPrice: 5891.00,
        stockExchange: "NSE",
        __v: 0,
      });

      await ordersCollection.insertMany([
        {
          user: priya._id.toString(),
          symbol: "RELIANCE",
          name: "Reliance Industries Ltd.",
          price: 2945.50,
          count: 4,
          totalPrice: 11782.00,
          stockType: "Equity",
          orderType: "Buy",
          orderStatus: "Completed",
          date: new Date(now.getTime() - 3600000 * 24),
          __v: 0,
        },
        {
          user: priya._id.toString(),
          symbol: "RELIANCE",
          name: "Reliance Industries Ltd.",
          price: 2945.50,
          count: 2,
          totalPrice: 5891.00,
          stockType: "Equity",
          orderType: "Sell",
          orderStatus: "Completed",
          date: new Date(now.getTime() - 3600000 * 12),
          __v: 0,
        },
      ]);
    }

    // 5. Insert updated Indian Equities for Vikram Malhotra (INFY)
    if (vikram) {
      await stocksCollection.insertOne({
        user: vikram._id.toString(),
        symbol: "INFY",
        name: "Infosys Limited",
        price: 1875.30,
        count: 3,
        totalPrice: 5625.90,
        stockExchange: "NSE",
        __v: 0,
      });

      await ordersCollection.insertMany([
        {
          user: vikram._id.toString(),
          symbol: "INFY",
          name: "Infosys Limited",
          price: 1875.30,
          count: 5,
          totalPrice: 9376.50,
          stockType: "Equity",
          orderType: "Buy",
          orderStatus: "Completed",
          date: new Date(now.getTime() - 3600000 * 20),
          __v: 0,
        },
        {
          user: vikram._id.toString(),
          symbol: "INFY",
          name: "Infosys Limited",
          price: 1875.30,
          count: 2,
          totalPrice: 3750.60,
          stockType: "Equity",
          orderType: "Sell",
          orderStatus: "Completed",
          date: new Date(now.getTime() - 3600000 * 8),
          __v: 0,
        },
      ]);
    }

    // 6. Insert updated Indian Equities for Demo Trader (RELIANCE, INFY, TCS)
    if (demo) {
      await stocksCollection.insertMany([
        {
          user: demo._id.toString(),
          symbol: "RELIANCE",
          name: "Reliance Industries Ltd.",
          price: 2945.50,
          count: 4,
          totalPrice: 11782.00,
          stockExchange: "NSE",
          __v: 0,
        },
        {
          user: demo._id.toString(),
          symbol: "INFY",
          name: "Infosys Limited",
          price: 1875.30,
          count: 5,
          totalPrice: 9376.50,
          stockExchange: "NSE",
          __v: 0,
        },
        {
          user: demo._id.toString(),
          symbol: "TCS",
          name: "Tata Consultancy Services",
          price: 3850.00,
          count: 3,
          totalPrice: 11550.00,
          stockExchange: "NSE",
          __v: 0,
        },
      ]);

      await ordersCollection.insertMany([
        {
          user: demo._id.toString(),
          symbol: "RELIANCE",
          name: "Reliance Industries Ltd.",
          price: 2945.50,
          count: 4,
          totalPrice: 11782.00,
          stockType: "Equity",
          orderType: "Buy",
          orderStatus: "Completed",
          date: new Date(now.getTime() - 3600000 * 18),
          __v: 0,
        },
        {
          user: demo._id.toString(),
          symbol: "INFY",
          name: "Infosys Limited",
          price: 1875.30,
          count: 5,
          totalPrice: 9376.50,
          stockType: "Equity",
          orderType: "Buy",
          orderStatus: "Completed",
          date: new Date(now.getTime() - 3600000 * 14),
          __v: 0,
        },
        {
          user: demo._id.toString(),
          symbol: "TCS",
          name: "Tata Consultancy Services",
          price: 3850.00,
          count: 3,
          totalPrice: 11550.00,
          stockType: "Equity",
          orderType: "Buy",
          orderStatus: "Completed",
          date: new Date(now.getTime() - 3600000 * 6),
          __v: 0,
        },
      ]);
    }

    // 7. Update Trader account: replace HASMSTER with Cardano (ADA)
    if (trader) {
      await stocksCollection.insertOne({
        user: trader._id.toString(),
        symbol: "ADA",
        name: "Cardano (ADA)",
        price: 42.50,
        count: 60,
        totalPrice: 2550.00,
        stockExchange: "Crypto",
        __v: 0,
      });

      await ordersCollection.insertOne({
        user: trader._id.toString(),
        symbol: "ADA",
        name: "Cardano (ADA)",
        price: 42.50,
        count: 60,
        totalPrice: 2550.00,
        stockType: "Crypto",
        orderType: "Buy",
        orderStatus: "Completed",
        date: new Date(now.getTime() - 3600000 * 4),
        __v: 0,
      });

      // Update Trader balance to ₹22,450
      await usersCollection.updateOne(
        { _id: trader._id },
        { $set: { balance: 22450 } }
      );
    }

    // 8. Output current database state for verification
    console.log("\n--- Updated STOCKS in Database ---");
    const updatedStocks = await stocksCollection.find({}).toArray();
    for (const s of updatedStocks) {
      console.log(`- [${s.stockExchange}] ${s.symbol} (${s.name}) | ${s.count} units @ ₹${s.price} = ₹${s.totalPrice} | User: ${s.user}`);
    }

    console.log("\n--- Updated ORDERS in Database ---");
    const updatedOrders = await ordersCollection.find({}).toArray();
    for (const o of updatedOrders) {
      console.log(`- ${o.orderType} ${o.count}x ${o.symbol} @ ₹${o.price} = ₹${o.totalPrice} (${o.stockType}) | User: ${o.user}`);
    }

    console.log("\nMigration of Equities and Crypto completed successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigration();
