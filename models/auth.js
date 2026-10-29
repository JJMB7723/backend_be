// ============================================
// models/auth.js
// Purpose: Run SQL queries for the customers table (authentication)
// Used by: service/auth.js
// ============================================

const pool = require("../Config/database");

// Create a new customer account
// IMPORTANT: We use RETURNING without the password column
// so we never accidentally send the password hash back
async function createCustomer(name, email, hashedPassword) {
    const result = await pool.query(
        "INSERT INTO customers (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
        [name, email, hashedPassword]
    );
    return result.rows[0];
}

// Find a customer by email (used during login)
// This DOES return the password hash because we need it to compare
// with the password the user typed during login
async function getCustomerByEmail(email) {
    const result = await pool.query(
        "SELECT * FROM customers WHERE email = $1",
        [email]
    );
    return result.rows[0];
}

// Find a customer by ID (used to get customer info)
// Does NOT return the password hash for safety
async function getCustomerById(id) {
    const result = await pool.query(
        "SELECT id, name, email, created_at FROM customers WHERE id = $1",
        [id]
    );
    return result.rows[0];
}

module.exports = {
    createCustomer,
    getCustomerByEmail,
    getCustomerById,
};

