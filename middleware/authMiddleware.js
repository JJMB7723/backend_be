// ============================================
// middleware/authMiddleware.js
// Purpose: Protect routes that require login
//
// How JWT authentication works (simple explanation):
//
// 1. Customer logs in with email + password
// 2. Server checks credentials and creates a JWT token (like a digital ID card)
// 3. Server sends the token back to the customer
// 4. Customer includes this token in every future request (in the Authorization header)
// 5. This middleware checks the token:
//    - Is there a token? If not → reject (401)
//    - Is the token valid? If not → reject (401)
//    - Token is valid → attach customer info to req.customer and allow the request
//
// In Postman, you set the token like this:
//   Header name: Authorization
//   Header value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp... (your token)
// ============================================

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        // ---- Step 1: Get the Authorization header ----
        const authHeader = req.headers.authorization;

        // Check if the header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const error = new Error("Access denied. No token provided. Please log in first.");
            error.statusCode = 401;
            throw error;
        }

        // ---- Step 2: Extract the token ----
        // The header looks like: "Bearer eyJhbGciOi..."
        // split(" ") breaks it into ["Bearer", "eyJhbGciOi..."]
        // [1] grabs the second part (the actual token)
        const token = authHeader.split(" ")[1];

        // ---- Step 3: Verify the token ----
        // jwt.verify() checks if the token was created by our server
        // (using our JWT_SECRET) and hasn't been tampered with.
        // If valid, it returns the data we stored in the token (id, name, email).
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ---- Step 4: Attach customer info to the request ----
        // Now any controller can access req.customer.id, req.customer.name, etc.
        req.customer = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
        };

        // ---- Step 5: Allow the request to proceed ----
        next();
    } catch (error) {
        // If jwt.verify() fails, it throws a specific error type
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            error.message = "Invalid or expired token. Please log in again.";
            error.statusCode = 401;
        }
        if (!error.statusCode) {
            error.statusCode = 401;
        }
        next(error);
    }
}

module.exports = authMiddleware;

