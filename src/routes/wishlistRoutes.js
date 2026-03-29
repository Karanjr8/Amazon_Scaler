const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, wishlistController.getWishlist);
router.get("/contains/:productId", requireAuth, wishlistController.checkWishlist);
router.post("/", requireAuth, wishlistController.addWishlist);
router.delete("/:productId", requireAuth, wishlistController.removeWishlist);

module.exports = router;
