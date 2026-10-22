const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");

const JWT_SECRET = process.env.JWT_SECRET || "jwtSecretVeryConfidential";

// Helper to generate consistent signed JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            usertype: user.usertype
        },
        JWT_SECRET,
        { expiresIn: 3600 * 24 } // 24 hours
    );
};

// Helper to sanitize user object (exclude sensitive fields)
const sanitizeUser = (user, token = null) => {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        usertype: user.usertype,
        balance: user.balance,
        ...(token ? { token } : {})
    };
};

const register = async (req, res) => {
    const { username, email, usertype, password } = req.body;
    try {
        if (!email || !password || !username) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username.trim(),
            email: normalizedEmail,
            usertype: usertype || "customer",
            password: hashedPassword,
            balance: 500,
        });

        const userCreated = await newUser.save();
        const token = generateToken(userCreated);

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        return res.status(201).json(sanitizeUser(userCreated, token));
    } catch (error) {
        console.error("User registration error:", error);
        return res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        // Auto-seed demo/trader accounts on demand if requested
        if (!user && (normalizedEmail === "trader@tradex.com" || normalizedEmail === "demo@tradex.com" || normalizedEmail === "admin@tradex.com")) {
            const seedDemoAccounts = require("../demoseed/seedDemo.js");
            await seedDemoAccounts();
            user = await User.findOne({ email: normalizedEmail });
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        return res.json(sanitizeUser(user, token));
    } catch (error) {
        console.error("User login error:", error);
        return res.status(500).json({ message: "Authentication failed" });
    }
};

const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
};

const fetchUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Fetch user by ID error:", err);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

const fetchUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -resetPasswordToken -resetPasswordExpires");
        res.json(users);
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// Forgot Password & Reset Password Handler
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        // Auto-seed demo/trader accounts on demand if requested
        if (!user && (normalizedEmail === "trader@tradex.com" || normalizedEmail === "demo@tradex.com" || normalizedEmail === "admin@tradex.com")) {
            const seedDemoAccounts = require("../demoseed/seedDemo.js");
            await seedDemoAccounts();
            user = await User.findOne({ email: normalizedEmail });
        }

        if (!user) {
            return res.status(404).json({ message: "No user found with this email address" });
        }

        // Branch 1: Request OTP code (Forgot Password step)
        if (!otp && !newPassword) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            user.resetPasswordToken = generatedOtp;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
            await user.save();

            return res.status(200).json({
                message: "Verification code generated successfully",
                otp: generatedOtp,
                email: user.email
            });
        }

        // Branch 2: Verify OTP code and Set New Password (Reset Password step)
        if (!otp || !newPassword) {
            return res.status(400).json({ message: "Both OTP and new password are required" });
        }

        if (!user.resetPasswordToken || user.resetPasswordToken !== String(otp).trim()) {
            return res.status(400).json({ message: "Invalid OTP code" });
        }

        if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new code." });
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
            message: "Password reset successful"
        });
    } catch (error) {
        console.error("Forgot/Reset password error:", error);
        return res.status(500).json({ message: "Error resetting password" });
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
