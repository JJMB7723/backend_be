// ============================================
// routes/order.js
// Purpose: Define URL endpoints for order operations
// Order creation and viewing require authentication
// ============================================

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
const authMiddleware = require("../middleware/authMiddleware");

// POST  /api/orders              → Create an order from the cart (requires login)
router.post("/", authMiddleware, orderController.createOrder);

// GET   /api/orders              → Get all orders for the logged-in customer (requires login)
router.get("/", authMiddleware, orderController.getMyOrders);

// GET   /api/orders/:id          → Get a single order by ID (requires login)
router.get("/:id", authMiddleware, orderController.getOrderById);

// PATCH /api/orders/:id/status   → Update order status
router.patch("/:id/status", orderController.updateOrderStatus);

module.exports = router;

