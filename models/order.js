// ============================================
// models/order.js
// Purpose: Run SQL queries for the orders and order_items tables
// Used by: service/order.js
//
// IMPORTANT: Some functions take a "client" parameter instead of using "pool".
// This is for database transactions. When we create an order, we need
// multiple queries to succeed or ALL fail together. A "client" is a single
// database connection that keeps the transaction alive.
// ============================================

const pool = require("../Config/database");

// ---- Transaction-based functions (use client) ----

// Create a new order (inside a transaction)
async function createOrder(client, customerId, customerName, totalAmount) {
    const result = await client.query(
        "INSERT INTO orders (customer_id, customer_name, total_amount) VALUES ($1, $2, $3) RETURNING *",
        [customerId, customerName, totalAmount]
    );
    return result.rows[0];
}

// Create one order item (inside a transaction)
async function createOrderItem(client, orderId, productId, quantity, unitPrice, subtotal) {
    const result = await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [orderId, productId, quantity, unitPrice, subtotal]
    );
    return result.rows[0];
}

// Deduct stock from a product (inside a transaction)
// The WHERE clause "stock_quantity >= $1" prevents overselling.
// If there isn't enough stock, this returns no rows (undefined).
async function deductProductStock(client, productId, quantity) {
    const result = await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING *",
        [quantity, productId]
    );
    return result.rows[0];
}

// Clear all items from the cart (inside a transaction)
async function clearCartItems(client, cartId) {
    await client.query(
        "DELETE FROM cart_items WHERE cart_id = $1",
        [cartId]
    );
}

// ---- Regular functions (use pool) ----

// Get all orders for a specific customer
async function getOrdersByCustomerId(customerId) {
    const result = await pool.query(
        "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
        [customerId]
    );
    return result.rows;
}

// Get a single order by its ID
async function getOrderById(orderId) {
    const result = await pool.query(
        "SELECT * FROM orders WHERE id = $1",
        [orderId]
    );
    return result.rows[0];
}

// Get all items in an order with product names
async function getOrderItems(orderId) {
    const result = await pool.query(
        `SELECT oi.*, p.name AS product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1
         ORDER BY oi.id`,
        [orderId]
    );
    return result.rows;
}

// Update the status of an order
async function updateOrderStatus(orderId, status) {
    const result = await pool.query(
        "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
        [status, orderId]
    );
    return result.rows[0];
}

module.exports = {
    createOrder,
    createOrderItem,
    deductProductStock,
    clearCartItems,
    getOrdersByCustomerId,
    getOrderById,
    getOrderItems,
    updateOrderStatus,
};

