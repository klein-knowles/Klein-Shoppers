const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload folder exists
const uploadPath = path.join(__dirname, "../public/uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            path.extname(file.originalname).toLowerCase();

        cb(null, uniqueName);
    }

});

// Allowed image types
const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif"
];

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

// Upload configuration
const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        console.log("Uploading:", file.originalname);
        console.log("Extension:", path.extname(file.originalname));
        console.log("MIME:", file.mimetype);

        const ext = path.extname(file.originalname).toLowerCase();

        if (
            allowedExtensions.includes(ext) &&
            allowedMimeTypes.includes(file.mimetype)
        ) {
            return cb(null, true);
        }

        cb(
            new Error(
                "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
            )
        );

    },

    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }

});

module.exports = upload;