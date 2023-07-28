"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("posts", "created_at", Sequelize.DATE);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("posts", "created_at");
    },
};
