// ============================================
// controllers/manufacturing.js
// Purpose: Handle HTTP requests for manufacturing jobs
// ============================================

const manufacturingService = require("../service/manufacturing");

// POST /api/manufacturing — Create a new manufacturing job
async function createJob(req, res, next) {
    try {
        const { product_id, planned_quantity } = req.body;

        const job = await manufacturingService.createManufacturingJob(product_id, planned_quantity);

        res.status(201).json({
            success: true,
            message: "Manufacturing job created successfully",
            data: job,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/manufacturing — Get all manufacturing jobs
async function getAllJobs(req, res, next) {
    try {
        const jobs = await manufacturingService.getAllManufacturingJobs();

        res.status(200).json({
            success: true,
            message: "Manufacturing jobs retrieved successfully",
            data: jobs,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/manufacturing/:id — Get a single manufacturing job
async function getJobById(req, res, next) {
    try {
        const id = req.params.id;

        const job = await manufacturingService.getManufacturingJobById(id);

        res.status(200).json({
            success: true,
            message: "Manufacturing job retrieved successfully",
            data: job,
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/manufacturing/:id/status — Update job status
async function updateJobStatus(req, res, next) {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const job = await manufacturingService.updateManufacturingJobStatus(id, status);

        res.status(200).json({
            success: true,
            message: "Manufacturing job status updated successfully",
            data: job,
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/manufacturing/:id/complete — Complete a manufacturing job
async function completeJob(req, res, next) {
    try {
        const id = req.params.id;
        const { completed_quantity } = req.body;

        const result = await manufacturingService.completeManufacturingJob(id, completed_quantity);

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                job: result.job,
                product: result.product,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJobStatus,
    completeJob,
};

