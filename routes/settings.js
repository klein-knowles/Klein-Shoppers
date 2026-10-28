const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const fs = require("fs");

const settingsController = require("../controllers/settingsController");

const adminAuth = require("../middleware/adminAuth");

// =====================================================
// CREATE LOGO DIRECTORY
// =====================================================

const uploadPath = path.join(

    __dirname,

    "../public/uploads/logo"

);

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, {

        recursive: true

    });

}

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, uploadPath);

    },

    filename(req, file, cb) {

        const extension =

            path.extname(file.originalname);

        cb(

            null,

            "logo_" +

            Date.now() +

            extension

        );

    }

});

const upload = multer({

    storage,

    limits: {

        fileSize: 5 * 1024 * 1024

    },

    fileFilter(req, file, cb) {

        const allowed =

            /jpg|jpeg|png|gif|webp|svg/i;

        const extension =

            allowed.test(

                path.extname(file.originalname)

            );

        const mime =

            allowed.test(file.mimetype);

        if (extension && mime) {

            return cb(null, true);

        }

        cb(

            new Error(

                "Only image files are allowed."

            )

        );

    }

});

// =====================================================
// GET WEBSITE SETTINGS
// =====================================================

router.get(

    "/",

    adminAuth,

    settingsController.getSettings

);

// =====================================================
// WEBSITE INFORMATION
// =====================================================

router.get(

    "/website",

    settingsController.websiteInfo

);

// =====================================================
// GET SINGLE SETTING
// =====================================================

router.get(

    "/:key",

    adminAuth,

    settingsController.getSetting

);

// =====================================================
// UPDATE SINGLE SETTING
// =====================================================

router.put(

    "/:key",

    adminAuth,

    settingsController.updateSetting

);

// =====================================================
// SAVE ALL SETTINGS
// =====================================================

router.post(

    "/save",

    adminAuth,

    settingsController.saveSettings

);

// =====================================================
// UPLOAD WEBSITE LOGO
// =====================================================

router.post(

    "/logo",

    adminAuth,

    upload.single("logo"),

    settingsController.uploadLogo

);

// =====================================================
// DELETE WEBSITE LOGO
// =====================================================

router.delete(

    "/logo",

    adminAuth,

    settingsController.deleteLogo

);

// =====================================================
// RESET SETTINGS
// =====================================================

router.post(

    "/reset",

    adminAuth,

    settingsController.resetDefaults

);

module.exports = router;