const PostService = require("../services/PostService");
const PhotoService = require("../services/PhotoService");
const CommentService = require("../services/CommentService");
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const { maxCount } = require("../middlewares/upload");
const dayjs = require("dayjs");

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
        posts = await attachPhotoUrlAndFormat(posts);
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

exports.getPostsByUser = async (req, res, next) => {
    try {
        let posts = await PostService.getPostsByUser(req.params.email);
        posts = await attachPhotoUrlAndFormat(posts);
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

exports.createComment = async (req, res, next) => {
    try {
        if (!req.body.content) {
            res.status(400).json({ error: "Comment is required" });
            return;
        }

        const details = {
            content: req.body.content,
            author: req.user.email,
            post_id: req.params.id,
        };

        await CommentService.addComment(details);
        res.json({ message: "Comment added" });
    } catch (err) {
        next(err);
    }
};

exports.getCommentsByPostId = async (req, res, next) => {
    try {
        const comments = await CommentService.getCommentsByPostId(
            req.params.id
        );
        for (const comment of comments) {
            const createdAt = comment["created_at"];
            const timeDiff = getTimeAndDateDifference(createdAt);
            comment["postedTime"] = timeDiff;
            delete comment["created_at"];
        }
        res.status(200).json(comments);
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

const attachPhotoUrlAndFormat = async (posts) => {
    const tempStructure = {};

    const createdAtTime = {};
    for (const post of posts) {
        if (!tempStructure[post.id]) {
            tempStructure[post.id] = {
                id: post.id,
                title: post.title,
                description: post.description,
                author: post.author,
                photos: [],
            };
            createdAtTime[post.id] = post["created_at"];
        }

        const url = await getSignedUrlFromS3(post["Photos.name"]);
        tempStructure[post.id].photos.push(url);

        const createdAt = post["created_at"];
        const timeDiff = getTimeAndDateDifference(createdAt);

        tempStructure[post.id]["uploadTime"] = timeDiff;
        tempStructure[post.id]["name"] = post["User.name"];
        if (post["User.username"]) {
            tempStructure[post.id]["username"] = post["User.username"];
        }
    }

    const formattedData = [];
    for (const id of Object.keys(tempStructure)) {
        formattedData.push({ id, ...tempStructure[id] });
    }
    formattedData.sort((a, b) => {
        const aDate = dayjs(createdAtTime[a.id]);
        const bDate = dayjs(createdAtTime[b.id]);
        return bDate.diff(aDate);
    });
    return formattedData;
};

const getSignedUrlFromS3 = async (photoName) => {
    const params = {
        Bucket: bucketName,
        Key: photoName,
    };

    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
};

const getTimeAndDateDifference = (createdAt) => {
    const rightNow = dayjs();
    const startDate = dayjs(createdAt);
    const diff = dateDiff(startDate, rightNow);

    if (diff.yearDiff > 0) {
        return `${diff.yearDiff} years ago`;
    } else if (diff.monthDiff > 0) {
        return `${diff.monthDiff} months ago`;
    } else if (diff.weekDiff > 0) {
        return `${diff.weekDiff} weeks ago`;
    } else if (diff.dayDiff > 0) {
        return `${diff.dayDiff} days ago`;
    } else if (diff.hrsDiff > 0) {
        return `${diff.hrsDiff} hours ago`;
    } else if (diff.minsDiff > 0) {
        return `${diff.minsDiff} minutes ago`;
    } else {
        return `${diff.secondsDiff} seconds ago`;
    }
};

const dateDiff = (startDate, endDate) => {
    return {
        yearDiff: endDate.diff(startDate, "year"),
        monthDiff: endDate.diff(startDate, "week") % 52,
        weekDiff: endDate.diff(startDate, "month") % 12,
        dayDiff: endDate.diff(startDate, "day") % 30,
        hrsDiff: endDate.diff(startDate, "hour") % 24,
        minsDiff: endDate.diff(startDate, "minute") % 60,
        secondsDiff: endDate.diff(startDate, "second") % 60,
    };
};
