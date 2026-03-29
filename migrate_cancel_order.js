require("dotenv").config();
const db = require("./src/config/db");

async function migrate() {
  try {
    console.log("Starting DB Migration: Updating orders table for cancellation...");
    
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'placed',
      ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
      ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
    `);
    
    console.log("Migration successful: Cancellation columns added to orders table.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
