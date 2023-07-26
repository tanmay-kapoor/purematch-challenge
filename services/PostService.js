const db = require("../models");
const Post = db.Post;

class PostService {
    static async getAllPosts() {
        return await Post.findAll();
    }

    static async addPost(details) {
        const { title, description, photo, UserEmail } = details;
        return await Post.create({ title, description, photo, UserEmail });
    }

    static async getPostsByUser(email) {
        return await Post.findAll({ where: { UserEmail: email }, raw: true });
    }
}

module.exports = PostService;
