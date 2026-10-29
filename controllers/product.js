// ============================================
// controllers/product.js
// Purpose: Handle HTTP requests for products
//
// The controller's job:
// 1. Read data from the request (req.body, req.params)
// 2. Call the service function
// 3. Send the response back to the client
//
// It does NOT contain business logic — that's in service/product.js
// ============================================

const productService = require("../service/product");

// POST /api/products — Create a new product
async function createProduct(req, res, next) {
    try {
        // req.body contains the JSON data sent by Postman
        const { name, description, price, stock_quantity } = req.body;

        const product = await productService.createProduct(name, description, price, stock_quantity);

        // 201 means "Created" — a new resource was successfully created
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        // next(error) passes the error to the error middleware
        next(error);
    }
}

// GET /api/products — Get all products
async function getAllProducts(req, res, next) {
    try {
        const products = await productService.getAllProducts();

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: products,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/products/:id — Get one product by ID
async function getProductById(req, res, next) {
    try {
        // req.params.id contains the :id from the URL
        // For example, GET /api/products/5 → req.params.id = "5"
        const id = req.params.id;

        const product = await productService.getProductById(id);

        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/products/:id — Update a product
async function updateProduct(req, res, next) {
    try {
        const id = req.params.id;
        const { name, description, price, stock_quantity } = req.body;

        const product = await productService.updateProduct(id, name, description, price, stock_quantity);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/products/:id — Delete a product
async function deleteProduct(req, res, next) {
    try {
        const id = req.params.id;

        const product = await productService.deleteProduct(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};

