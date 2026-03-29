const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

/**
 * @route   GET /api/cart
 * @desc    Get current cart from session
 */
router.get("/", cartController.getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Add a product to the cart (input: productId, quantity)
 */
router.post("/add", cartController.addToCart);

/**
 * @route   POST /api/cart/update/:id
 * @desc    Update quantity for a cart item
 */
router.post("/update/:id", cartController.updateQuantity);

/**
 * @route   POST /api/cart/remove/:id
 * @desc    Remove an item from the cart
 */
router.post("/remove/:id", cartController.removeFromCart);

/**
 * @route   POST /api/cart/clear
 * @desc    Clear the current cart
 */
router.post("/clear", cartController.clearCart);

module.exports = router;
