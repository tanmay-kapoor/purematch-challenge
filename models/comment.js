"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Comment.belongsTo(models.Post, {
                foreignKey: "post_id",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
            models.Post.hasMany(Comment, {
                foreignKey: "post_id",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            Comment.belongsTo(models.User, {
                foreignKey: "author",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
            models.User.hasMany(Comment, {
                foreignKey: "author",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }
    Comment.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            content: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            author: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            post_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            created_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            },
        },
        {
            sequelize,
            modelName: "Comment",
            tableName: "comments",
        }
    );
    return Comment;
};
