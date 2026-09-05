import api from "./axios";

// GET /admin/dashboard - System metrics
export const getAdminDashboard = () => {
  return api.get("/admin/dashboard");
};

// GET /admin/users - Get all users
export const getAllUsers = () => {
  return api.get("/admin/users");
};

// PUT /admin/users/{id}/activate
export const activateUser = (id) => {
  return api.put(`/admin/users/${id}/activate`);
};

// PUT /admin/users/{id}/deactivate
export const deactivateUser = (id) => {
  return api.put(`/admin/users/${id}/deactivate`);
};
