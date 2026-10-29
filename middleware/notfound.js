// ============================================
// middleware/notfound.js
// Purpose: Handle requests to URLs that do not exist
// This runs when NO route matched the incoming request.
// Placed AFTER all routes in app.js.
// ============================================

function notFoundMiddleware(req, res, next) {
    // Create a new Error object with a helpful message.
    // req.originalUrl contains the URL the client tried to access.
    // For example, if they visited /api/pizzas, this message would say:
    // "The route GET /api/pizzas was not found on this server"
    const error = new Error(
        "The route " + req.method + " " + req.originalUrl + " was not found on this server"
    );

    // Set the status code to 404 (Not Found)
    error.statusCode = 404;

    // Pass the error to the error middleware.
    // "next(error)" tells Express: "Skip everything else and go
    // straight to the error-handling middleware."
    next(error);
}

// Export so app.js can use it
module.exports = notFoundMiddleware;

