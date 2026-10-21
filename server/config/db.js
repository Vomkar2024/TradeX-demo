const mongoose = require("mongoose");
const seedDemoAccounts = require("../demoseed/seedDemo.js");

const connectToDB = () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Stocks";
    mongoose.connect(mongoUri)
        .then(async () => {
            console.log("Connected to MongoDB");
            await seedDemoAccounts();
        })
        .catch((err) => {
            console.warn("MongoDB connection failed:", err.message);
        });
};

module.exports = connectToDB;

