// ============================================
// models/manufacturing.js
// Purpose: Run SQL queries for the manufacturing_jobs table
// Used by: service/manufacturing.js
//
// Some functions take a "client" parameter for transaction support.
// When completing a manufacturing job, we need to update both the
// job status AND the product stock atomically (all or nothing).
// ============================================

const pool = require("../Config/database");

// Create a new manufacturing job
async function createManufacturingJob(productId, plannedQuantity) {
    const result = await pool.query(
        "INSERT INTO manufacturing_jobs (product_id, planned_quantity) VALUES ($1, $2) RETURNING *",
        [productId, plannedQuantity]
    );
    return result.rows[0];
}

// Get all manufacturing jobs with product names
async function getAllManufacturingJobs() {
    const result = await pool.query(
        `SELECT mj.*, p.name AS product_name
         FROM manufacturing_jobs mj
         JOIN products p ON mj.product_id = p.id
         ORDER BY mj.id`
    );
    return result.rows;
}

// Get a single manufacturing job by its ID
async function getManufacturingJobById(id) {
    const result = await pool.query(
        `SELECT mj.*, p.name AS product_name
         FROM manufacturing_jobs mj
         JOIN products p ON mj.product_id = p.id
         WHERE mj.id = $1`,
        [id]
    );
    return result.rows[0];
}

// Update the status of a manufacturing job (e.g., pending → in_progress)
async function updateManufacturingJobStatus(id, status) {
    const result = await pool.query(
        "UPDATE manufacturing_jobs SET status = $1 WHERE id = $2 RETURNING *",
        [id, status]
    );
    return result.rows[0];
}

// ---- Transaction-based functions ----

// Mark a job as completed and record how many units were actually made
async function completeManufacturingJob(client, id, completedQuantity) {
    const result = await client.query(
        "UPDATE manufacturing_jobs SET status = 'completed', completed_quantity = $1 WHERE id = $2 RETURNING *",
        [completedQuantity, id]
    );
    return result.rows[0];
}

// Increase a product's stock quantity (when manufacturing is done)
async function increaseProductStock(client, productId, quantity) {
    const result = await client.query(
        "UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2 RETURNING *",
        [quantity, productId]
    );
    return result.rows[0];
}

module.exports = {
    createManufacturingJob,
    getAllManufacturingJobs,
    getManufacturingJobById,
    updateManufacturingJobStatus,
    completeManufacturingJob,
    increaseProductStock,
};

