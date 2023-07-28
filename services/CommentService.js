const db = require("../models");
const Comment = db.Comment;

class CommentService {
    static async addComment(details) {
        return await Comment.create(details);
    }

    static async getCommentsByPostId(postId) {
        // sort by time desc
        return await Comment.findAll({
            where: { post_id: postId },
            raw: true,
        });
    }

    static async deleteCommentById(id) {
        return await Comment.destroy({ where: { id } });
    }
}

module.exports = CommentService;
