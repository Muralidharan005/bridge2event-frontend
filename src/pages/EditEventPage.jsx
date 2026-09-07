import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent, getEventTickets, createTicketType } from "../api/eventApi";
import { useToast } from "../context/ToastContext";
import "./Organizer.css";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning, extractErrorMessage } = useToast();

  const todayStr = new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingTickets, setExistingTickets] = useState([]);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "CONFERENCE",
    venue: "",
    city: "",
    eventDate: "",
    startTime: "10:00:00",
    endTime: "18:00:00",
    imageUrl: "",
    totalCapacity: 100,
  });

  const [newTier, setNewTier] = useState({
    name: "",
    price: 0,
    totalQuantity: 10,
  });
  const [addingTier, setAddingTier] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    try {
      const [evRes, tickRes] = await Promise.all([
        getEventById(id),
        getEventTickets(id).catch(() => ({ data: [] })),
      ]);

      const data = evRes.data;
      setEventData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "CONFERENCE",
        venue: data.venue || "",
        city: data.city || "",
        eventDate: data.eventDate || "",
        startTime: data.startTime || "10:00:00",
        endTime: data.endTime || "18:00:00",
        imageUrl: data.imageUrl || "",
        totalCapacity: data.totalCapacity || 100,
      });

      setExistingTickets(tickRes.data || []);
    } catch (err) {
      showError("Failed to load event details for editing.", "Load Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (eventData.eventDate && eventData.eventDate < todayStr) {
      showError(
        "Event date cannot be in the past. Please choose today or a future date.",
        "Invalid Event Date"
      );
      return;
    }

    setSubmitting(true);

    try {
      await updateEvent(id, {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        venue: eventData.venue,
        city: eventData.city,
        eventDate: eventData.eventDate,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        imageUrl: eventData.imageUrl,
        totalCapacity: parseInt(eventData.totalCapacity),
      });

      showSuccess("Event updated successfully!", "Event Updated");
      navigate("/organizer/dashboard");
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Failed to update event. Please check inputs."
      );
      showError(msg, "Update Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNewTier = async (e) => {
    e.preventDefault();
    if (!newTier.name.trim()) {
      showWarning("Please enter a name for the new ticket tier.", "Missing Tier Name");
      return;
    }

    setAddingTier(true);
    try {
      await createTicketType(id, {
        name: newTier.name.trim(),
        price: parseFloat(newTier.price),
        totalQuantity: parseInt(newTier.totalQuantity),
      });

      // Reload tickets
      const tickRes = await getEventTickets(id);
      setExistingTickets(tickRes.data || []);
      setNewTier({ name: "", price: 0, totalQuantity: 10 });
      showSuccess("New ticket tier added successfully!", "Tier Added");
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to add ticket tier");
      showError(msg, "Tier Creation Failed");
    } finally {
      setAddingTier(false);
    }
  };

  if (loading) {
    return (
      <div className="organizer-container">Loading event information...</div>
    );
  }

  return (
    <div className="organizer-container">
      <div className="organizer-header">
        <h1 className="organizer-title">Edit Event</h1>
        <button
          type="button"
          onClick={() => navigate("/organizer/dashboard")}
          className="btn-cancel-booking"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="form-card">

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={eventData.title}
              onChange={(e) =>
                setEventData({ ...eventData, title: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              required
              rows={4}
              className="form-input"
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={eventData.category}
                onChange={(e) =>
                  setEventData({ ...eventData, category: e.target.value })
                }
              >
                <option value="CONFERENCE">Conference</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="CONCERT">Concert</option>
                <option value="SPORTS">Sports</option>
                <option value="COMMUNITY">Community</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Capacity</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={eventData.totalCapacity}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    totalCapacity: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Venue / Hall</label>
              <input
                type="text"
                required
                className="form-input"
                value={eventData.venue}
                onChange={(e) =>
                  setEventData({ ...eventData, venue: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                required
                className="form-input"
                value={eventData.city}
                onChange={(e) =>
                  setEventData({ ...eventData, city: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input
                type="date"
                required
                min={todayStr}
                className="form-input"
                value={eventData.eventDate}
                onChange={(e) =>
                  setEventData({ ...eventData, eventDate: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="form-input"
                value={eventData.imageUrl}
                onChange={(e) =>
                  setEventData({ ...eventData, imageUrl: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                step="1"
                required
                className="form-input"
                value={eventData.startTime}
                onChange={(e) =>
                  setEventData({ ...eventData, startTime: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                step="1"
                required
                className="form-input"
                value={eventData.endTime}
                onChange={(e) =>
                  setEventData({ ...eventData, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-auth-submit"
            style={{ marginTop: "12px" }}
          >
            {submitting ? "Saving Changes..." : "Save Event Changes"}
          </button>
        </form>

        {/* Existing Ticket Tiers Management */}
        <div className="section-divider" style={{ marginTop: "36px" }}>
          <div>
            <h3>Ticket Tiers for this Event</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              View existing tiers and add new ticket options.
            </p>
          </div>
        </div>

        {existingTickets.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {existingTickets.map((t) => (
              <div
                key={t.id}
                style={{
                  background: "#f8fafc",
                  border: "1px solid var(--border-color)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{t.name}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Available: {t.availableQuantity} / {t.totalQuantity}
                  </div>
                </div>
                <div style={{ fontWeight: "700", color: "var(--primary)" }}>
                  ₹{t.price}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Tier Form */}
        <div className="ticket-tier-row">
          <div className="tier-header-bar">
            <span className="tier-title-label">+ Add Another Ticket Tier</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tier Name</label>
              <input
                type="text"
                placeholder="e.g. VIP Pass"
                className="form-input"
                value={newTier.name}
                onChange={(e) =>
                  setNewTier({ ...newTier, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={newTier.price}
                onChange={(e) =>
                  setNewTier({ ...newTier, price: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "10px" }}>
            <label className="form-label">Quantity</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={newTier.totalQuantity}
              onChange={(e) =>
                setNewTier({ ...newTier, totalQuantity: e.target.value })
              }
            />
          </div>

          <button
            type="button"
            onClick={handleAddNewTier}
            disabled={addingTier || !newTier.name.trim()}
            className="btn-auth-submit"
            style={{ marginTop: "12px" }}
          >
            {addingTier ? "Adding Tier..." : "Add Ticket Tier"}
          </button>
        </div>
      </div>
    </div>
  );
}
