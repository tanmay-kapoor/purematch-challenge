const express = require("express");

const postController = require("../controllers/post");
const { isLoggedIn } = require("../middleware/auth");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
