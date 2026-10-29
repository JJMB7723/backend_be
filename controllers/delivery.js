// ============================================
// controllers/delivery.js
// Purpose: Handle HTTP requests for deliveries
// ============================================

const deliveryService = require("../service/delivery");

// POST /api/deliveries — Create a delivery for an order
async function createDelivery(req, res, next) {
    try {
        const { order_id, delivery_address } = req.body;

        const delivery = await deliveryService.createDelivery(order_id, delivery_address);

        res.status(201).json({
            success: true,
            message: "Delivery created successfully",
            data: delivery,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/deliveries — Get all deliveries
async function getAllDeliveries(req, res, next) {
    try {
        const deliveries = await deliveryService.getAllDeliveries();

        res.status(200).json({
            success: true,
            message: "Deliveries retrieved successfully",
            data: deliveries,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/deliveries/:id — Get a single delivery
async function getDeliveryById(req, res, next) {
    try {
        const id = req.params.id;

        const delivery = await deliveryService.getDeliveryById(id);

        res.status(200).json({
            success: true,
            message: "Delivery retrieved successfully",
            data: delivery,
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/deliveries/:id/status — Update delivery status
async function updateDeliveryStatus(req, res, next) {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const delivery = await deliveryService.updateDeliveryStatus(id, status);

        res.status(200).json({
            success: true,
            message: "Delivery status updated successfully",
            data: delivery,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createDelivery,
    getAllDeliveries,
    getDeliveryById,
    updateDeliveryStatus,
};

