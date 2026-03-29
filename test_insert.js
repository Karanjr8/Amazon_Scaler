require("dotenv").config();
const db = require("./src/config/db");async function test() {
  try {
    const products = await db.query("SELECT id FROM products LIMIT 1");
    const users = await db.query("SELECT id FROM users LIMIT 1");
    
    if (products.rowCount === 0 || users.rowCount === 0) {
      console.log("Missing product or user");
      process.exit(0);
    }
    
    const pid = products.rows[0].id;
    const uid = users.rows[0].id;
    
    console.log(`Inserting review for P=${pid}, U=${uid}`);
    
    await db.query(`
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
    `, [pid, uid, 5, 'Test']);
    
    console.log("Insert ok!");
  } catch (err) {
    console.error("DB Error Detail:", err.detail);
    console.error("DB Error Constraint:", err.constraint);
    console.error("DB Error Msg:", err.message);
  }
  process.exit(0);
}

test();
