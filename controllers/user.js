const UserService = require("../services/UserService");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

exports.createUser = async (req, res, next) => {
    try {
        const details = req.body;

        if (!details["email"] || !details["name"] || !details["password"]) {
            res.status(400).json({
                message: "Email, name and password are required",
            });
            return;
        }

        if (!isValidEmail(details["email"])) {
            res.status(403).json({ error: "Invalid email." });
        } else if (!isValidPassword(details["password"])) {
            const msg =
                "Password validation failed. Must have minimum eight characters, " +
                "at least one uppercase letter, one lowercase letter, one number and one special character";
            res.status(403).json({
                error: msg,
            });
        } else {
            details["password"] = bcrypt.hashSync(details["password"], salt);
            await UserService.addUser(details);
            res.status(200).json({ message: "User created." });
        }
    } catch (err) {
        next(err);
    }
};

exports.authenticateUser = async (req, res, next) => {
    try {
        const details = req.body;

        if (!details["email"] || !details["password"]) {
            res.status(400).json({
                message: "Email and password are required",
            });
            return;
        }

        const user = await UserService.getUserByEmail(details["email"]);

        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const passwordMatch = bcrypt.compareSync(
            details["password"],
            user["password"]
        );

        if (!passwordMatch) {
            // incorrect password
            res.status(401).json("Incorrect password.");
            return;
        }

        const accessToken = jwt.sign(
            { email: user["email"], role: "user" },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "3d" }
        );

        const refreshToken = jwt.sign(
            { email: user["email"], role: "user" },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "Login successful", accessToken });
    } catch (err) {
        next(err);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_TOKEN_SECRET,
            (err, user) => {
                if (err) {
                    return res.status(403).json({ error: err.message });
                }
                const accessToken = jwt.sign(
                    { email: user["email"], role: "user" },
                    process.env.JWT_ACCESS_TOKEN_SECRET,
                    { expiresIn: "3d" }
                );
                res.status(200).json({ accessToken });
            }
        );
    } catch (err) {
        next(err);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

// Email validation regex
const isValidEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
const isValidPassword = (password) => {
    return password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    );
};
