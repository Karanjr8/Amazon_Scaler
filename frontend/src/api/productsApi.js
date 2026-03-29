import client from "./client";

const noCacheConfig = {
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
};

export const fetchProducts = async (params = {}) => {
  const { data } = await client.get("/products", {
    ...noCacheConfig,
    params: { ...params, _cb: Date.now() },
  });
  const list = Array.isArray(data.data) ? data.data : [];

  if (import.meta.env.DEV) {
    console.debug("[API] GET /products parameters", params);
  }
  
  // Step 6: Log explicit list for debugging
  console.log("Fetched Products List:", list);

  return list;
};

export const fetchProductById = async (id) => {
  const { data } = await client.get(`/products/${id}`, {
    ...noCacheConfig,
    params: { _cb: Date.now() },
  });
  const product = data.data;

  if (import.meta.env.DEV && product) {
    console.debug("[API] GET /products/:id", {
      id,
      name: product.name,
      image_url: product.image_url,
      keys: Object.keys(product),
    });
  }

  // Step 6: Log explicit detail for debugging
  console.log("Fetched Product Detail:", product);

  return product;
};

export const createProduct = async (productData) => {
  console.log("[FRONTEND API] >> Dispatching POST /products with data:", JSON.stringify(productData, null, 2));
  try {
    const { data } = await client.post("/products", productData, {
      headers: { "Content-Type": "application/json" }
    });
    console.log("[FRONTEND API] << Server Responded 201 Created:", data);
    return data.data;
  } catch (error) {
    console.error("[FRONTEND API] << Server Error on POST /products:", error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

export const fetchHeroImages = async (limit = 5) => {
  const { data } = await client.get("/products/hero-images", {
    ...noCacheConfig,
    params: { limit, _cb: Date.now() },
  });
  const urls = data?.data?.urls;
  return Array.isArray(urls) ? urls : [];
};

export const fetchProductReviews = async (productId) => {
  try {
    const { data } = await client.get(`/reviews/${productId}`);
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("[API] GET /reviews Error:", error);
    return [];
  }
};

export const submitProductReview = async (productId, rating, comment) => {
  const { data } = await client.post("/reviews", {
    product_id: productId,
    rating,
    comment,
  });
  return data;
};
