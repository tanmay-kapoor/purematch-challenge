const jwt = require("jsonwebtoken");

exports.isLoggedIn = async (req, res, next) => {
    const authHeader =
        req.headers["Authorization"] || req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ error: "No authorization provided." });
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: err.message });
        }
        req.user = user;
        next();
    });
};

exports.checkRefreshTokenPresentInCookie = async (req, res, next) => {
    if (req.cookies?.refreshToken) {
        next();
    } else {
        res.status(403).json({ error: "Unauthorized." });
    }
};
