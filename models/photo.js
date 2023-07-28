"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Photo extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Photo.belongsTo(models.Post, {
                foreignKey: "post_id",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
            models.Post.hasMany(Photo, {
                foreignKey: "post_id",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }
    Photo.init(
        {
            name: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.STRING,
            },
            post_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },
        },
        {
            sequelize,
            modelName: "Photo",
            tableName: "photos",
        }
    );
    return Photo;
};
