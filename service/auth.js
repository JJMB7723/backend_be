// ============================================
// service/auth.js
// Purpose: Business logic for authentication (register + login)
//
// Key concepts:
// - bcrypt: Hashes passwords so we never store the real password
// - JWT: Creates a token (like a digital ID card) after login
// ============================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/auth");

// Register a new customer
async function registerCustomer(name, email, password) {
    // ---- Validate inputs ----
    if (!name || name.trim() === "") {
        const error = new Error("Name is required");
        error.statusCode = 400;
        throw error;
    }

    if (!email || email.trim() === "") {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
    }

    if (!password || password.length < 6) {
        const error = new Error("Password is required and must be at least 6 characters");
        error.statusCode = 400;
        throw error;
    }

    // ---- Check if email is already registered ----
    const existingCustomer = await authModel.getCustomerByEmail(email.trim());
    if (existingCustomer) {
        const error = new Error("A customer with this email already exists");
        error.statusCode = 409;
        throw error;
    }

    // ---- Hash the password ----
    // bcrypt.hash() takes the plain password and a "salt rounds" number.
    // Salt rounds (10) = how many times the password is scrambled.
    // Higher = more secure but slower. 10 is a good default.
    // Example: "mypassword" → "$2a$10$X7jK9z..."
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ---- Save the customer ----
    const customer = await authModel.createCustomer(name.trim(), email.trim(), hashedPassword);

    return customer;
}

// Log in an existing customer
async function loginCustomer(email, password) {
    // ---- Validate inputs ----
    if (!email || email.trim() === "") {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
    }

    if (!password) {
        const error = new Error("Password is required");
        error.statusCode = 400;
        throw error;
    }

    // ---- Find the customer by email ----
    const customer = await authModel.getCustomerByEmail(email.trim());
    if (!customer) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // ---- Compare the typed password with the stored hash ----
    // bcrypt.compare() hashes the typed password the same way
    // and checks if it matches the stored hash.
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // ---- Create a JWT token ----
    // jwt.sign() creates a token containing the customer's info.
    // The token is "signed" with our secret key so nobody can fake it.
    // expiresIn: "24h" means the token is valid for 24 hours.
    const token = jwt.sign(
        {
            id: customer.id,
            name: customer.name,
            email: customer.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    // Return customer info (without password) and the token
    return {
        customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
        },
        token: token,
    };
}

module.exports = {
    registerCustomer,
    loginCustomer,
};

