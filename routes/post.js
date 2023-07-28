const express = require("express");

const postController = require("../controllers/post");
const { isLoggedIn } = require("../middlewares/auth");
const { upload, maxCount } = require("../middlewares/upload");

const router = express.Router();

router.get("/", isLoggedIn, postController.getAllPosts);

router.get("/:email", isLoggedIn, postController.getPostsByUser);

router.post(
    "/create",
    isLoggedIn,
    upload.array("photos", maxCount),
    postController.createPost
);

router.patch(
    "/:id",
    isLoggedIn,
    upload.array("photos", maxCount),
    postController.updatePost
);

router.post("/:id/comments/create", isLoggedIn, postController.createComment);

router.put(
    "/:id",
    isLoggedIn,
    upload.array("photos", maxCount),
    postController.replacePost
);

module.exports = router;
