import client from "./client";

export const fetchOrderHistory = async () => {
  const { data } = await client.get("/orders/history");
  return data.data || [];
};

export const createOrder = async (orderData) => {
  const { data } = await client.post("/orders", orderData);
  return data.data;
};
