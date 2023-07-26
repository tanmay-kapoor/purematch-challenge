require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        host: process.env.DB_HOST,
        dialect: "postgresql",
        define: {
            timestamps: false,
        },
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        host: process.env.DB_HOST,
        dialect: "postgresql",
        define: {
            timestamps: false,
        },
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        host: process.env.DB_HOST,
        dialect: "postgresql",
        define: {
            timestamps: false,
        },
    },
};
