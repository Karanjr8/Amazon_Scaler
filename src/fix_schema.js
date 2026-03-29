require('dotenv').config({path: '../.env'});
const pg = require('pg');

async function fixSchema() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Neon...");
    await pool.query("ALTER ROLE neondb_owner SET search_path TO public;");
    console.log("PERMANENT SCHEMA FIX APPLIED SUCCESSFULLY.");
  } catch (err) {
    console.error("FAILED TO APPLY PERMANENT FIX:", err.message);
    console.log("Suggestion: Run 'ALTER ROLE neondb_owner SET search_path TO public;' directly in the Neon SQL Console.");
  } finally {
    await pool.end();
  }
}

fixSchema();
