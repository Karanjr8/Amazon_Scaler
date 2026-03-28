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
    console.debug("[API] GET /products", {
      params,
      count: list.length,
      sample: list[0] ?? null,
      imageUrlsSample: list.slice(0, 5).map((p) => ({ id: p?.id, image_url: p?.image_url })),
    });
  }

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

  return product;
};

export const createProduct = async (productData) => {
  const { data } = await client.post("/products", productData);
  return data.data;
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
    return data.data || [];
  } catch (error) {
    // If backend doesn't support it, just swallow and return empty array
    return [];
  }
};
