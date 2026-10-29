// ============================================
// models/product.js
// Purpose: Run SQL queries for the products table
// Used by: service/product.js
// ============================================

const pool = require("../Config/database");

// Create a new product in the database
async function createProduct(name, description, price, stockQuantity) {
    const result = await pool.query(
        "INSERT INTO products (name, description, price, stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, description, price, stockQuantity]
    );
    return result.rows[0];
}

// Get all products ordered by ID
async function getAllProducts() {
    const result = await pool.query(
        "SELECT * FROM products ORDER BY id"
    );
    return result.rows;
}

// Get a single product by its ID
async function getProductById(id) {
    const result = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
    );
    return result.rows[0];
}

// Update a product's details
async function updateProduct(id, name, description, price, stockQuantity) {
    const result = await pool.query(
        "UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4 WHERE id = $5 RETURNING *",
        [name, description, price, stockQuantity, id]
    );
    return result.rows[0];
}

// Delete a product by its ID
async function deleteProduct(id) {
    const result = await pool.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};

