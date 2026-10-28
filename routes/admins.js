const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const adminAuth = require("../middleware/adminAuth");

router.get("/", adminAuth, adminController.getAdmins);

router.get("/:id", adminAuth, adminController.getAdmin);

router.post("/", adminAuth, adminController.createAdmin);

router.put("/:id", adminAuth, adminController.updateAdmin);

router.delete("/:id", adminAuth, adminController.deleteAdmin);

router.put("/:id/password", adminAuth, adminController.changePassword);

module.exports = router;