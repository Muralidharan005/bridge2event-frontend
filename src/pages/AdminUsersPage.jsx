import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  activateUser,
  deactivateUser,
  getCachedAllUsers,
} from "../api/adminApi";
import { useToast } from "../context/ToastContext";
import "./Admin.css";
import "./Organizer.css";

export default function AdminUsersPage() {
  const cachedUsers = getCachedAllUsers();
  const [users, setUsers] = useState(cachedUsers || []);
  const [loading, setLoading] = useState(!cachedUsers);
  const { showError, showSuccess, extractErrorMessage } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!getCachedAllUsers()) {
      setLoading(true);
    }

    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      showError("Failed to load user records.", "Load Error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.active) {
        await deactivateUser(user.id);
        showSuccess(`User "${user.name}" has been deactivated.`, "User Deactivated");
      } else {
        await activateUser(user.id);
        showSuccess(`User "${user.name}" has been activated.`, "User Activated");
      }
      fetchUsers(); // Refresh the list
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to update user status");
      showError(msg, "Status Update Failed");
    }
  };

  if (loading) return <div className="admin-container">Loading users...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">User Management</h1>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td>
                  <strong>{u.name}</strong>
                </td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <span className="role-badge">{u.role}</span>
                </td>
                <td>
                  <span
                    className={`user-status-pill ${
                      u.active ? "user-active" : "user-inactive"
                    }`}
                  >
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`btn-toggle-status ${
                      u.active ? "btn-deactivate" : "btn-activate"
                    }`}
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
