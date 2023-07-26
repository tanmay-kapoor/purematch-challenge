"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Post.belongsTo(models.User, {
                foreignKey: "author",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
            models.User.hasMany(Post, {
                foreignKey: "author",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }
    Post.init(
        {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            description: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            photo: {
                allowNull: false,
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: "Post",
            tableName: "posts",
        }
    );
    return Post;
};
