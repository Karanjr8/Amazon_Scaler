const orderModel = require("../models/orderModel");

const getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const orders = await orderModel.getOrdersByUserId(userId);

    // Normalize items within each order for frontend & extension compatibility
    const normalizedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        title: item.product_name,
        price: item.unit_price,
        rating: { rate: 0 }, // Order items don't have active ratings in DB, but we normalize for safety
      })),
    }));

    return res.status(200).json({
      success: true,
      data: normalizedOrders,
    });
  } catch (error) {
    console.error("[orderController.getOrderHistory] Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { total, deliveryAddress, paymentMethod, items } = req.body;

    // STEP 5 REQUIREMENT: Debug session user logging
    console.log("Session user:", req.session.user);
    if (!req.session.user) {
      console.warn("[orderController.createOrder] WARNING: Session user is missing in a protected route!");
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    const order = await orderModel.createOrder({
      userId,
      total,
      deliveryAddress,
      paymentMethod: paymentMethod || "COD",
      items,
    });

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.message.includes("USER_NOT_FOUND")) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or the database has changed. Please Log In again to place your order.",
      });
    }
    if (error.message.includes("OUT_OF_STOCK")) {
      return res.status(400).json({
        success: false,
        message: error.message.split(": ")[1] || "One or more items are out of stock.",
      });
    }
    return next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ success: false, message: "Order ID and reason are required" });
    }

    const cancelledOrder = await orderModel.cancelOrder(userId, orderId, reason);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder,
    });
  } catch (error) {
    if (error.message.includes("ORDER_NOT_FOUND_OR_UNCANCELABLE")) {
      return res.status(400).json({
        success: false,
        message: "Order not found or cannot be cancelled",
      });
    }
    console.error("[orderController.cancelOrder] Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getOrderHistory,
  createOrder,
  cancelOrder,
};
