const reviewModel = require("../models/reviewModel");

const getReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const reviews = await reviewModel.getReviewsByProductId(productId);
    
    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return next(error);
  }
};

const postReview = async (req, res, next) => {
  try {
    const { product_id, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!product_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Product ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const review = await reviewModel.createReview({
      productId: product_id,
      userId,
      rating,
      comment: comment || "",
    });

    return res.status(201).json({
      success: true,
      data: review,
      message: "Review submitted successfully",
    });
  } catch (error) {
    if (error.message === "DUPLICATE_REVIEW") {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }
    if (error.message === "INVALID_USER") {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or user no longer exists. Please log in again.",
      });
    }
    if (error.message === "INVALID_PRODUCT") {
      return res.status(404).json({
        success: false,
        message: "This product was not found or no longer exists.",
      });
    }
    return next(error);
  }
};

module.exports = {
  getReviews,
  postReview,
};
