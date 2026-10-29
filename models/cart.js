// ============================================
// models/cart.js
// Purpose: Run SQL queries for the carts and cart_items tables
// Used by: service/cart.js
// ============================================

const pool = require("../Config/database");

// ---- Cart operations ----

// Find a customer's cart
async function getCartByCustomerId(customerId) {
    const result = await pool.query(
        "SELECT * FROM carts WHERE customer_id = $1",
        [customerId]
    );
    return result.rows[0];
}

// Create a new cart for a customer
async function createCart(customerId) {
    const result = await pool.query(
        "INSERT INTO carts (customer_id) VALUES ($1) RETURNING *",
        [customerId]
    );
    return result.rows[0];
}

// ---- Cart item operations ----

// Add a product to the cart
async function addCartItem(cartId, productId, quantity) {
    const result = await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [cartId, productId, quantity]
    );
    return result.rows[0];
}

// Check if a specific product is already in the cart
async function getCartItemByCartAndProduct(cartId, productId) {
    const result = await pool.query(
        "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
        [cartId, productId]
    );
    return result.rows[0];
}

// Get a single cart item by its ID
async function getCartItemById(itemId) {
    const result = await pool.query(
        "SELECT * FROM cart_items WHERE id = $1",
        [itemId]
    );
    return result.rows[0];
}

// Update the quantity of a cart item
async function updateCartItemQuantity(itemId, quantity) {
    const result = await pool.query(
        "UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *",
        [quantity, itemId]
    );
    return result.rows[0];
}

// Remove an item from the cart
async function removeCartItem(itemId) {
    const result = await pool.query(
        "DELETE FROM cart_items WHERE id = $1 RETURNING *",
        [itemId]
    );
    return result.rows[0];
}

// Get all items in a cart with product details (using JOIN)
// JOIN connects two tables: cart_items and products
// so we can see the product name and price alongside the quantity
async function getCartItems(cartId) {
    const result = await pool.query(
        `SELECT 
            ci.id, 
            ci.cart_id, 
            ci.product_id, 
            ci.quantity,
            p.name AS product_name, 
            p.price AS product_price,
            (ci.quantity * p.price) AS item_total
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1
         ORDER BY ci.id`,
        [cartId]
    );
    return result.rows;
}

// Calculate the total price of all items in the cart
// COALESCE means: if the result is NULL (empty cart), return 0 instead
async function getCartTotal(cartId) {
    const result = await pool.query(
        `SELECT COALESCE(SUM(ci.quantity * p.price), 0) AS total
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cartId]
    );
    return result.rows[0].total;
}

// Delete all items from a cart (used after placing an order)
async function clearCart(cartId) {
    await pool.query(
        "DELETE FROM cart_items WHERE cart_id = $1",
        [cartId]
    );
}

module.exports = {
    getCartByCustomerId,
    createCart,
    addCartItem,
    getCartItemByCartAndProduct,
    getCartItemById,
    updateCartItemQuantity,
    removeCartItem,
    getCartItems,
    getCartTotal,
    clearCart,
};

