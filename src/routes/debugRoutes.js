const express = require("express");
const db = require("../config/db");

const router = express.Router();

// STEP 6: DEBUG SUPPORT - GET /api/debug/db
router.get("/db", async (req, res) => {
  try {
    const { rows: dbNameRow } = await db.query("SELECT current_database()");
    const currentDb = dbNameRow[0].current_database;

    const { rows: tableRows } = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name ASC");
    
    // Attempt to fetch sample rows from products
    let sampleProducts = [];
    try {
      const { rows } = await db.query("SELECT * FROM products ORDER BY id DESC LIMIT 5");
      sampleProducts = rows;
    } catch (e) {
      console.log("[DEBUG ROUTE] Error fetching products or table missing yet:", e.message);
    }

    res.status(200).json({
      success: true,
      data: {
        current_database: currentDb,
        tables: tableRows.map(t => t.table_name),
        products_sample: sampleProducts,
      }
    });
  } catch (error) {
    console.error("[GET /api/debug/db] ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Database debug connection failed",
      error: error.message
    });
  }
});

module.exports = router;
