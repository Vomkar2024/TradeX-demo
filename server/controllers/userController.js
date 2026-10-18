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

module.exports = {
    fetchUsers,
    fetchUserById,
    logout,
    login,
    register
};
