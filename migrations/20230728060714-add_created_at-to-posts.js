"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("posts", "created_at", {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("posts", "created_at");
    },
};
