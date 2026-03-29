const express = require("express");
const reviewController = require("../controllers/reviewController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:productId", reviewController.getReviews);
router.post("/", requireAuth, reviewController.postReview);

module.exports = router;
