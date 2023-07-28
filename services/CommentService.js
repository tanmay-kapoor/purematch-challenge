const db = require("../models");
const Comment = db.Comment;

class CommentService {
    static async addComment(details) {
        return await Comment.create(details);
    }

    static async getCommentsByPostId(postId) {
        return await Comment.findAll({
            where: { post_id: postId },
            order: [["created_at", "DESC"]],
            raw: true,
        });
    }

    static async deleteCommentById(id) {
        return await Comment.destroy({ where: { id } });
    }
}

module.exports = CommentService;
