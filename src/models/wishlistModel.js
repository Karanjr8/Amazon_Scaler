const db = require("../config/db");

const addWishlistItem = async (userId, productId) => {
  const query = `
    INSERT INTO wishlist (user_id, product_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, product_id) DO NOTHING
    RETURNING id
  `;

  const { rows } = await db.query(query, [userId, productId]);
  return rows.length > 0;
};

const isInWishlist = async (userId, productId) => {
  const { rows } = await db.query(
    `SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
    [userId, productId]
  );
  return rows.length > 0;
};

const removeWishlistItem = async (userId, productId) => {
  const query = `
    DELETE FROM wishlist
    WHERE user_id = $1 AND product_id = $2
  `;

  await db.query(query, [userId, productId]);
};

const getWishlistByUserId = async (userId) => {
  const query = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.category,
      p.image_url,
      w.created_at AS added_at
    FROM wishlist w
    INNER JOIN products p ON p.id = w.product_id
    WHERE w.user_id = $1
    ORDER BY w.created_at DESC
  `;

  const { rows } = await db.query(query, [userId]);
  return rows;
};

module.exports = {
  addWishlistItem,
  removeWishlistItem,
  getWishlistByUserId,
  isInWishlist,
};
