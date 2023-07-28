"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint("posts", {
            fields: ["author"],
            type: "foreign key",
            name: "user_post_association",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            references: {
                table: "users",
                field: "email",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint("posts", "user_post_association");
    },
};
