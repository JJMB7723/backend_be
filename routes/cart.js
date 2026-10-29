// ============================================
// routes/cart.js
// Purpose: Define URL endpoints for cart operations
// All cart routes require authentication (authMiddleware)
// ============================================

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const authMiddleware = require("../middleware/authMiddleware");

// All routes below require login — authMiddleware checks the JWT token
// POST   /api/cart/items            → Add an item to the cart
router.post("/items", authMiddleware, cartController.addItem);

// GET    /api/cart                   → Get the cart with all items
router.get("/", authMiddleware, cartController.getCart);

// PUT    /api/cart/items/:itemId     → Update quantity of a cart item
router.put("/items/:itemId", authMiddleware, cartController.updateItem);

// DELETE /api/cart/items/:itemId     → Remove an item from the cart
router.delete("/items/:itemId", authMiddleware, cartController.removeItem);

module.exports = router;

