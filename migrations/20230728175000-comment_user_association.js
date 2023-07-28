"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint("comments", {
            fields: ["author"],
            type: "foreign key",
            name: "comments_author_association",
            references: {
                table: "users",
                field: "email",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint(
            "comments",
            "comments_author_association"
        );
    },
};
