const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    usertype: { type: String, required: true, default: "customer" }, // customer / admin
    password: { type: String, required: true },
    balance: { type: Number, default: 500 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

module.exports = User;
module.exports.User = User;
module.exports.userSchema = userSchema;
module.exports.UserSchema = userSchema;
module.exports.usersSchema = userSchema;
module.exports.UsersSchema = userSchema;
