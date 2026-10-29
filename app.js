// ============================================
// app.js
// Purpose: Configure the Express application
// This is the HEART of our backend. Everything connects here.
// ============================================

const express = require("express");
const dotenv = require("dotenv");

// Load .env variables before anything else
dotenv.config();

// ---- Import all route files ----
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const manufacturingRoutes = require("./routes/manufacturing");
const deliveryRoutes = require("./routes/delivery");

// ---- Import middleware ----
const notFoundMiddleware = require("./middleware/notfound");
const errorMiddleware = require("./middleware/errormiddleware");

// ---- Create the Express app ----
const app = express();

// ---- Parse JSON request bodies ----
app.use(express.json());

// ---- Health check route ----
app.get("/", function (req, res) {
    res.status(200).json({
        success: true,
        message: "B2B Hardware Management API is running!",
    });
});

// ---- Mount all route groups ----
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/manufacturing", manufacturingRoutes);
app.use("/api/deliveries", deliveryRoutes);

// ---- Error handling (must be AFTER all routes) ----
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
