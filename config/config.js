require("dotenv").config();
const fs = require("fs");
const path = require("path");

module.exports = {
    development: {
        username: process.env.DB_USER_DEV,
        password: process.env.PASSWORD_DEV,
        database: process.env.DATABASE_DEV,
        host: process.env.DB_HOST_DEV,
        dialect: "postgresql",
        logging: false,
        define: {
            timestamps: false,
        },
    },
    test: {
        username: process.env.DB_USER_TEST,
        password: process.env.PASSWORD_TEST,
        database: process.env.DATABASE_TEST,
        host: process.env.DB_HOST_TEST,
        dialect: "postgresql",
        logging: false,
        define: {
            timestamps: false,
        },
    },
    production: {
        username: process.env.DB_USER_PROD,
        password: process.env.PASSWORD_PROD,
        database: process.env.DATABASE_PROD,
        host: process.env.DB_HOST_PROD,
        dialect: "postgresql",
        dialectOptions: {
            ssl: {
                ca: fs
                    .readFileSync(path.join(__dirname, "global-bundle.pem"))
                    .toString(),
            },
        },
        logging: false,
        define: {
            timestamps: false,
        },
    },
};
