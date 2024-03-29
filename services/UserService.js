const db = require("../models");
const User = db.User;

class UserService {
    static async getAllUsers() {
        return await User.findAll({ raw: true });
    }

    static async getUserByEmail(email) {
        return await User.findOne({ where: { email }, raw: true });
    }

    static async addUser(details) {
        const { email, name, password } = details;
        return await User.create({ email, name, password });
    }
}

module.exports = UserService;
