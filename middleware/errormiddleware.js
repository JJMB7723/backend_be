// ============================================
// middleware/errorMiddleware.js
// Purpose: Catch ALL errors in one central place
// When any route calls next(error), Express jumps here.
//
// IMPORTANT: This function has 4 parameters (error, req, res, next).
// Express uses the 4-parameter signature to identify error middleware.
// Do NOT remove any of the 4 parameters, even if "next" is not used.
// ============================================

function errorMiddleware(error, req, res, next) {
    // ---- Step 1: Log the error for debugging ----
    // This prints to YOUR terminal (the server console), NOT to the client.
    // During development, this helps you find and fix bugs.
    console.error("--- ERROR ---");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("--- END ERROR ---");

    // ---- Step 2: Determine the status code ----
    // If the error already has a statusCode (we set it manually), use it.
    // Otherwise, default to 500 (Internal Server Error).
    const statusCode = error.statusCode || 500;

    // ---- Step 3: Determine the error message ----
    // For 500 errors, we send a generic message to the client.
    // We do NOT want to expose internal details like SQL errors or
    // stack traces to the outside world — that would be a security risk.
    let message = error.message;

    if (statusCode === 500) {
        message = "Something went wrong on the server. Please try again later.";
    }

    // ---- Step 4: Send a clean JSON error response ----
    res.status(statusCode).json({
        success: false,
        message: message,
    });
}

// Export so app.js can use it
module.exports = errorMiddleware;

