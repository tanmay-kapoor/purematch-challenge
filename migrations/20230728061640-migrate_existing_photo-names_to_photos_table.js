"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const posts = await queryInterface.rawSelect(
            "posts",
            {
                where: {},
                plain: false,
            },
            ["photo"]
        );

        const photos = [];
        posts.forEach((post) => {
            const photo = { name: post.photo, post_id: post.id };
            photos.push(photo);
        });
        await queryInterface.bulkInsert("photos", photos);

        await queryInterface.removeColumn("posts", "photo");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("posts", "photo", {
            type: Sequelize.STRING,
        });

        const photos = await queryInterface.rawSelect(
            "photos",
            {
                where: {},
                plain: false,
            },
            ["name"]
        );

        const posts = [];
        photos.forEach((photo) => {
            const post = { id: photo.post_id, photo: photo.name };
            posts.push(post);
        });

        const queries = posts.forEach((post) => {
            queryInterface.sequelize.query(`
                UPDATE posts
                SET photo = '${post.photo}'
                WHERE id = ${post.id}
            `);
        });
        await Promise.all(queries);

        await queryInterface.changeColumn("posts", "photo", {
            allowNull: false,
            type: Sequelize.STRING,
        });

        await queryInterface.bulkDelete("photos", null, {});
    },
};
