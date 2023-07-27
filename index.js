require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const db = require("./models");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json()); //parsing http data
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(cookieparser());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use("/users", require("./routes/user"));
app.use("/posts", require("./routes/post"));

app.use((err, req, res, next) => {
    console.log(err);
    if (!err.code) err.code = 500;
    res.status(err.code).json({ error: err.message });
});

console.log("Syncing db...");
db.sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});
