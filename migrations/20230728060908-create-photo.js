"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("photos", {
            name: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING,
            },
            post_id: {
                type: Sequelize.INTEGER,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("photos");
    },
};
