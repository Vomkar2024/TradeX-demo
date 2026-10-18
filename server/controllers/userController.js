const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");

const register = async (req, res) => {
    const { username, email, usertype, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            usertype,
            password: hashedPassword,
            balance: 500,
        });

        const userCreated = await newUser.save();

        const token = jwt.sign(
            { id: userCreated._id },
            "jwtSecretVeryConfidential",
            { expiresIn: 3600 }
        );

        res.cookie("token", token);
        return res.status(201).json({
            _id: userCreated._id,
            username: userCreated.username,
            email: userCreated.email,
            usertype: userCreated.usertype,
            balance: userCreated.balance,
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

const login = async (req, res) => {
    // app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        // Auto-seed demo accounts on demand if requested
        if (!user && (email === "demo@tradex.com" || email === "admin@tradex.com")) {
            const seedDemoAccounts = require("../db/seedDemo.js");
            await seedDemoAccounts();
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        } else {
            const token = jwt.sign({ user }, "jwtSecretVeryConfidential", { expiresIn: 3600 });
            res.cookie("token", token);
            return res.json(user);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).send('Logged out successfully');
};

const fetchUserById = async (req, res) => {
    // app.get('/fetch-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "error occured" });
    }
};

const fetchUsers = async (req, res) => {
    // app.get('/fetch-users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "error occured" });
    }
};

// Combined Forgot Password & Reset Password Handler
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        // Auto-seed demo accounts on demand if requested
        if (!user && (normalizedEmail === "demo@tradex.com" || normalizedEmail === "admin@tradex.com")) {
            const seedDemoAccounts = require("../db/seedDemo.js");
            await seedDemoAccounts();
            user = await User.findOne({ email: normalizedEmail });
        }

        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        // Branch 1: Request OTP code (Forgot Password step)
        if (!otp && !newPassword) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            user.resetPasswordToken = generatedOtp;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15-minute expiration
            await user.save();

            return res.status(200).json({
                message: "Verification code generated successfully",
                otp: generatedOtp,
                email: user.email
            });
        }

        // Branch 2: Verify OTP code and Set New Password (Reset Password step)
        if (!otp || !newPassword) {
            return res.status(400).json({ message: "Both verification code (OTP) and new password are required" });
        }

        if (!user.resetPasswordToken || user.resetPasswordToken !== String(otp).trim()) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful! You can now sign in with your new password."
        });
    } catch (error) {
        console.error("Forgot/Reset password error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    fetchUsers,
    fetchUserById,
    logout,
    login,
    register,
    resetPassword
};

