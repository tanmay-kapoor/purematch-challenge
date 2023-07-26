const UserService = require("../services/UserService");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

exports.createUser = async (req, res, next) => {
    try {
        const details = req.body;
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

        const token = jwt.sign(
            { email: user["email"], role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({ message: "Login successful", token });
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
