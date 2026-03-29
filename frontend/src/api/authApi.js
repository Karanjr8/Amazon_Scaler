import client from "./client";

export const signupUser = async (payload) => {
  const { data } = await client.post("/auth/signup", payload);
  return data.data;
};

export const loginUser = async (payload) => {
  const { data } = await client.post("/auth/login", payload);
  return data.data;
};

export const logoutUser = async () => {
  const { data } = await client.post("/auth/logout");
  return data;
};
