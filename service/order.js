// ============================================
// service/order.js
// Purpose: Business logic for orders
//
// The most important function here is createOrderFromCart().
// It uses a DATABASE TRANSACTION to make sure that either:
//   - ALL steps succeed (order created, stock deducted, cart cleared)
//   - OR NONE of them happen (everything rolls back)
//
// What is a transaction? Simple explanation:
//   Imagine you're at a bank transferring $100 from Account A to Account B.
//   Two things must happen: (1) subtract $100 from A, (2) add $100 to B.
//   If step 1 succeeds but step 2 fails, the money disappears!
//   A transaction prevents this. If ANY step fails, ALL steps are undone.
//
//   BEGIN    → "Start a transaction. Everything after this is temporary."
//   COMMIT   → "Everything succeeded! Make all changes permanent."
//   ROLLBACK → "Something failed! Undo ALL changes since BEGIN."
// ============================================

const pool = require("../Config/database");
const orderModel = require("../models/order");
const cartModel = require("../models/cart");
const authModel = require("../models/auth");

// Create an order from the customer's cart
async function createOrderFromCart(customerId) {
    // ---- Step 1: Get the customer ----
    const customer = await authModel.getCustomerById(customerId);
    if (!customer) {
        const error = new Error("Customer not found");
        error.statusCode = 404;
        throw error;
    }

    // ---- Step 2: Get the customer's cart ----
    const cart = await cartModel.getCartByCustomerId(customerId);
    if (!cart) {
        const error = new Error("You don't have a cart yet. Add items to your cart first.");
        error.statusCode = 400;
        throw error;
    }

    // ---- Step 3: Get the cart items ----
    const cartItems = await cartModel.getCartItems(cart.id);
    if (cartItems.length === 0) {
        const error = new Error("Your cart is empty. Add items before placing an order.");
        error.statusCode = 400;
        throw error;
    }

    // ---- Step 4: Start a database transaction ----
    // pool.connect() gives us a dedicated database connection (client)
    // that we use for all queries in this transaction.
    const client = await pool.connect();

    try {
        // BEGIN tells PostgreSQL: "Start a transaction"
        await client.query("BEGIN");

        // ---- Step 5: Calculate total and deduct stock for each item ----
        let totalAmount = 0;

        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            const subtotal = Number(item.quantity) * Number(item.product_price);
            totalAmount = totalAmount + subtotal;

            // Deduct stock. If there isn't enough stock, this returns undefined.
            const updatedProduct = await orderModel.deductProductStock(
                client,
                item.product_id,
                item.quantity
            );

            // If deduction failed, it means not enough stock
            if (!updatedProduct) {
                const error = new Error(
                    "Insufficient stock for product: " + item.product_name +
                    ". Requested: " + item.quantity +
                    ". Please reduce the quantity or remove the item."
                );
                error.statusCode = 409;
                throw error;
            }
        }

        // ---- Step 6: Create the order record ----
        const order = await orderModel.createOrder(
            client,
            customerId,
            customer.name,
            totalAmount
        );

        // ---- Step 7: Create order items ----
        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            const subtotal = Number(item.quantity) * Number(item.product_price);

            await orderModel.createOrderItem(
                client,
                order.id,
                item.product_id,
                item.quantity,
                Number(item.product_price),
                subtotal
            );
        }

        // ---- Step 8: Clear the cart ----
        await orderModel.clearCartItems(client, cart.id);

        // ---- Step 9: COMMIT the transaction ----
        // All steps succeeded! Make everything permanent.
        await client.query("COMMIT");

        // ---- Step 10: Get the complete order with items ----
        const orderItems = await orderModel.getOrderItems(order.id);

        return {
            id: order.id,
            customer_name: order.customer_name,
            total_amount: order.total_amount,
            status: order.status,
            created_at: order.created_at,
            items: orderItems,
        };
    } catch (error) {
        // Something failed! ROLLBACK undoes ALL changes since BEGIN.
        await client.query("ROLLBACK");
        throw error;
    } finally {
        // Always release the client back to the pool,
        // whether the transaction succeeded or failed.
        client.release();
    }
}

// Get all orders for a customer
async function getCustomerOrders(customerId) {
    const orders = await orderModel.getOrdersByCustomerId(customerId);
    return orders;
}

// Get a single order with its items
async function getOrderById(orderId, customerId) {
    const order = await orderModel.getOrderById(orderId);

    if (!order) {
        const error = new Error("Order with ID " + orderId + " was not found");
        error.statusCode = 404;
        throw error;
    }

    // Make sure the customer can only see their own orders
    if (order.customer_id !== customerId) {
        const error = new Error("You do not have permission to view this order");
        error.statusCode = 403;
        throw error;
    }

    const orderItems = await orderModel.getOrderItems(orderId);

    return {
        ...order,
        items: orderItems,
    };
}

// Update order status
async function updateOrderStatus(orderId, status) {
    // Validate the new status
    const allowedStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
        const error = new Error(
            "Invalid status. Allowed values: " + allowedStatuses.join(", ")
        );
        error.statusCode = 400;
        throw error;
    }

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
        const error = new Error("Order with ID " + orderId + " was not found");
        error.statusCode = 404;
        throw error;
    }

    const updatedOrder = await orderModel.updateOrderStatus(orderId, status);
    return updatedOrder;
}

module.exports = {
    createOrderFromCart,
    getCustomerOrders,
    getOrderById,
    updateOrderStatus,
};

