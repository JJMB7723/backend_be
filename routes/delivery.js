// ============================================
// routes/delivery.js
// Purpose: Define URL endpoints for delivery operations
// ============================================

const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/delivery");

// POST  /api/deliveries              → Create a delivery for an order
router.post("/", deliveryController.createDelivery);

// GET   /api/deliveries              → Get all deliveries
router.get("/", deliveryController.getAllDeliveries);

// GET   /api/deliveries/:id          → Get one delivery
router.get("/:id", deliveryController.getDeliveryById);

// PATCH /api/deliveries/:id/status   → Update delivery status
router.patch("/:id/status", deliveryController.updateDeliveryStatus);

module.exports = router;

