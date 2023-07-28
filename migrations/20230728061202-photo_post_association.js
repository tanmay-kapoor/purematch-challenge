"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint("photos", {
            fields: ["post_id"],
            type: "foreign key",
            name: "photo_post_association",
            references: {
                table: "posts",
                field: "id",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint(
            "photos",
            "photo_post_association"
        );
    },
};
