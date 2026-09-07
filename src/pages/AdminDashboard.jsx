import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard, getCachedAdminDashboard } from "../api/adminApi";
import "./Admin.css";

export default function AdminDashboard() {
  const cachedStats = getCachedAdminDashboard();
  const [stats, setStats] = useState(cachedStats || null);
  const [loading, setLoading] = useState(!cachedStats);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!getCachedAdminDashboard()) {
      setLoading(true);
    }

    try {
      const response = await getAdminDashboard();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="admin-container">Loading platform analytics...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <Link to="/admin/users" className="nav-btn-action">
          Manage Users →
        </Link>
      </div>

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Platform Revenue</span>
            <span className="admin-stat-value">
              ₹{stats.totalRevenue?.toFixed(2)}
            </span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Users</span>
            <span className="admin-stat-value">{stats.totalUsers}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Organizers</span>
            <span className="admin-stat-value">{stats.totalOrganizers}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Attendees (Customers)</span>
            <span className="admin-stat-value">{stats.totalNormalUsers}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Published Events</span>
            <span className="admin-stat-value">{stats.totalEvents}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Bookings</span>
            <span className="admin-stat-value">{stats.totalBookings}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Tickets Sold</span>
            <span className="admin-stat-value">{stats.totalTicketsSold}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Check-Ins</span>
            <span className="admin-stat-value">{stats.totalCheckedIn}</span>
          </div>
        </div>
      )}
    </div>
  );
}
