const mongoose = require("mongoose");
const seedDemoAccounts = require("../db/seedDemo.js");

const connectToDB = () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Stocks";
    mongoose.connect(mongoUri)
    .then(async () => {
        console.log("Connected to MONGO DB");
        await seedDemoAccounts();
    })
    .catch((e) => {
        console.error("Error in db connection:", e.message);
    });
};

module.exports = connectToDB;

