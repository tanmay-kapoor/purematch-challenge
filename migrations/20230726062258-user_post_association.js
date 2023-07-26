"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addConstraint("Posts", {
            fields: ["UserEmail"],
            type: "foreign key",
            name: "user_post_association",
            references: {
                table: "Users",
                field: "email",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeConstraint("Posts", "user_post_association");
    },
};
