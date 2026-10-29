// ============================================
// Config/database.js
// Purpose: Create a connection pool to PostgreSQL
// Used by: Every model file that needs to query the database
// ============================================

// "require" loads an external package or file so we can use it.
// "dotenv" reads the .env file and makes its values available via process.env
const dotenv = require("dotenv");

// This line actually reads the .env file and loads the variables.
// After this, process.env.DB_USER will equal "postgres", etc.
dotenv.config();

// "pg" is the PostgreSQL client library for Node.js.
// "Pool" is the class that manages our connection pool.
const { Pool } = require("pg");

// Create a new pool using the values from our .env file.
// The pool will automatically manage opening and closing connections.
const pool = new Pool({
    user: process.env.DB_USER,         // "postgres"
    password: process.env.DB_PASSWORD, // "2377"
    host: process.env.DB_HOST,         // "localhost"
    port: process.env.DB_PORT,         // 5432
    database: process.env.DB_NAME,     // "backend_be"
});

// "module.exports" makes the pool available to other files.
// Any file that does: const pool = require("../Config/database");
// will receive this pool object and can use pool.query(...) to talk to the database.
module.exports = pool;

