const db = require("../models");
const Photo = db.Photo;

class PhotoService {
    static async bulkCreate(photos) {
        return await Photo.bulkCreate(photos);
    }

    static async getAllPhotos() {
        return await Photo.findAll({ raw: true });
    }

    static async getPhotosByPostId(id) {
        return await Photo.findAll({ where: { post_id: id }, raw: true });
    }

    static async deletePhotosForPostId(id) {
        return await Photo.destroy({ where: { post_id: id } });
    }
}

module.exports = PhotoService;
