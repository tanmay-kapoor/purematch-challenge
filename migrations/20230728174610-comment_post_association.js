"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint("comments", {
            fields: ["post_id"],
            type: "foreign key",
            name: "comment_post_association",
            references: {
                table: "posts",
                field: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint(
            "comments",
            "comment_post_association"
        );
    },
};
