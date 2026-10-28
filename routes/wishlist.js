const express = require("express");

const router = express.Router();

const wishlistController =
    require("../controllers/wishlistController");

router.get(
    "/",
    wishlistController.getWishlist
);

router.post(
    "/add",
    wishlistController.add
);

router.delete(
    "/remove/:productId",
    wishlistController.remove
);

module.exports = router;
