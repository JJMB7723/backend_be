// ============================================
// routes/auth.js
// Purpose: Define URL endpoints for authentication
// ============================================

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// POST /api/auth/register → Register a new customer
router.post("/register", authController.register);

// POST /api/auth/login → Log in a customer
router.post("/login", authController.login);

module.exports = router;

