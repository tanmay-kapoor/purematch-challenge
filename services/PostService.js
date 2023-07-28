const db = require("../models");
const Post = db.Post;
const Photo = db.Photo;
const User = db.User;
const Comment = db.Comment;

class PostService {
    static async getAllPosts() {
        return await Post.findAll({
            raw: true,
            include: [
                {
                    model: Photo,
                },
                {
                    model: User,
                },
            ],
        });
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
