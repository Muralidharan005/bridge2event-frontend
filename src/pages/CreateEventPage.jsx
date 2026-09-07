import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent, createTicketType } from "../api/eventApi";
import { useToast } from "../context/ToastContext";
import "./Organizer.css";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning, extractErrorMessage } = useToast();
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

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

  const [ticketTiers, setTicketTiers] = useState([
    { name: "General Admission", price: 250.0, totalQuantity: 80 },
    { name: "VIP Pass", price: 600.0, totalQuantity: 20 },
  ]);

  const handleTierChange = (index, field, value) => {
    const updated = [...ticketTiers];
    updated[index][field] = value;
    setTicketTiers(updated);
  };

  const handleAddTier = () => {
    setTicketTiers([
      ...ticketTiers,
      { name: "", price: 0.0, totalQuantity: 10 },
    ]);
  };

  const handleRemoveTier = (index) => {
    if (ticketTiers.length === 1) {
      showWarning("At least one ticket tier is required for the event.", "Ticket Tier Required");
      return;
    }
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Date validation
    if (!eventData.eventDate) {
      showWarning("Please select an event date.", "Event Date Required");
      return;
    }
    if (eventData.eventDate < todayStr) {
      showError(
        "Event date cannot be in the past. Please choose today or a future date.",
        "Invalid Event Date"
      );
      return;
    }

    // Validate ticket tiers
    for (let i = 0; i < ticketTiers.length; i++) {
      if (!ticketTiers[i].name.trim()) {
        showWarning(`Please enter a name for Ticket Tier #${i + 1}`, "Missing Tier Name");
        return;
      }
      if (ticketTiers[i].price < 0) {
        showWarning(`Price cannot be negative for Ticket Tier #${i + 1}`, "Invalid Price");
        return;
      }
      if (ticketTiers[i].totalQuantity <= 0) {
        showWarning(`Quantity must be greater than 0 for Ticket Tier #${i + 1}`, "Invalid Quantity");
        return;
      }
    }

    const sumTiers = ticketTiers.reduce(
      (acc, t) => acc + (parseInt(t.totalQuantity) || 0),
      0
    );
    if (sumTiers > parseInt(eventData.totalCapacity)) {
      showWarning(
        `Total tickets across tiers (${sumTiers}) cannot exceed event capacity (${eventData.totalCapacity}).`,
        "Capacity Exceeded"
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Create the event
      const eventRes = await createEvent(eventData);
      const createdEventId = eventRes.data.id;

      // 2. Add all ticket tiers for this event in parallel
      await Promise.all(
        ticketTiers.map((tier) =>
          createTicketType(createdEventId, {
            name: tier.name.trim(),
            price: parseFloat(tier.price),
            totalQuantity: parseInt(tier.totalQuantity),
          })
        )
      );

      showSuccess("Event published successfully!", "Event Created");
      navigate("/organizer/dashboard");
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Failed to create event. Please check inputs."
      );
      showError(msg, "Failed to Create Event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organizer-container">
      <h1 className="organizer-title" style={{ marginBottom: "20px" }}>
        Create a New Event
      </h1>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. AI & Tech Summit 2026"
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
              placeholder="Tell attendees what to expect..."
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
                placeholder="Grand Hall B"
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
                placeholder="New York"
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
              <label className="form-label">Image URL (Optional)</label>
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

          {/* Dynamic Ticket Tiers Section */}
          <div className="section-divider">
            <div>
              <h3>Ticket Pricing & Tiers</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Add different ticket options for attendees (e.g. VIP, General, Early Bird).
              </p>
            </div>
          </div>

          {ticketTiers.map((tier, index) => (
            <div key={index} className="ticket-tier-row">
              <div className="tier-header-bar">
                <span className="tier-title-label">Ticket Tier #{index + 1}</span>
                {ticketTiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(index)}
                    className="btn-remove-tier"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Pass, Early Bird"
                    className="form-input"
                    value={tier.name}
                    onChange={(e) =>
                      handleTierChange(index, "name", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="form-input"
                    value={tier.price}
                    onChange={(e) =>
                      handleTierChange(index, "price", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "10px" }}>
                <label className="form-label">Quantity Available</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={tier.totalQuantity}
                  onChange={(e) =>
                    handleTierChange(index, "totalQuantity", e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddTier}
            className="btn-add-tier"
          >
            + Add Another Ticket Tier
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-auth-submit"
            style={{ marginTop: "8px" }}
          >
            {loading ? "Publishing Event..." : "Publish Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
