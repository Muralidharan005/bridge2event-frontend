import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPaginatedEvents, getEventCategories } from "../api/eventApi";
import {
  Search,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./MyBookings.css";

export default function ExploreEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState(["ALL"]);

  // Backend Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 6;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load distinct categories from backend
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getEventCategories();
        if (res.data && Array.isArray(res.data)) {
          const unique = new Set(["ALL", ...res.data.filter(Boolean)]);
          setCategories(Array.from(unique));
        }
      } catch (err) {
        console.warn("Failed to load categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch page from backend
  const loadEvents = useCallback(
    async (pageToLoad = currentPage) => {
      setLoading(true);
      try {
        const params = {
          page: Math.max(0, pageToLoad - 1),
          size: itemsPerPage,
          sortBy: "eventDate",
          sortDir: "asc",
        };
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (selectedCategory !== "ALL") {
          params.category = selectedCategory;
        }

        const res = await getPaginatedEvents(params);
        if (res.data && res.data.content) {
          setEvents(res.data.content);
          setTotalPages(res.data.totalPages || 1);
          setTotalElements(res.data.totalElements || 0);
        } else if (Array.isArray(res.data)) {
          setEvents(res.data);
          setTotalPages(Math.ceil(res.data.length / itemsPerPage) || 1);
          setTotalElements(res.data.length);
        } else {
          setEvents([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } catch (err) {
        console.error("Failed to load paginated events from backend:", err);
        setEvents([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, selectedCategory, currentPage, itemsPerPage]
  );

  // Trigger load on filter or page change
  useEffect(() => {
    loadEvents(currentPage);
  }, [currentPage, debouncedSearch, selectedCategory, loadEvents]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div
        className="bookings-container"
        style={{ textAlign: "center", padding: "80px 20px" }}
      >
        <div className="loading-spinner" style={{ margin: "0 auto 16px" }}></div>
        <h3 style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>
          Discovering upcoming events...
        </h3>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      {/* Page Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          borderRadius: "16px",
          padding: "36px 32px",
          color: "white",
          marginBottom: "28px",
          boxShadow: "0 10px 25px rgba(49, 46, 129, 0.15)",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
          <Sparkles size={14} />
          <span>Live Catalog</span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 8px 0" }}>
          Explore Upcoming Events
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#c7d2fe", margin: 0, maxWidth: "600px", lineHeight: 1.5 }}>
          Browse workshops, music shows, conferences, and exhibitions. Reserve your tickets instantly with verified digital QR access.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="events-filter-bar">
        <input
          type="text"
          placeholder="🔍 Search events by title, city, or venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        {categories.length > 1 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Events Results Count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
          Showing <strong>{totalElements}</strong> {totalElements === 1 ? "event" : "events"}
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
        {(searchTerm || selectedCategory !== "ALL") && (
          <button
            onClick={handleResetFilters}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="empty-state-box">
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🎪</div>
          <h3>No Events Found</h3>
          <p>
            {totalElements === 0 && !searchTerm && selectedCategory === "ALL"
              ? "There are currently no events published yet. Please check back later!"
              : "No events matched your search query. Try adjusting your keywords or category."}
          </p>
          {(searchTerm || selectedCategory !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="btn-book-ticket-action"
            >
              Show All Events
            </button>
          )}
        </div>
      ) : (
        <div className="events-catalog-grid">
          {events.map((ev) => {
            const isDemo = String(ev.id).startsWith("demo-");
            if (!isDemo) {
              localStorage.removeItem(`booked_seats_${ev.id}`);
            }
            const localDeduction = isDemo
              ? parseInt(localStorage.getItem(`booked_seats_${ev.id}`) || "0", 10)
              : 0;
            const rawAvailable =
              ev.availableSeats !== undefined
                ? ev.availableSeats
                : ev.totalCapacity;
            const remainingSeats = Math.max(0, rawAvailable - localDeduction);
            const isSoldOut = remainingSeats === 0;

            return (
              <div key={ev.id} className="catalog-event-card">
                <div className="event-card-thumbnail">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} loading="lazy" />
                  ) : (
                    <span className="event-placeholder-icon">🎪</span>
                  )}
                  {ev.category && (
                    <span className="event-card-category-badge">
                      {ev.category}
                    </span>
                  )}
                </div>

                <div className="event-card-content">
                  <h3 className="event-card-title">{ev.title}</h3>

                  <div className="event-card-meta-list">
                    <div className="event-card-meta-item">
                      <span>📅</span>
                      <span>
                        {ev.eventDate} {ev.startTime && `(${ev.startTime})`}
                      </span>
                    </div>
                    <div className="event-card-meta-item">
                      <span>📍</span>
                      <span>
                        {ev.venue ? `${ev.venue}, ` : ""}
                        {ev.city}
                      </span>
                    </div>
                  </div>

                  <div className="event-card-footer">
                    <span
                      className={`event-seats-tag ${
                        isSoldOut ? "sold-out" : remainingSeats < 10 ? "low-seats" : ""
                      }`}
                      style={{
                        color: isSoldOut ? "#ef4444" : remainingSeats < 10 ? "#d97706" : "#059669",
                        fontWeight: 700,
                      }}
                    >
                      {isSoldOut ? "Sold Out" : `${remainingSeats} seats left`}
                    </span>

                    <Link
                      to={`/events/${ev.id}`}
                      className="btn-book-ticket-action"
                      style={isSoldOut ? { opacity: 0.65 } : {}}
                    >
                      {isSoldOut ? "View Details" : "Book Tickets →"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="catalog-pagination">
          <div className="pagination-info">
            Showing{" "}
            <strong>
              {totalElements > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </strong>{" "}
            –{" "}
            <strong>
              {Math.min(currentPage * itemsPerPage, totalElements)}
            </strong>{" "}
            of <strong>{totalElements}</strong> events
          </div>

          <div className="pagination-buttons">
            <button
              type="button"
              className="btn-pagination-nav"
              disabled={currentPage === 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn-page-number ${
                    currentPage === pageNum ? "active" : ""
                  }`}
                  disabled={loading}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-pagination-nav"
              disabled={currentPage === totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
