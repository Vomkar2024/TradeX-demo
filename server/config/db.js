const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Ensure environment variables are loaded
dotenv.config();
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

const seedDemoAccounts = require("../demoseed/seedDemo.js");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Stocks";
    let conn;
    try {
      conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (optionError) {
      if (optionError.name === "MongoParseError" && optionError.message.includes("not supported")) {
        // Modern MongoDB driver v6+ in Mongoose 8+ manages these options internally
        conn = await mongoose.connect(mongoUri);
      } else {
        throw optionError;
      }
    }

    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    await seedDemoAccounts();
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message || error);
    process.exit(1);
  }
};

connectDB.connectToDB = connectDB;
module.exports = connectDB;

