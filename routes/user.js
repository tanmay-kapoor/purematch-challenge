const express = require("express");

const userController = require("../controllers/user");
const { isLoggedIn } = require("../middleware/auth");

const router = express.Router();

router.get("/", isLoggedIn, userController.getAllUsers);

router.post("/login", userController.authenticateUser);

router.post("/create", userController.createUser);

module.exports = router;
