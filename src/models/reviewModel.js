const db = require("../config/db");

const createReview = async ({ productId, userId, rating, comment }) => {
  const query = `
    INSERT INTO reviews (product_id, user_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING id, product_id, user_id, rating, comment, created_at
  `;
  const values = [productId, userId, rating, comment];
  
  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    if (error.constraint === "reviews_user_id_product_id_key") {
      throw new Error("DUPLICATE_REVIEW");
    }
    if (error.constraint === "reviews_user_id_fkey") {
      throw new Error("INVALID_USER");
    }
    if (error.constraint === "reviews_product_id_fkey") {
      throw new Error("INVALID_PRODUCT");
    }
    console.error("[reviewModel.createReview] DB Error:", error);
    throw error;
  }
};

const getReviewsByProductId = async (productId) => {
  const query = `
    SELECT r.id, r.rating, r.comment, r.created_at, u.name as reviewer_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1
    ORDER BY r.created_at DESC
  `;
  const { rows } = await db.query(query, [productId]);
  return rows;
};

module.exports = {
  createReview,
  getReviewsByProductId,
};
