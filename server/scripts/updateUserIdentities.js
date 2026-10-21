const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Stocks";

const userUpdates = [
  {
    filter: {
      $or: [
        { _id: new mongoose.Types.ObjectId("6ad452abf063963033102fcc") },
        { username: "DemoTrader" },
      ],
    },
    update: {
      $set: {
        username: "Arjun Mehta",
        email: "arjun.mehta@tradex.com",
      },
    },
    label: "DemoTrader -> Arjun Mehta",
  },
  {
    filter: {
      $or: [
        { _id: new mongoose.Types.ObjectId("6ad455b64a385e254a7da6a0") },
        { username: "Trader_1792300470098" },
      ],
    },
    update: {
      $set: {
        username: "Priya Sharma",
        email: "priya.sharma@tradex.com",
      },
    },
    label: "Trader_1792300470098 -> Priya Sharma",
  },
  {
    filter: {
      $or: [
        { _id: new mongoose.Types.ObjectId("6ad458ef7aa800c0a9aa2e1b") },
        { username: "VerifyTrader_1792301295218" },
      ],
    },
    update: {
      $set: {
        username: "Vikram Malhotra",
        email: "vikram.malhotra@tradex.com",
      },
    },
    label: "VerifyTrader_1792301295218 -> Vikram Malhotra",
  },
];

async function runMigration() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    const usersCollection = mongoose.connection.collection("users");

    for (const item of userUpdates) {
      const result = await usersCollection.updateOne(item.filter, item.update);
      console.log(`[Update] ${item.label}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    }

    // Verify current state of all users
    console.log("\n--- Current Users in Database ---");
    const allUsers = await usersCollection.find({}).toArray();
    for (const u of allUsers) {
      console.log(`- [${(u.username || 'U').charAt(0).toUpperCase()}] ${u.username} (${u.email}) | Role: ${u.usertype} | Balance: ₹${u.balance}`);
    }

    await mongoose.disconnect();
    console.log("\nMigration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigration();
