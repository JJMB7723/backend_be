// ============================================
// server.js
// Purpose: Start the server and test the database connection
// This is the ENTRY POINT of the application.
// When you run "npm start", Node.js executes this file.
// ============================================

// ---- Step 1: Import the configured Express app ----
const app = require("./app");

// ---- Step 2: Import the database connection pool ----
const pool = require("./Config/database");

// ---- Step 3: Read the port from .env ----
// If PORT is not set in .env, use 5000 as a fallback.
const PORT = process.env.PORT || 5000;

// ---- Step 4: Define the startup function ----

// We use an async function because testing the database connection
// requires "await" (it takes time to connect to PostgreSQL).
async function startServer() {
    try {
        // ---- Step 4a: Test the database connection ----
        // We run a simple query to check if PostgreSQL is reachable.
        // "SELECT NOW()" just asks the database: "What time is it?"
        // If this works, the connection is good.
        const result = await pool.query("SELECT NOW()");

        console.log("--------------------------------------------");
        console.log("Database connected successfully!");
        console.log("Current database time:", result.rows[0].now);
        console.log("--------------------------------------------");

        // ---- Step 4b: Start listening for requests ----
        // app.listen() tells Express: "Start accepting requests on this port."
        // The callback function runs once the server is ready.
        app.listen(PORT, function () {
            console.log("Server is running on http://localhost:" + PORT);
            console.log("--------------------------------------------");
        });
    } catch (error) {
        // If the database connection fails, show the error and stop.
        // Common reasons: PostgreSQL is not running, wrong password,
        // database does not exist, or wrong port.
        console.error("--------------------------------------------");
        console.error("Failed to connect to the database!");
        console.error("Error:", error.message);
        console.error("--------------------------------------------");
        console.error("Checklist:");
        console.error("1. Is PostgreSQL running?");
        console.error("2. Is the database name correct in .env?");
        console.error("3. Is the password correct in .env?");
        console.error("4. Is the port correct in .env? (default: 5432)");
        console.error("--------------------------------------------");

        // process.exit(1) shuts down the application.
        // "1" means "exit with an error."
        process.exit(1);
    }
}

// ---- Step 5: Call the startup function ----
startServer();

