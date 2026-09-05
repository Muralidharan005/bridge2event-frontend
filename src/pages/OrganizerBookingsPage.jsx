import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getOrganizerBookings, deleteOrganizerBooking } from "../api/organizerApi";
import { getMyEvents } from "../api/eventApi";
import CustomDropdown from "../components/CustomDropdown";
import {
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  X,
  RotateCcw,
  Ticket,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Tag,
} from "lucide-react";
import "./Organizer.css";

export default function OrganizerBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEventId = searchParams.get("eventId") || "ALL";
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    loadData();
  }, []);

  // Sync status from URL query if provided
  useEffect(() => {
    const s = searchParams.get("status");
    if (s && ["ALL", "CONFIRMED", "CANCELLED"].includes(s.toUpperCase())) {
      setStatusFilter(s.toUpperCase());
    }
    const cat = searchParams.get("category");
    if (cat) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        getOrganizerBookings(),
        getMyEvents(),
      ]);
      setBookings(bookingsRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error("Failed to load organizer bookings", err);
      setMessage({
        text: "Failed to load attendee bookings.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (booking) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete / cancel the ticket booking #${booking.bookingNumber} for ${booking.userName}? This will restore the available ticket capacity.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await deleteOrganizerBooking(booking.id);
      setMessage({
        text: `Successfully deleted ticket booking #${booking.bookingNumber}.`,
        type: "success",
      });
      // Refresh list
      const res = await getOrganizerBookings();
      setBookings(res.data || []);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to delete booking.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics across all organizer bookings
  const totalCount = bookings.length;
  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.status === "CONFIRMED").length,
    [bookings]
  );
  const cancelledCount = useMemo(
    () => bookings.filter((b) => b.status === "CANCELLED").length,
    [bookings]
  );

  // Available unique categories from both hosted events and bookings
  const availableCategories = useMemo(() => {
    const cats = new Set();
    events.forEach((ev) => {
      if (ev.category && ev.category.trim()) cats.add(ev.category.trim());
    });
    bookings.forEach((b) => {
      if (b.eventCategory && b.eventCategory.trim()) cats.add(b.eventCategory.trim());
    });
    return Array.from(cats).sort();
  }, [events, bookings]);

  // Filtered bookings based on Category, Event, Status (CONFIRMED / CANCELLED), and Search Term
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    // 1. Filter by Category
    if (categoryFilter !== "ALL") {
      list = list.filter((b) => {
        const cat =
          b.eventCategory ||
          events.find((e) => String(e.id) === String(b.eventId))?.category ||
          "";
        return cat.toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    // 2. Filter by Event
    if (selectedEventId !== "ALL") {
      list = list.filter((b) => String(b.eventId) === String(selectedEventId));
    }

    // 3. Filter by Status: Confirmed vs Cancelled
    if (statusFilter !== "ALL") {
      list = list.filter((b) => b.status === statusFilter);
    }

    // 4. Filter by Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((b) => {
        const bNum = (b.bookingNumber || "").toLowerCase();
        const uName = (b.userName || "").toLowerCase();
        const evName = (b.eventName || "").toLowerCase();
        const tType = (b.ticketTypeName || "").toLowerCase();
        const cat = (
          b.eventCategory ||
          events.find((e) => String(e.id) === String(b.eventId))?.category ||
          ""
        ).toLowerCase();
        return (
          bNum.includes(term) ||
          uName.includes(term) ||
          evName.includes(term) ||
          tType.includes(term) ||
          cat.includes(term)
        );
      });
    }

    // Sort newest bookings first
    list.sort((a, b) => {
      const timeA = new Date(a.bookingDate || 0).getTime();
      const timeB = new Date(b.bookingDate || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });

    return list;
  }, [bookings, events, categoryFilter, selectedEventId, statusFilter, searchTerm]);

  // Confirmed bookings in filtered results
  const filteredConfirmedBookings = useMemo(() => {
    return filteredBookings.filter((b) => b.status === "CONFIRMED");
  }, [filteredBookings]);

  // Dynamically calculated revenue based on current filters (Category, Event, Search)
  const filteredRevenue = useMemo(() => {
    return filteredConfirmedBookings.reduce(
      (sum, b) => sum + (Number(b.totalAmount) || 0),
      0
    );
  }, [filteredConfirmedBookings]);

  // Confirmed tickets sold
  const filteredTicketsSold = useMemo(() => {
    return filteredConfirmedBookings.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0
    );
  }, [filteredConfirmedBookings]);

  // Cancelled tickets count in current filter
  const filteredCancelledCount = useMemo(() => {
    return filteredBookings.filter((b) => b.status === "CANCELLED").length;
  }, [filteredBookings]);

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    selectedEventId !== "ALL" ||
    searchTerm.trim() !== "";

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSearchTerm("");
    setSearchParams({});
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === "ALL") {
      newParams.delete("category");
    } else {
      newParams.set("category", val);
    }
    setSearchParams(newParams);
  };

  const handleEventChange = (val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val === "ALL") {
      newParams.delete("eventId");
    } else {
      newParams.set("eventId", val);
    }
    setSearchParams(newParams);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === "ALL") {
      newParams.delete("status");
    } else {
      newParams.set("status", val);
    }
    setSearchParams(newParams);
  };

  const selectedEventObj = events.find((e) => String(e.id) === String(selectedEventId));

  // Dynamic revenue card title based on active category / event filters
  const revenueCardTitle = useMemo(() => {
    if (categoryFilter !== "ALL" && selectedEventId !== "ALL") {
      return `Revenue for ${selectedEventObj?.title || "Selected Event"} (${categoryFilter})`;
    }
    if (categoryFilter !== "ALL") {
      return `Revenue for Category: "${categoryFilter}"`;
    }
    if (selectedEventId !== "ALL") {
      return `Revenue for Event: "${selectedEventObj?.title || "Selected Event"}"`;
    }
    return "Total Confirmed Ticket Revenue";
  }, [categoryFilter, selectedEventId, selectedEventObj]);

  const categoryDropdownOptions = useMemo(() => {
    return [
      {
        value: "ALL",
        label: `All Categories (${bookings.length})`,
        icon: <Tag size={15} color="#6366f1" />,
      },
      ...availableCategories.map((cat) => {
        const catConfirmedRev = bookings
          .filter((b) => {
            const bCat =
              b.eventCategory ||
              events.find((e) => String(e.id) === String(b.eventId))?.category ||
              "";
            return (
              bCat.toLowerCase() === cat.toLowerCase() &&
              b.status === "CONFIRMED"
            );
          })
          .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

        return {
          value: cat,
          label: `${cat} (₹${catConfirmedRev.toFixed(0)})`,
          icon: <Tag size={15} color="#8b5cf6" />,
        };
      }),
    ];
  }, [availableCategories, bookings, events]);

  const eventDropdownOptions = useMemo(() => {
    return [
      {
        value: "ALL",
        label: `All Hosted Events (${events.length})`,
        icon: <Calendar size={15} color="#6366f1" />,
      },
      ...events.map((ev) => {
        const evConfirmedRev = bookings
          .filter(
            (b) => String(b.eventId) === String(ev.id) && b.status === "CONFIRMED"
          )
          .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

        return {
          value: String(ev.id),
          label: `${ev.title} (₹${evConfirmedRev.toFixed(0)})`,
          icon: <Calendar size={15} color="#64748b" />,
        };
      }),
    ];
  }, [events, bookings]);

  const statusDropdownOptions = [
    {
      value: "ALL",
      label: `All Statuses (${totalCount})`,
      icon: <Ticket size={15} color="#6366f1" />,
    },
    {
      value: "CONFIRMED",
      label: `Confirmed (${confirmedCount})`,
      icon: <CheckCircle2 size={15} color="#16a34a" />,
    },
    {
      value: "CANCELLED",
      label: `Cancelled (${cancelledCount})`,
      icon: <XCircle size={15} color="#dc2626" />,
    },
  ];

  if (loading) {
    return (
      <div className="organizer-container">
        Loading attendee booked ticket details...
      </div>
    );
  }

  return (
    <div className="organizer-container">
      {/* Header */}
      <div className="organizer-header">
        <div>
          <h1 className="organizer-title">Attendee Booked Tickets</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
            View, filter by category, event or status, and monitor live ticket revenues.
          </p>
        </div>
        <Link
          to="/organizer/dashboard"
          className="btn-cancel-booking"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {message.text && (
        <div
          className={`alert-message ${
            message.type === "success" ? "alert-success" : "alert-error"
          }`}
          style={{ marginBottom: "20px" }}
        >
          {message.text}
        </div>
      )}

      {/* Dynamic Revenue & Metrics Highlight Card */}
      <div className="organizer-revenue-card">
        <div className="revenue-card-left">
          <div className="revenue-card-icon-wrap">
            <TrendingUp size={28} />
          </div>
          <div className="revenue-card-info">
            <span className="revenue-card-title">{revenueCardTitle}</span>
            <div className="revenue-card-amount">
              ₹{filteredRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="revenue-card-subtitle">
              {categoryFilter !== "ALL"
                ? `Calculated dynamically from confirmed bookings in "${categoryFilter}"`
                : selectedEventId !== "ALL"
                ? `Calculated dynamically from confirmed bookings for "${selectedEventObj?.title || "event"}"`
                : "Calculated across all confirmed attendee bookings"}
            </span>
          </div>
        </div>
        <div className="revenue-card-right">
          <div className="revenue-pill">
            <Ticket size={16} />
            <span>{filteredTicketsSold} Tickets Sold</span>
          </div>
          <div className="revenue-pill">
            <CheckCircle2 size={16} />
            <span>{filteredConfirmedBookings.length} Confirmed</span>
          </div>
          {filteredCancelledCount > 0 && (
            <div
              className="revenue-pill"
              style={{ background: "rgba(239, 68, 68, 0.25)", borderColor: "rgba(239, 68, 68, 0.45)" }}
            >
              <XCircle size={16} />
              <span>{filteredCancelledCount} Cancelled</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Filter Panel Nearby Search */}
      <div className="organizer-filter-panel">
        <div className="organizer-search-box">
          <Search size={18} style={{ color: "#94a3b8", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search attendee, booking #, event, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="organizer-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 2 }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="organizer-filter-actions">
          {/* Category Dropdown */}
          {availableCategories.length > 0 && (
            <CustomDropdown
              value={categoryFilter}
              onChange={handleCategoryChange}
              label="Category:"
              icon={Tag}
              options={categoryDropdownOptions}
              dropdownAlign="left"
            />
          )}

          {/* Event Dropdown */}
          {events.length > 0 && (
            <CustomDropdown
              value={selectedEventId}
              onChange={handleEventChange}
              label="Event:"
              icon={Calendar}
              options={eventDropdownOptions}
              dropdownAlign="left"
            />
          )}

          {/* Status Dropdown */}
          <CustomDropdown
            value={statusFilter}
            onChange={handleStatusChange}
            label="Status:"
            icon={ShieldCheck}
            options={statusDropdownOptions}
            dropdownAlign="left"
          />

          {/* Dynamic Revenue Tag in Filter Panel */}
          <span
            className="filter-panel-revenue-tag"
            title="Revenue from confirmed tickets in current filter"
          >
            <TrendingUp size={14} />
            <span>₹{filteredRevenue.toFixed(2)}</span>
          </span>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="active-filter-chips">
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
            Active filters:
          </span>
          {categoryFilter !== "ALL" && (
            <span className="filter-chip chip-category">
              <Tag size={12} style={{ marginRight: 2 }} />
              Category: {categoryFilter}
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => handleCategoryChange("ALL")}
                title="Remove category filter"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {selectedEventId !== "ALL" && (
            <span className="filter-chip">
              <Calendar size={12} style={{ marginRight: 2 }} />
              Event: {selectedEventObj?.title || selectedEventId}
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => handleEventChange("ALL")}
                title="Remove event filter"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {statusFilter !== "ALL" && (
            <span className={`filter-chip ${statusFilter === "CONFIRMED" ? "chip-confirmed" : "chip-cancelled"}`}>
              {statusFilter === "CONFIRMED" ? "✓ Confirmed Tickets" : "✕ Cancelled Tickets"}
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => handleStatusChange("ALL")}
                title="Remove status filter"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {searchTerm.trim() && (
            <span className="filter-chip">
              Search: "{searchTerm}"
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => setSearchTerm("")}
                title="Remove search filter"
              >
                <X size={13} />
              </button>
            </span>
          )}
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> (Revenue: <strong>₹{filteredRevenue.toFixed(2)}</strong>)
          </span>
        </div>
      )}

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
            background: "var(--card-bg)",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={36} color="#94a3b8" />
          <h4 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.1rem" }}>
            No booked tickets found
          </h4>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            {hasActiveFilters
              ? "No tickets match your active status or search filter."
              : "No attendee tickets have been booked yet."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-reset-filters"
              style={{ marginTop: "8px" }}
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Attendee Name</th>
                <th>Event</th>
                <th>Tier</th>
                <th>Qty</th>
                <th>Total (₹)</th>
                <th>Booked Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>#{b.bookingNumber}</strong>
                  </td>
                  <td>{b.userName}</td>
                  <td>
                    <strong>{b.eventName}</strong>
                    {(b.eventCategory || events.find((e) => String(e.id) === String(b.eventId))?.category) && (
                      <div style={{ marginTop: "4px" }}>
                        <span className="booking-category-tag">
                          <Tag size={10} style={{ marginRight: 3 }} />
                          {b.eventCategory || events.find((e) => String(e.id) === String(b.eventId))?.category}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="role-badge" style={{ background: "#f1f5f9", color: "var(--text)" }}>
                      {b.ticketTypeName}
                    </span>
                  </td>
                  <td>{b.quantity}</td>
                  <td>
                    <strong>₹{b.totalAmount?.toFixed(2)}</strong>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {new Date(b.bookingDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`user-status-pill ${
                        b.status === "CONFIRMED"
                          ? "user-active"
                          : "user-inactive"
                      }`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      {b.status === "CONFIRMED" ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>CONFIRMED</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          <span>CANCELLED</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteBooking(b)}
                      disabled={actionLoading}
                      className="btn-table-delete"
                      title={b.status === "CONFIRMED" ? "Cancel & delete this ticket" : "Delete record"}
                    >
                      {b.status === "CONFIRMED" ? "Cancel / Delete" : "Delete Record"}
                    </button>
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
