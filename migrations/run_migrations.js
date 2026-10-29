// ============================================
// migrations/run_migrations.js
// Purpose: Read the SQL migration file and execute it against PostgreSQL
//
// How to run: node migrations/run_migrations.js
//
// This script:
//   1. Connects to the database using our pool
//   2. Reads the SQL file
//   3. Executes all the SQL commands
//   4. Reports success or failure
//   5. Exits
// ============================================

// "fs" is a built-in Node.js module for reading files from disk.
// We don't need to install it — it comes with Node.js.
const fs = require("fs");

// "path" is a built-in Node.js module for working with file paths.
// It helps us build correct file paths that work on any operating system.
const path = require("path");

// Import our database connection pool.
// "../Config/database" means "go up one folder, then into Config/database.js"
const pool = require("../Config/database");

async function runMigrations() {
    try {
        console.log("Starting database migrations...");
        console.log("--------------------------------------------");

        // ---- Step 1: Build the path to our SQL file ----
        // __dirname is a special Node.js variable that contains the path
        // to the folder where THIS script is located (the migrations/ folder).
        // path.join() combines folder paths safely.
        const sqlFilePath = path.join(__dirname, "001_create_tables.sql");

        // ---- Step 2: Read the SQL file ----
        // fs.readFileSync() reads the entire file and returns its contents as text.
        // "utf-8" tells Node.js to read it as normal text (not binary data).
        const sql = fs.readFileSync(sqlFilePath, "utf-8");

        // ---- Step 3: Execute the SQL ----
        // pool.query() sends the SQL commands to PostgreSQL.
        // PostgreSQL will create all the tables one by one.
        // "CREATE TABLE IF NOT EXISTS" means: if the table already exists,
        // skip it without throwing an error.
        await pool.query(sql);

        console.log("All tables created successfully!");
        console.log("--------------------------------------------");
        console.log("Tables created:");
        console.log("  1. customers");
        console.log("  2. products");
        console.log("  3. carts");
        console.log("  4. cart_items");
        console.log("  5. orders");
        console.log("  6. order_items");
        console.log("  7. manufacturing_jobs");
        console.log("  8. deliveries");
        console.log("--------------------------------------------");
    } catch (error) {
        console.error("Migration failed!");
        console.error("Error:", error.message);
    } finally {
        // ---- Step 4: Close the connection pool ----
        // pool.end() closes all database connections.
        // We do this because this is a one-time script, not a running server.
        // "finally" runs whether the try succeeded or failed.
        await pool.end();
        console.log("Database connection closed.");
    }
}

// Run the migration
runMigrations();

