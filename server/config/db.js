const mongoose = require("mongoose");
const seedDemoAccounts = require("../demoseed/seedDemo.js");

/**
 * Establishes connection to the MongoDB database and initializes demo accounts.
 */
const connectToDB = () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Stocks";
    mongoose.connect(mongoUri)
        .then(async () => {
            console.log("Database: Successfully connected to MongoDB");
            await seedDemoAccounts();
        })
        .catch((err) => {
            console.warn("Database notice: MongoDB connection deferred or offline (" + err.message + ")");
            console.warn("TradeX will seamlessly serve requests via simulated in-browser demo store if MongoDB is inactive.");
        });
};

module.exports = connectToDB;

