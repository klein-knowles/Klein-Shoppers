const express = require("express");

const router = express.Router();

const wishlistController =
    require("../controllers/wishlistController");
const customerAuth = require("../middleware/customerAuth");

router.use(customerAuth);

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
