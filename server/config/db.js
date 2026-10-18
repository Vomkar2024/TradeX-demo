const mongoose = require("mongoose");

const connectToDB = () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Stocks";
    mongoose.connect(mongoUri)
    .then(() => {
        console.log("Connected to MONGO DB");
    })
    .catch((e) => {
        console.error("Error in db connection:", e.message);
    });
};

module.exports = connectToDB;
