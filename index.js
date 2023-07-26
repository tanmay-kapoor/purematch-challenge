require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json()); //parsing http data
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

const db = require("./models");
db.sequelize.sync();

app.use("/users", require("./routes/user"));
app.use("/posts", require("./routes/post"));

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ error: err.message });
});

app.listen(port, () => console.log(`listening on port ${port}`));
