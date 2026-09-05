import api from "./axios";

// POST /auth/register
export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

// POST /auth/login
export const loginUser = (credentials) => {
  return api.post("/auth/login", credentials);
};
