const db = require("../config/db");

const getAllProducts = async ({ search, category, minPrice, maxPrice, sort }) => {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(name ILIKE $${values.length} OR COALESCE(description, '') ILIKE $${values.length})`
    );
  }

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (minPrice !== undefined) {
    values.push(Number(minPrice));
    conditions.push(`price >= $${values.length}`);
  }

  if (maxPrice !== undefined) {
    values.push(Number(maxPrice));
    conditions.push(`price <= $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const orderByMap = {
    price_asc: "ORDER BY price ASC",
    price_desc: "ORDER BY price DESC",
  };
    const orderByClause = orderByMap[sort] || "ORDER BY id DESC";
  
    const query = `
      SELECT id, name, description, price, stock, category, image_url, brand, seller_name, original_price, images
      FROM products
      ${whereClause}
      ${orderByClause}
    `;
  
    try {
      if (process.env.NODE_ENV !== "production") {
        console.log("[productModel.getAllProducts] Executing SQL:", query.trim());
      }
      const { rows } = await db.query(query, values);
      return rows;
    } catch (error) {
      console.error("[productModel.getAllProducts] DB ERROR:", error.message);
      throw error;
    }
  };

/** Image URLs from recent rows (hero); prefers new rows by created_at / id. */
const getLatestHeroImageUrls = async (maxUrls = 5) => {
  const cap = Math.min(20, Math.max(1, Number(maxUrls) || 5));
    const query = `
      SELECT image_url, images
      FROM products
      ORDER BY COALESCE(created_at, to_timestamp(0)) DESC, id DESC
      LIMIT 40
    `;
    try {
      const { rows } = await db.query(query);
      const seen = new Set();
      const out = [];
  
      for (const row of rows) {
    const rowUrls = [];
    if (row.image_url && String(row.image_url).trim()) {
      rowUrls.push(String(row.image_url).trim());
    }
    let imgs = row.images;
    if (typeof imgs === "string") {
      try {
        imgs = JSON.parse(imgs);
      } catch {
        imgs = null;
      }
    }
    if (Array.isArray(imgs)) {
      for (const x of imgs) {
        if (x != null && String(x).trim()) rowUrls.push(String(x).trim());
      }
    }
    for (const u of rowUrls) {
      if (!seen.has(u)) {
        seen.add(u);
        out.push(u);
        if (out.length >= cap) return out;
      }
    }
  }
    return out;
  } catch (error) {
    console.error("[productModel.getLatestHeroImageUrls] DB ERROR:", error.message);
    throw error;
  }
};

const getProductById = async (id) => {
    const query = `
      SELECT *
      FROM products
      WHERE id = $1
    `;
  
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("[productModel.getProductById] DB ERROR:", error.message);
      throw error;
    }
  };

const createProduct = async ({ name, description, price, stock, category, image_url, brand, seller_name, original_price, images }) => {
  const query = `
    INSERT INTO products (name, description, price, stock, category, image_url, brand, seller_name, original_price, images)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, name, description, price, stock, category, image_url, brand, seller_name, original_price, images
  `;
  
  const values = [
    name,
    description,
    price,
    stock,
    category,
    image_url,
    brand || null,
    seller_name || null,
    original_price || null,
    images ? JSON.stringify(images) : null,
  ];

  try {
    console.log("[productModel.createProduct] Executing query:", query.trim());
    console.log("[productModel.createProduct] With values:", values);
    
    const { rows } = await db.query(query, values);
    console.log("[productModel.createProduct] Insert successful!");
    return rows[0];
  } catch (error) {
    console.error("[productModel.createProduct] DB Error (Insert failed):", error.message);
    console.error("[productModel.createProduct] Full Error:", error);
    throw error;
  }
};

module.exports = {
  getAllProducts,
  getLatestHeroImageUrls,
  getProductById,
  createProduct,
};
