const express = require("express");

const userController = require("../controllers/user");
const {
    isLoggedIn,
    checkRefreshTokenPresentInCookie,
} = require("../middlewares/auth");

const router = express.Router();

router.get("/", isLoggedIn, userController.getAllUsers);

router.post("/login", userController.authenticateUser);

router.post("/attachUsername", isLoggedIn, userController.attachUsername);

router.post(
    "/refresh",
    checkRefreshTokenPresentInCookie,
    userController.refreshToken
);

router.post("/create", userController.createUser);

module.exports = router;
