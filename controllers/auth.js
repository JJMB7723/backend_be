// ============================================
// controllers/auth.js
// Purpose: Handle HTTP requests for authentication (register + login)
// ============================================

const authService = require("../service/auth");

// POST /api/auth/register — Register a new customer
async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        const customer = await authService.registerCustomer(name, email, password);

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            data: customer,
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/auth/login — Log in a customer
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const result = await authService.loginCustomer(email, password);

        // The result contains { customer, token }
        // The client (Postman) should save the token and include it
        // in future requests as: Authorization: Bearer <token>
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
};

