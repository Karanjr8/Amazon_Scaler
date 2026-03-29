require("dotenv").config();
const db = require("./src/config/db");

async function migrate() {
  try {
    console.log("Starting migration...");
    await db.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS brand VARCHAR(255),
      ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS images JSONB;
    `);
    console.log("Migration successful: added brand, seller_name, original_price, images.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

migrate();
