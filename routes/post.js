const express = require("express");

const postController = require("../controllers/post");
const { isLoggedIn } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");

const router = express.Router();

router.get("/", isLoggedIn, postController.getAllPosts);

router.get("/:email", isLoggedIn, postController.getPostsByUser);

router.post(
    "/create",
    isLoggedIn,
    upload.single("photo"),
    postController.createPost
);

module.exports = router;
