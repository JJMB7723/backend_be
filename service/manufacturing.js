// ============================================
// service/manufacturing.js
// Purpose: Business logic for manufacturing jobs
//
// Key business rule:
// When a manufacturing job is completed, the completed_quantity is ADDED
// to the product's stock. This uses a database transaction so both
// the job update and stock increase happen together (all or nothing).
//
// IMPORTANT: A completed job CANNOT be completed again.
// This prevents accidentally doubling the stock.
// ============================================

const pool = require("../Config/database");
const manufacturingModel = require("../models/manufacturing");
const productModel = require("../models/product");

// Create a new manufacturing job
async function createManufacturingJob(productId, plannedQuantity) {
    // ---- Validate inputs ----
    if (!productId) {
        const error = new Error("Product ID is required");
        error.statusCode = 400;
        throw error;
    }

    if (!plannedQuantity || Number(plannedQuantity) <= 0) {
        const error = new Error("Planned quantity must be a positive number");
        error.statusCode = 400;
        throw error;
    }

    // ---- Check if the product exists ----
    const product = await productModel.getProductById(productId);
    if (!product) {
        const error = new Error("Product with ID " + productId + " was not found");
        error.statusCode = 404;
        throw error;
    }

    const job = await manufacturingModel.createManufacturingJob(
        productId,
        Number(plannedQuantity)
    );

    return job;
}

// Get all manufacturing jobs
async function getAllManufacturingJobs() {
    const jobs = await manufacturingModel.getAllManufacturingJobs();
    return jobs;
}

// Get a single manufacturing job
async function getManufacturingJobById(id) {
    const job = await manufacturingModel.getManufacturingJobById(id);

    if (!job) {
        const error = new Error("Manufacturing job with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    return job;
}

// Update the status of a job (e.g., pending → in_progress)
async function updateManufacturingJobStatus(id, status) {
    const allowedStatuses = ["pending", "in_progress", "cancelled"];
    if (!allowedStatuses.includes(status)) {
        const error = new Error(
            "Invalid status. Allowed values: " + allowedStatuses.join(", ") +
            ". To mark as completed, use the complete endpoint."
        );
        error.statusCode = 400;
        throw error;
    }

    const job = await manufacturingModel.getManufacturingJobById(id);
    if (!job) {
        const error = new Error("Manufacturing job with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    // Cannot change status of a completed job
    if (job.status === "completed") {
        const error = new Error("This job is already completed. Its status cannot be changed.");
        error.statusCode = 409;
        throw error;
    }

    const updatedJob = await manufacturingModel.updateManufacturingJobStatus(id, status);
    return updatedJob;
}

// Complete a manufacturing job and add stock to the product
async function completeManufacturingJob(id, completedQuantity) {
    // ---- Validate completed quantity ----
    if (!completedQuantity || Number(completedQuantity) <= 0) {
        const error = new Error("Completed quantity must be a positive number");
        error.statusCode = 400;
        throw error;
    }

    // ---- Get the job ----
    const job = await manufacturingModel.getManufacturingJobById(id);
    if (!job) {
        const error = new Error("Manufacturing job with ID " + id + " was not found");
        error.statusCode = 404;
        throw error;
    }

    // ---- CRITICAL CHECK: Prevent completing a job twice ----
    // If this job is already completed, reject the request.
    // Without this check, someone could accidentally click "complete"
    // twice and double the stock — a serious inventory error!
    if (job.status === "completed") {
        const error = new Error(
            "This manufacturing job has already been completed. " +
            "Stock was already added. Cannot complete it again."
        );
        error.statusCode = 409;
        throw error;
    }

    // ---- Start a transaction ----
    // We need to update the job AND increase stock atomically.
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Mark the job as completed
        const completedJob = await manufacturingModel.completeManufacturingJob(
            client,
            id,
            Number(completedQuantity)
        );

        // Increase the product's stock by the completed quantity
        const updatedProduct = await manufacturingModel.increaseProductStock(
            client,
            job.product_id,
            Number(completedQuantity)
        );

        await client.query("COMMIT");

        return {
            job: completedJob,
            product: updatedProduct,
            message: "Manufacturing job completed. " + completedQuantity +
                     " units of " + job.product_name + " added to stock."
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    createManufacturingJob,
    getAllManufacturingJobs,
    getManufacturingJobById,
    updateManufacturingJobStatus,
    completeManufacturingJob,
};

