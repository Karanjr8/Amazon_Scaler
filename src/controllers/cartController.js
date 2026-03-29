const productModel = require("../models/productModel");

/**
 * Helper to initialize or get the cart from session.
 * @param {Object} req - Express request object.
 */
const getSessionCart = (req) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await productModel.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cart = getSessionCart(req);
    const existingIndex = cart.findIndex((item) => Number(item.id) === Number(productId));

    if (existingIndex > -1) {
      // Update quantity
      cart[existingIndex].quantity += Number(quantity);
      // Ensure quantity doesn't exceed stock
      const stock = Number(product.stock || 0);
      if (cart[existingIndex].quantity > stock) {
        cart[existingIndex].quantity = stock;
      }
    } else {
      // Add new item with full details
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        quantity: Math.min(Number(quantity), Number(product.stock || 0)),
      });
    }

    req.session.save((err) => {
      if (err) {
        console.error("[cartController.addToCart] Session Save Error:", err);
        return res.status(500).json({ success: false, message: "Failed to save cart" });
      }
      res.status(200).json({ success: true, cart });
    });
  } catch (error) {
    console.error("[cartController.addToCart] ERROR:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getCart = (req, res) => {
  res.status(200).json({ success: true, cart: getSessionCart(req) });
};

const removeFromCart = (req, res) => {
  try {
    const { id } = req.params;
    const cart = getSessionCart(req);
    
    // Filter out the item
    req.session.cart = cart.filter((item) => Number(item.id) !== Number(id));

    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to save cart" });
      res.status(200).json({ success: true, cart: req.session.cart });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const cart = getSessionCart(req);
    
    const itemIndex = cart.findIndex((item) => Number(item.id) === Number(id));
    if (itemIndex > -1) {
      const product = await productModel.getProductById(id);
      const stock = Number(product?.stock || 0);
      cart[itemIndex].quantity = Math.max(0, Math.min(Number(quantity), stock));
      
      if (cart[itemIndex].quantity === 0) {
        req.session.cart = cart.filter((it, idx) => idx !== itemIndex);
      }
    }

    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to save cart" });
      res.status(200).json({ success: true, cart: req.session.cart });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const clearCart = (req, res) => {
  req.session.cart = [];
  req.session.save((err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to clear cart" });
    res.status(200).json({ success: true, cart: [] });
  });
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
};
