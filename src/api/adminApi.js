import api from "./axios";
import { apiCache } from "../utils/apiCache";

// GET /admin/dashboard - System metrics (cached 2 minutes)
export const getAdminDashboard = (options = {}) => {
  const key = "admin:dashboard";
  return apiCache.fetch(key, () => api.get("/admin/dashboard"), {
    ttl: 2 * 60 * 1000,
    ...options,
  });
};

// Synchronous helper to read cached admin stats
export const getCachedAdminDashboard = () => {
  return apiCache.get("admin:dashboard");
};

// GET /admin/users - Get all users (cached 2 minutes)
export const getAllUsers = (options = {}) => {
  const key = "admin:users";
  return apiCache.fetch(key, () => api.get("/admin/users"), {
    ttl: 2 * 60 * 1000,
    ...options,
  });
};

// Synchronous helper to read cached users list
export const getCachedAllUsers = () => {
  return apiCache.get("admin:users");
};

// PUT /admin/users/{id}/activate -> invalidates admin cache
export const activateUser = async (id) => {
  const res = await api.put(`/admin/users/${id}/activate`);
  apiCache.invalidateAdmin();
  return res;
};

// PUT /admin/users/{id}/deactivate -> invalidates admin cache
export const deactivateUser = async (id) => {
  const res = await api.put(`/admin/users/${id}/deactivate`);
  apiCache.invalidateAdmin();
  return res;
};

// Clear admin caches manually
export const clearAdminCache = () => {
  apiCache.invalidateAdmin();
};
