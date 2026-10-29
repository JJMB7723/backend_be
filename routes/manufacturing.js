// ============================================
// routes/manufacturing.js
// Purpose: Define URL endpoints for manufacturing job operations
// ============================================

const express = require("express");
const router = express.Router();
const manufacturingController = require("../controllers/manufacturing");

// POST  /api/manufacturing                → Create a manufacturing job
router.post("/", manufacturingController.createJob);

// GET   /api/manufacturing                → Get all manufacturing jobs
router.get("/", manufacturingController.getAllJobs);

// GET   /api/manufacturing/:id            → Get one manufacturing job
router.get("/:id", manufacturingController.getJobById);

// PATCH /api/manufacturing/:id/status     → Update job status
router.patch("/:id/status", manufacturingController.updateJobStatus);

// POST  /api/manufacturing/:id/complete   → Complete a job and add stock
router.post("/:id/complete", manufacturingController.completeJob);

module.exports = router;

