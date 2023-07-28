const PostService = require("../services/PostService");
const PhotoService = require("../services/PhotoService");
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const { maxCount } = require("../middlewares/upload");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
});

exports.getAllPosts = async (req, res, next) => {
    try {
        let posts = await PostService.getAllPosts();
        posts = await attachPhotoUrl(posts);
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

exports.getPostsByUser = async (req, res, next) => {
    try {
        let posts = await PostService.getPostsByUser(req.params.email);
        posts = await attachPhotoUrl(posts);
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            res.status(400).json({ error: "No files uploaded" });
            return;
        }

        if (req.files.length > maxCount) {
            res.status(400).json({
                error: "Not allowed to upload more than 5 photos.",
            });
        }

        if (!req.body.title || !req.body.description) {
            res.status(400).json({
                error: "Title and description are required",
            });
            return;
        }

        const details = {
            title: req.body.title,
            description: req.body.description,
            author: req.user.email,
        };
        const newPost = await PostService.addPost(details);
        const newPostId = newPost.dataValues.id;

        const photos = await uploadPhotosToS3(req.files, newPostId);
        await PhotoService.bulkCreate(photos);

        res.status(200).json({
            message: "Uploaded to AWS S3. Make a GET request to get imageURL",
        });
    } catch (err) {
        next(err);
    }
};

exports.updatePost = async (req, res, next) => {
    try {
        const details = {};
        details.id = req.params.id;
        if (req.body.title) details.title = req.body.title;
        if (req.body.description) details.description = req.body.description;
        details.author = req.user.email;
        await PostService.updatePostById(details);

        if (req.files && req.files.length > 0) {
            console.log("in here");
            if (req.files.length > maxCount) {
                res.status(400).json({
                    error: `Not allowed to upload more than ${maxCount} photos.`,
                });
                return;
            }
            const photosToDelete = await PhotoService.getPhotosByPostId(
                req.params.id
            );
            await PhotoService.deletePhotosForPostId(req.params.id);
            await deletePhotosFromS3(photosToDelete);
            const photos = await uploadPhotosToS3(req.files, req.params.id);
            await PhotoService.bulkCreate(photos);
        }

        res.status(200).json({ message: "Updated post details" });
    } catch (err) {
        next(err);
    }
};

exports.replacePost = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            res.status(400).json({
                error: "Files are required for PUT request.",
            });
        }

        if (req.files.length > maxCount) {
            res.status(400).json({
                error: `Not allowed to upload more than ${maxCount} photos.`,
            });
            return;
        }

        if (!req.body.title || !req.body.description) {
            res.status(400).json({
                error: "Title and description are required",
            });
            return;
        }

        const details = {
            id: req.params.id,
            title: req.body.title,
            description: req.body.description,
            author: req.user.email,
        };

        const photosToDelete = await PhotoService.getPhotosByPostId(
            req.params.id
        );
        await deletePhotosFromS3(photosToDelete);
        await PhotoService.deletePhotosForPostId(req.params.id);
        let [result, created] = await PostService.upsert(details);
        result = result.dataValues;

        const photos = await uploadPhotosToS3(req.files, req.params.id);
        await PhotoService.bulkCreate(photos);

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

const deletePhotosFromS3 = async (photos) => {
    for (const photo of photos) {
        const params = {
            Bucket: bucketName,
            Key: photo.name,
        };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
    }
};

const uploadPhotosToS3 = async (files, postId) => {
    const photos = [];
    for (const file of files) {
        const imageName = randomImageName();
        const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        photos.push({ name: imageName, post_id: postId });
    }
    return photos;
};

const randomImageName = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString("hex");
};

const attachPhotoUrl = async (posts) => {
    for (const post of posts) {
        const params = {
            Bucket: bucketName,
            Key: post["Photos.name"],
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
        post.photoUrl = url;
        delete post["Photos.name"];
        delete post["Photos.post_id"];
    }
    return posts;
};
