const PostService = require("../services/PostService");
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

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
        const posts = await PostService.getAllPosts();
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

exports.getPostsByUser = async (req, res, next) => {
    try {
        const posts = await PostService.getPostsByUser(req.params.email);
        for (const post of posts) {
            const params = {
                Bucket: bucketName,
                Key: post.photo,
            };
            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
            post.photoUrl = url;
        }
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const imageName = randomImageName();
        const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const details = {
            ...req.body,
            photo: imageName,
            author: req.user.email,
        };
        await PostService.addPost(details);

        res.status(200).json({
            message: "Uploaded to AWS S3. Make a GET request to get imageURL",
        });
    } catch (err) {
        next(err);
    }
};

const randomImageName = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString("hex");
};
