// ============================================
// routes/product.js
// Purpose: Define URL endpoints for product operations
// Each route maps an HTTP method + URL to a controller function
// ============================================

const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");

// POST   /api/products       → Create a new product
router.post("/", productController.createProduct);

// GET    /api/products       → Get all products
router.get("/", productController.getAllProducts);

// GET    /api/products/:id   → Get one product by ID
router.get("/:id", productController.getProductById);

// PUT    /api/products/:id   → Update a product
router.put("/:id", productController.updateProduct);

// DELETE /api/products/:id   → Delete a product
router.delete("/:id", productController.deleteProduct);

module.exports = router;
