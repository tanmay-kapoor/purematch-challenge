const db = require("../models");
const Post = db.Post;

class PostService {
    static async getAllPosts() {
        return await Post.findAll({ raw: true });
    }

    static async addPost(details) {
        const { title, description, photo, author } = details;
        return await Post.create({ title, description, photo, author });
    }

    static async getPostsByUser(email) {
        return await Post.findAll({ where: { author: email }, raw: true });
    }
}

module.exports = PostService;
