const db = require("../models");
const Post = db.Post;
const Photo = db.Photo;
const User = db.User;
const Comment = db.Comment;

class PostService {
    static async getAllPosts(details) {
        const { limit, offset } = details;
        return await db.sequelize.query(
            `SELECT * FROM (
                ((SELECT * FROM posts p ORDER BY created_at ASC LIMIT ? OFFSET ?) AS x 
                 LEFT OUTER JOIN users u ON x.author = u.email)
                LEFT OUTER JOIN photos ph ON x.id = ph.post_id
            );
            `,
            {
                nest: true,
                type: db.sequelize.QueryTypes.SELECT,
                replacements: [limit, offset],
            },
            { raw: true }
        );
    }

    static async getAllPostsCount() {
        return await Post.count();
    }

    static async getPostsByUserCount(email) {
        return await Post.count({ where: { author: email } });
    }

    static async getPostsByUser(details) {
        const { email, limit, offset } = details;
        return await db.sequelize.query(
            `SELECT * FROM (
                ((SELECT * FROM posts p WHERE p.author = ?
                  ORDER BY created_at ASC 
                  LIMIT ? OFFSET ?) AS x 
                 LEFT OUTER JOIN users u ON x.author = u.email)
                LEFT OUTER JOIN photos ph ON x.id = ph.post_id
            );
            `,
            {
                nest: true,
                type: db.sequelize.QueryTypes.SELECT,
                replacements: [`${email}`, limit, offset],
            },
            { raw: true }
        );
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
