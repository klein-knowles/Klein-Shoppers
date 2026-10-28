const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const Video = require("../models/Video");
const Product = require("../models/productModel");

const router = express.Router();
const uploadDir = path.join(__dirname, "..", "public", "uploads", "videos");
const allowedExtensions = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];
const allowedMimeTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-m4v",
    "video/ogg"
];

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeBase = path
            .basename(file.originalname, extension)
            .replace(/[^a-z0-9-]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase() || "video";

        cb(null, `${Date.now()}-${safeBase}${extension}`);
    }
});

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(extension) && allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }

        cb(new Error("Only MP4, WebM, MOV, M4V and OGG videos are allowed."));
    },
    limits: {
        fileSize: Number(process.env.VIDEO_UPLOAD_LIMIT_MB || 200) * 1024 * 1024
    }
});

function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function getUploadUrl(filename) {
    return `/uploads/videos/${filename}`;
}

function getFilePath(video) {
    if (!video || video.videoType !== "upload" || !video.filename) {
        return null;
    }

    return path.join(uploadDir, path.basename(video.filename));
}

async function removeUploadedFile(file) {
    if (!file) return;
    await fs.promises.unlink(file.path).catch(() => {});
}

router.get("/", asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit || 24), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const filter = { isActive: true };

    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.category) filter.category = req.query.category;

    const videos = await Video.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await Video.countDocuments(filter);

    res.json({
        success: true,
        videos,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
}));

router.post("/seller-upload", upload.single("video"), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please choose a product video to upload."
        });
    }

    const title = String(req.body.title || "").trim();
    const productId = String(req.body.productId || "").trim();
    const description = String(req.body.description || "").trim();

    if (!title || title.length > 120 || !productId || description.length > 2000) {
        await removeUploadedFile(req.file);
        return res.status(400).json({
            success: false,
            message: "A title, catalog product, and description under 2,000 characters are required."
        });
    }

    let products;
    try {
        products = await new Promise((resolve, reject) => {
            Product.getById(productId, (error, rows) => {
                if (error) return reject(error);
                resolve(rows);
            });
        });
    } catch (error) {
        await removeUploadedFile(req.file);
        throw error;
    }

    if (!products || !products.length) {
        await removeUploadedFile(req.file);
        return res.status(404).json({
            success: false,
            message: "Choose a product that is listed in the Klein Shoppers catalog."
        });
    }

    const product = products[0];
    let video;
    try {
        video = await Video.create({
            title,
            description,
            category: String(product.category || "general").trim(),
            productId: String(product.id),
            productName: String(product.name),
            videoType: "upload",
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            videoUrl: getUploadUrl(req.file.filename),
            streamUrl: `/api/videos/${req.file.filename}/stream`,
            uploadedBy: {
                id: null,
                name: "Seller"
            }
        });
    } catch (error) {
        await removeUploadedFile(req.file);
        throw error;
    }

    res.status(201).json({
        success: true,
        message: "Product video uploaded successfully.",
        video
    });
}));

router.post("/upload", upload.single("video"), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please choose a video file to upload."
        });
    }

    const video = await Video.create({
        title: String(req.body.title || req.file.originalname).trim(),
        description: String(req.body.description || "").trim(),
        category: String(req.body.category || "general").trim(),
        productId: req.body.productId || null,
        videoType: "upload",
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        videoUrl: getUploadUrl(req.file.filename),
        streamUrl: `/api/videos/${req.file.filename}/stream`,
        uploadedBy: {
            id: req.session?.admin?.id || req.user?.id || null,
            name: req.session?.admin?.name || req.user?.full_name || "Admin"
        }
    });

    res.status(201).json({
        success: true,
        message: "Video uploaded successfully.",
        video
    });
}));

router.post("/embed", express.json(), asyncHandler(async (req, res) => {
    const title = String(req.body.title || "").trim();
    const embedUrl = String(req.body.embedUrl || "").trim();

    if (!title || !embedUrl) {
        return res.status(400).json({
            success: false,
            message: "Title and embed URL are required."
        });
    }

    const video = await Video.create({
        title,
        description: String(req.body.description || "").trim(),
        category: String(req.body.category || "general").trim(),
        productId: req.body.productId || null,
        videoType: "embed",
        embedUrl,
        uploadedBy: {
            id: req.session?.admin?.id || req.user?.id || null,
            name: req.session?.admin?.name || req.user?.full_name || "Admin"
        }
    });

    res.status(201).json({
        success: true,
        message: "Video link added successfully.",
        video
    });
}));

router.get("/:id", asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);

    if (!video || video.isActive === false) {
        return res.status(404).json({
            success: false,
            message: "Video not found."
        });
    }

    res.json({ success: true, video });
}));

router.get("/:id/stream", asyncHandler(async (req, res) => {
    let video = await Video.findById(req.params.id);

    if (!video) {
        video = (await Video.find({ filename: req.params.id }).limit(1))[0];
    }

    const filePath = getFilePath(video);

    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: "Video file not found."
        });
    }

    video.views = Number(video.views || 0) + 1;
    await video.save();

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = video.mimeType || "video/mp4";

    if (!range) {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": contentType,
            "Accept-Ranges": "bytes"
        });

        return fs.createReadStream(filePath).pipe(res);
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start >= fileSize || end >= fileSize) {
        res.writeHead(416, {
            "Content-Range": `bytes */${fileSize}`
        });
        return res.end();
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType
    });

    stream.pipe(res);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        return res.status(404).json({
            success: false,
            message: "Video not found."
        });
    }

    const filePath = getFilePath(video);
    await video.deleteOne();

    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.json({
        success: true,
        message: "Video deleted successfully."
    });
}));

module.exports = router;
