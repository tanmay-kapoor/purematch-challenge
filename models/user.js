"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    User.init(
        {
            email: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.STRING,
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            password: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            username: {
                type: DataTypes.STRING,
                unique: true,
            },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
        }
    );
    return User;
};
