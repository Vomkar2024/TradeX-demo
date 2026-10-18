const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(400).send("Unauthorized");
        const verified = jwt.verify(token, "jwtSecretVeryConfidential");
        if (!verified) {
            res.clearCookie("token");
            return res.status(400).send("Unauthorized");
        }
        req.user = verified;
        next();
    } catch (error) {
        if (error.message === "jwt expired") {
            res.clearCookie("token");
            return res.status(400).send("Unauthorized");
        }
        res.status(500).send("Server Error");
    }
};

module.exports = auth;
