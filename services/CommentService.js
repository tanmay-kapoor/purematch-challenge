const db = require("../models");
const Comment = db.Comment;

class CommentService {
    static async addComment(details) {
        return await Comment.create(details);
    }

    static async getCommentsByPostId(details) {
        const { id, limit, offset } = details;
        return await Comment.findAll({
            where: { post_id: id },
            order: [["created_at", "ASC"]],
            limit,
            offset,
            raw: true,
        });
    }

    static async getCommentsByPostIdCount(postId) {
        return await Comment.count({ where: { post_id: postId } });
    }

    static async deleteCommentById(id) {
        return await Comment.destroy({ where: { id } });
    }
}

module.exports = CommentService;
