require("dotenv").config();
const db = require("./src/config/db");

async function migrate() {
  try {
    console.log("Starting DB Migration: Updating orders table...");
    
    // Add delivery_address JSONB column
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS delivery_address JSONB,
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'COD'
    `);
    
    console.log("Migration successful: Columns added to orders table.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
