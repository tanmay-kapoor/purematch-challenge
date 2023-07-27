const multer = require("multer");
const path = require("path");

exports.upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        if (!ext.match(/.(jpg|png|jpeg)$/gi)) {
            const err = new Error("Only images are allowed");
            err.code = 422;
            return callback(err);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 1024 * 1024,
    },
});
