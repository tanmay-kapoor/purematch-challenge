const db = require("../models");
const Post = db.Post;
const Photo = db.Photo;

class PostService {
    static async getAllPosts() {
        return await Post.findAll({ raw: true, include: Photo });
    }

    static async getPostsByUser(email) {
        return await Post.findAll({
            where: { author: email },
            raw: true,
            include: Photo,
        });
    }

    static async addPost(details) {
        return await Post.create(details);
    }

    static async updatePostById(details) {
        return await Post.update(details, {
            where: { id: details.id },
        });
    }

    static async upsert(details) {
        return await Post.upsert(details);
    }

    static async deletePostById(id) {
        return await Post.destroy({ where: { id } });
    }
}

module.exports = PostService;
