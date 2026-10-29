// ============================================
// service/delivery.js
// Purpose: Business logic for deliveries
//
// Key business rules:
// - A delivery can only be created for an existing order
// - Each order can have only ONE delivery (prevents duplicates)
// - Delivery does NOT deduct stock (stock was already deducted when the order was created)
// - Status flow: pending → shipped → delivered
// ============================================

const deliveryModel = require("../models/delivery");
const orderModel = require("../models/order");

// Create a delivery for an order
async function createDelivery(orderId, deliveryAddress) {
    // ---- Validate inputs ----
    if (!orderId) {
        const error = new Error("Order ID is required");
        error.statusCode = 400;
        throw error;
    }

    if (!deliveryAddress || deliveryAddress.trim() === "") {
        const error = new Error("Delivery address is required");
        error.statusCode = 400;
        throw error;
    }

    // ---- Check if the order exists ----
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
        const error = new Error("Order with ID " + orderId + " was not found");
        error.statusCode = 404;
        throw error;
    }

    // ---- Check for duplicate delivery ----
    // Each order can only have one delivery.
    const existingDelivery = await deliveryModel.getDeliveryByOrderId(orderId);
    if (existingDelivery) {
        const error = new Error(
            "A delivery already exists for order " + orderId +
            " (Delivery ID: " + existingDelivery.id + ")"
        );
        error.statusCode = 409;
        throw error;
    }

    const delivery = await deliveryModel.createDelivery(orderId, deliveryAddress.trim());
    return delivery;
}

// Get all deliveries
async function getAllDeliveries() {
    const deliveries = await deliveryModel.getAllDeliveries();
    return deliveries;
}

// Get a single delivery by ID
async function getDeliveryById(id) {
    const delivery = await deliveryModel.getDeliveryById(id);

    if (!delivery) {
        const error = new Error("Delivery with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    return delivery;
}

// Update delivery status
async function updateDeliveryStatus(id, status) {
    // ---- Validate the new status ----
    const allowedStatuses = ["pending", "shipped", "delivered"];
    if (!allowedStatuses.includes(status)) {
        const error = new Error(
            "Invalid status. Allowed values: " + allowedStatuses.join(", ")
        );
        error.statusCode = 400;
        throw error;
    }

    // ---- Check if delivery exists ----
    const delivery = await deliveryModel.getDeliveryById(id);
    if (!delivery) {
        const error = new Error("Delivery with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    // ---- Prevent changing status of already delivered orders ----
    if (delivery.status === "delivered") {
        const error = new Error("This delivery has already been delivered. Status cannot be changed.");
        error.statusCode = 409;
        throw error;
    }

    const updatedDelivery = await deliveryModel.updateDeliveryStatus(id, status);
    return updatedDelivery;
}

module.exports = {
    createDelivery,
    getAllDeliveries,
    getDeliveryById,
    updateDeliveryStatus,
};

