// ============================================
// controllers/order.js
// Purpose: Handle HTTP requests for orders
// ============================================

const orderService = require("../service/order");

// POST /api/orders — Create an order from the cart
async function createOrder(req, res, next) {
    try {
        const customerId = req.customer.id;

        const order = await orderService.createOrderFromCart(customerId);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/orders — Get all orders for the logged-in customer
async function getMyOrders(req, res, next) {
    try {
        const customerId = req.customer.id;

        const orders = await orderService.getCustomerOrders(customerId);

        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: orders,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/orders/:id — Get a single order by ID
async function getOrderById(req, res, next) {
    try {
        const customerId = req.customer.id;
        const orderId = req.params.id;

        const order = await orderService.getOrderById(orderId, customerId);

        res.status(200).json({
            success: true,
            message: "Order retrieved successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/orders/:id/status — Update order status
async function updateOrderStatus(req, res, next) {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const order = await orderService.updateOrderStatus(orderId, status);

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
};

