import client from "./client";

export const fetchWishlist = async () => {
  const { data } = await client.get("/wishlist");
  return data.data || [];
};

/** @returns {Promise<{ success: boolean, message?: string, data?: { added: boolean } }>} */
export const addToWishlist = async (productId) => {
  const { data } = await client.post("/wishlist", { productId });
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await client.delete(`/wishlist/${productId}`);
  return data;
};

export const checkWishlistContains = async (productId) => {
  const { data } = await client.get(`/wishlist/contains/${productId}`);
  return Boolean(data.data?.inWishlist);
};
