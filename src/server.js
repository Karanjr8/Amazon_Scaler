const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const fs = require("fs");

const app = require("./app");
const db = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await db.query("SELECT 1");
    // Explicitly set search_path to ensure Neon uses public schema
    await db.query("SET search_path TO public;");
    // console.log("Connected to PostgreSQL");

    const result = await db.query("SELECT current_database()");
    console.log("Connected DB:", result.rows[0].current_database);

    // Ensure baseline schema exists (idempotent due to IF NOT EXISTS).
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    
    // Split SQL statements by semicolon and execute one by one to avoid multi-query issues
    const statements = schemaSql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await db.query(statement);
    }
    console.log("Database schema is fully synchronized");

    // Display all active tables to verify schema creation
    const { rows: tables } = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("ACTIVE TABLES IN PUBLIC SCHEMA:", tables.map(t => t.table_name).join(', '));

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
