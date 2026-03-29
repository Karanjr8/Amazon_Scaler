const express = require("express");
const orderController = require("../controllers/orderController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/history", requireAuth, orderController.getOrderHistory);
router.post("/", requireAuth, orderController.createOrder);
router.post("/cancel/:orderId", requireAuth, orderController.cancelOrder);

module.exports = router;
