import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizerDashboard } from "../api/organizerApi";
import { getMyEvents, deleteEvent } from "../api/eventApi";
import "./Organizer.css";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        getOrganizerDashboard(),
        getMyEvents(),
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error("Failed to load organizer dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  if (loading)
    return (
      <div className="organizer-container">Loading Organizer Dashboard...</div>
    );

  return (
    <div className="organizer-container">
      <div className="organizer-header">
        <h1 className="organizer-title">Organizer Dashboard</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            to="/organizer/bookings"
            className="btn-cancel-booking"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            🎟️ Attendee Bookings
          </Link>
          <Link to="/organizer/create-event" className="nav-btn-action">
            + Create New Event
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{stats.totalEvents}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">
              ₹{stats.totalRevenue?.toFixed(2)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tickets Sold</span>
            <span className="stat-value">{stats.totalTicketsSold}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Check-Ins</span>
            <span className="stat-value">{stats.totalCheckedIn}</span>
          </div>
        </div>
      )}

      {/* Managed Events Table */}
      <h2
        style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "14px" }}
      >
        Your Events
      </h2>

      {events.length === 0 ? (
        <div style={{ padding: "40px 0", color: "var(--text-muted)" }}>
          You haven't published any events yet. Click "+ Create New Event" to
          get started!
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>City</th>
                <th>Date</th>
                <th>Capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.title}</strong>
                  </td>
                  <td>{e.category}</td>
                  <td>{e.city}</td>
                  <td>{e.eventDate}</td>
                  <td>{e.totalCapacity}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        to={`/organizer/bookings?eventId=${e.id}`}
                        className="btn-table-edit"
                        style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
                        title="View attendees who booked tickets for this event"
                      >
                        Bookings
                      </Link>
                      <Link
                        to={`/organizer/edit-event/${e.id}`}
                        className="btn-table-edit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(e.id)}
                        className="btn-table-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
