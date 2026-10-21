const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "jwtSecretVeryConfidential";

const auth = (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers?.authorization) {
            const parts = req.headers.authorization.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                token = parts[1];
            }
        }
        if (!token) {
            return res.status(401).json({ message: "Authentication required. Please sign in to proceed." });
        }
        const verified = jwt.verify(token, JWT_SECRET);
        if (!verified) {
            res.clearCookie("token");
            return res.status(401).json({ message: "Invalid authentication credentials." });
        }
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.message === "jwt expired") {
            res.clearCookie("token");
            return res.status(401).json({ message: "Session has expired. Please sign in again." });
        }
        res.status(500).json({ message: "An error occurred during authentication verification." });
    }
};

module.exports = auth;
