"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addConstraint("posts", {
            fields: ["author"],
            type: "foreign key",
            name: "user_post_association",
            references: {
                table: "users",
                field: "email",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeConstraint("posts", "user_post_association");
    },
};
