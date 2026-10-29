// ============================================
// service/product.js
// Purpose: Business logic for products
// Validates data before passing it to the model.
// The controller calls these functions, and these functions call the model.
//
// Flow: Controller → Service (this file) → Model → Database
// ============================================

const productModel = require("../models/product");

// Create a new product after validating the input
async function createProduct(name, description, price, stockQuantity) {
    // ---- Validation ----
    if (!name || name.trim() === "") {
        const error = new Error("Product name is required");
        error.statusCode = 400;
        throw error;
    }

    if (price === undefined || price === null) {
        const error = new Error("Product price is required");
        error.statusCode = 400;
        throw error;
    }

    if (Number(price) < 0) {
        const error = new Error("Product price cannot be negative");
        error.statusCode = 400;
        throw error;
    }

    if (stockQuantity !== undefined && Number(stockQuantity) < 0) {
        const error = new Error("Stock quantity cannot be negative");
        error.statusCode = 400;
        throw error;
    }

    // All checks passed — create the product
    const product = await productModel.createProduct(
        name.trim(),
        description || "",
        Number(price),
        stockQuantity !== undefined ? Number(stockQuantity) : 0
    );

    return product;
}

// Get all products (no validation needed)
async function getAllProducts() {
    const products = await productModel.getAllProducts();
    return products;
}

// Get one product by ID
async function getProductById(id) {
    const product = await productModel.getProductById(id);

    if (!product) {
        const error = new Error("Product with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    return product;
}

// Update a product
async function updateProduct(id, name, description, price, stockQuantity) {
    // Check if product exists first
    const existingProduct = await productModel.getProductById(id);
    if (!existingProduct) {
        const error = new Error("Product with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    // Validate inputs
    if (!name || name.trim() === "") {
        const error = new Error("Product name is required");
        error.statusCode = 400;
        throw error;
    }

    if (price === undefined || price === null) {
        const error = new Error("Product price is required");
        error.statusCode = 400;
        throw error;
    }

    if (Number(price) < 0) {
        const error = new Error("Product price cannot be negative");
        error.statusCode = 400;
        throw error;
    }

    if (stockQuantity !== undefined && Number(stockQuantity) < 0) {
        const error = new Error("Stock quantity cannot be negative");
        error.statusCode = 400;
        throw error;
    }

    const updatedProduct = await productModel.updateProduct(
        id,
        name.trim(),
        description || "",
        Number(price),
        stockQuantity !== undefined ? Number(stockQuantity) : 0
    );

    return updatedProduct;
}

// Delete a product
async function deleteProduct(id) {
    const product = await productModel.getProductById(id);

    if (!product) {
        const error = new Error("Product with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    const deletedProduct = await productModel.deleteProduct(id);
    return deletedProduct;
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};

