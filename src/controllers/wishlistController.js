const wishlistModel = require("../models/wishlistModel");

const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistModel.getWishlistByUserId(req.user.userId);
    const normalizedItems = items.map((p) => ({
      id: p.id,
      title: p.name || "Untitled Product",
      price: p.price || 0,
      image: p.image_url || null,
      image_url: p.image_url || null,
      rating: {
        rate: p.rating || 0,
      },
      category: p.category,
      description: p.description,
      added_at: p.added_at
    }));

    return res.status(200).json({
      success: true,
      data: normalizedItems,
    });
  } catch (error) {
    console.error("[wishlistController.getWishlist] Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const inserted = await wishlistModel.addWishlistItem(
      req.user.userId,
      Number(productId)
    );
    return res.status(inserted ? 201 : 200).json({
      success: true,
      message: inserted ? "Added to wishlist" : "Already in your wishlist",
      data: { added: inserted },
    });
  } catch (error) {
    return next(error);
  }
};

const checkWishlist = async (req, res, next) => {
  try {
    const inWishlist = await wishlistModel.isInWishlist(
      req.user.userId,
      Number(req.params.productId)
    );
    return res.status(200).json({
      success: true,
      data: { inWishlist },
    });
  } catch (error) {
    return next(error);
  }
};

const removeWishlist = async (req, res, next) => {
  try {
    await wishlistModel.removeWishlistItem(
      req.user.userId,
      Number(req.params.productId)
    );
    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWishlist,
  addWishlist,
  checkWishlist,
  removeWishlist,
};
