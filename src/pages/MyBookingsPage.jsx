import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getMyBookings,
  cancelBooking,
  getCachedMyBookings,
} from "../api/bookingApi";
import { getTicketByBookingId } from "../api/ticketApi";
import {
  Ticket,
  QrCode,
  Calendar,
  Search,
  ArrowRight,
  ShieldCheck,
  X,
  Filter,
  RotateCcw,
  Tag,
} from "lucide-react";
import CustomDropdown from "../components/CustomDropdown";
import api from "../api/axios";
import "./MyBookings.css";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { showError, showSuccess, extractErrorMessage } = useToast();
  const cachedBookings = getCachedMyBookings();
  const [bookings, setBookings] = useState(cachedBookings || []);
  const [loading, setLoading] = useState(!cachedBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [activeTicket, setActiveTicket] = useState(null);
  const [qrBlobUrl, setQrBlobUrl] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    if (!getCachedMyBookings()) {
      setLoading(true);
    }

    try {
      const res = await getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to load user bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      await cancelBooking(bookingId);
      showSuccess("Booking has been successfully cancelled.", "Booking Cancelled");
      loadBookings();
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to cancel booking");
      showError(msg, "Cancellation Failed");
    }
  };

  const handleOpenTicket = async (bookingId) => {
    setModalLoading(true);
    try {
      const ticketRes = await getTicketByBookingId(bookingId);
      setActiveTicket(ticketRes.data);

      const qrRes = await api.get(`/tickets/${ticketRes.data.id}/qr`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(qrRes.data);
      setQrBlobUrl(url);
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to load ticket QR code");
      showError(msg, "QR Code Error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setActiveTicket(null);
    if (qrBlobUrl) {
      URL.revokeObjectURL(qrBlobUrl);
      setQrBlobUrl("");
    }
  };

  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  // Extract distinct categories from user's booked events
  const categories = useMemo(() => {
    const set = new Set(["ALL"]);
    bookings.forEach((b) => {
      const cat = b.eventCategory || b.category;
      if (cat && cat.trim()) set.add(cat.trim());
    });
    return Array.from(set);
  }, [bookings]);

  // Filter and sort bookings: Newest tickets shown at the top of the list
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    // Sort newest bookings first (descending by bookingDate / ID)
    list.sort((a, b) => {
      const timeA = new Date(a.bookingDate || 0).getTime();
      const timeB = new Date(b.bookingDate || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });

    // Filter by status
    if (statusFilter !== "ALL") {
      list = list.filter((b) => b.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== "ALL") {
      list = list.filter((b) => {
        const cat = b.eventCategory || b.category || "";
        return cat.toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((b) => {
        const bNum = (b.bookingNumber || "").toLowerCase();
        const evName = (b.eventName || "").toLowerCase();
        const tType = (b.ticketTypeName || "").toLowerCase();
        const cat = (b.eventCategory || b.category || "").toLowerCase();
        return (
          bNum.includes(term) ||
          evName.includes(term) ||
          tType.includes(term) ||
          cat.includes(term)
        );
      });
    }

    return list;
  }, [bookings, statusFilter, categoryFilter, searchTerm]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
  };

  if (loading) {
    return (
      <div
        className="bookings-container"
        style={{ textAlign: "center", padding: "80px 20px" }}
      >
        <div className="loading-spinner" style={{ margin: "0 auto 16px" }}></div>
        <h3 style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>
          Loading your booked tickets...
        </h3>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      {/* User Profile Header Card */}
      <div className="user-profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
          </div>
          <div className="profile-details">
            <h2>Welcome back, {user?.name || "Attendee"}!</h2>
            <p>{user?.email}</p>
            <span className="profile-badge">Role: {user?.role || "USER"}</span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat-box">
            <span className="profile-stat-number">{confirmedCount}</span>
            <span className="profile-stat-label">Active Passes</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-number">{bookings.length}</span>
            <span className="profile-stat-label">Total Bookings</span>
          </div>
        </div>
      </div>

      {/* Page Title & Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 className="bookings-title" style={{ margin: 0 }}>
            My Booked Tickets & Passes
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Showing newest booked tickets first. View QR badges, verify details, or manage your reservations.
          </p>
        </div>

        <Link
          to="/explore-events"
          className="btn-book-ticket-action"
          style={{ padding: "10px 18px" }}
        >
          <span>Explore More Events</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Modern Filter Controls Bar */}
      {bookings.length > 0 && (
        <div className="bookings-filter-panel">
          <div className="bookings-search-box">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              placeholder="Search by event name, #BK-ID, ticket tier, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bookings-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="bookings-filter-actions">
            {/* Modern Status Dropdown */}
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              label="Status:"
              icon={ShieldCheck}
              dropdownAlign="left"
              options={[
                { value: "ALL", label: `All Statuses (${bookings.length})` },
                { value: "CONFIRMED", label: `Confirmed (${confirmedCount})` },
                {
                  value: "CANCELLED",
                  label: `Cancelled (${cancelledCount})`,
                },
              ]}
            />

            {/* Modern Category Dropdown */}
            {categories.length > 1 && (
              <CustomDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                label="Category:"
                icon={Filter}
                dropdownAlign="left"
                options={categories.map((cat) => ({
                  value: cat,
                  label: cat === "ALL" ? "All Categories" : cat,
                }))}
              />
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-reset-filters"
                title="Clear all filters"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="active-filter-chips" style={{ marginBottom: "20px" }}>
          <span className="chips-title">Active Filters:</span>
          {searchTerm.trim() && (
            <span className="filter-chip">
              Keyword: "{searchTerm}"
              <button onClick={() => setSearchTerm("")}>
                <X size={13} />
              </button>
            </span>
          )}
          {statusFilter !== "ALL" && (
            <span className="filter-chip">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("ALL")}>
                <X size={13} />
              </button>
            </span>
          )}
          {categoryFilter !== "ALL" && (
            <span className="filter-chip">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter("ALL")}>
                <X size={13} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="empty-state-box" style={{ padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎟️</div>
          <h3>No Bookings Found</h3>
          <p>You haven't booked any event tickets yet. Explore upcoming concerts, summits, and workshops!</p>
          <Link
            to="/explore-events"
            className="btn-book-ticket-action"
            style={{ padding: "12px 24px", fontSize: "0.95rem" }}
          >
            Explore Events to Book →
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state-box">
          <h3>No Matching Bookings</h3>
          <p>No tickets matched your filter criteria.</p>
          <button
            onClick={handleResetFilters}
            className="btn-book-ticket-action"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((b) => (
            <div key={b.id} className="booking-card">
              <div className="booking-info">
                <div className="booking-meta">
                  <span className="booking-id-tag">#{b.bookingNumber}</span>
                  {(b.eventCategory || b.category) && (
                    <span className="booking-category-tag">
                      {b.eventCategory || b.category}
                    </span>
                  )}
                  <span
                    className={`booking-status-badge ${
                      b.status === "CONFIRMED"
                        ? "status-confirmed"
                        : "status-cancelled"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <h3 className="booking-event-name">{b.eventName}</h3>

                <p className="booking-details-line">
                  Tier: <strong>{b.ticketTypeName}</strong> | Qty:{" "}
                  <strong>{b.quantity}</strong> | Total:{" "}
                  <strong>₹{b.totalAmount}</strong>
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                  📅 Booked on: {new Date(b.bookingDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="booking-actions">
                {b.status === "CONFIRMED" && (
                  <>
                    <button
                      onClick={() => handleOpenTicket(b.id)}
                      className="btn-view-qr"
                    >
                      <QrCode size={16} style={{ marginRight: 6 }} />
                      <span>View Ticket QR</span>
                    </button>
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="btn-cancel-booking"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket & QR Code Modal */}
      {(activeTicket || modalLoading) && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="ticket-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {modalLoading ? (
              <p>Loading ticket...</p>
            ) : (
              <>
                <h3 className="ticket-header-title">
                  {activeTicket.eventName}
                </h3>
                <p className="ticket-header-sub">
                  Scan this QR at the venue entrance
                </p>

                <div className="qr-image-box">
                  {qrBlobUrl ? (
                    <img src={qrBlobUrl} alt="Ticket QR Code" />
                  ) : (
                    <span>QR Code</span>
                  )}
                </div>

                <div className="ticket-info-summary">
                  <div>
                    <strong>Ticket No:</strong> {activeTicket.ticketNumber}
                  </div>
                  <div>
                    <strong>Type:</strong> {activeTicket.ticketType}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {activeTicket.quantity}
                  </div>
                  <div>
                    <strong>Status:</strong> {activeTicket.status}
                  </div>
                </div>

                <button onClick={handleCloseModal} className="btn-close-modal">
                  Close Ticket
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
