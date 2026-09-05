import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getPaginatedEvents,
  getEventCategories,
  getEventCities,
} from "../api/eventApi";
import { sampleEvents } from "../data/sampleEvents";
import {
  Search,
  X,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ArrowRight,
  ArrowUpDown,
  Sparkles,
  Filter,
  RotateCcw,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CustomDropdown from "../components/CustomDropdown";
import "./Home.css";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [sortBy, setSortBy] = useState("date-asc");

  // Dynamic filter options fetched from backend
  const [categories, setCategories] = useState(["ALL"]);
  const [cities, setCities] = useState(["ALL"]);

  // Backend Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 6; // 6 events per page requested from Spring Boot

  // Debounce search query so backend query runs after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load distinct categories and cities from backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, cityRes] = await Promise.allSettled([
          getEventCategories(),
          getEventCities(),
        ]);
        const catSet = new Set(["ALL"]);
        if (catRes.status === "fulfilled" && Array.isArray(catRes.value.data)) {
          catRes.value.data.forEach((c) => c && catSet.add(c.trim()));
        }
        sampleEvents.forEach((e) => e.category && catSet.add(e.category.trim()));
        setCategories(Array.from(catSet));

        const citySet = new Set(["ALL"]);
        if (cityRes.status === "fulfilled" && Array.isArray(cityRes.value.data)) {
          cityRes.value.data.forEach((c) => c && citySet.add(c.trim()));
        }
        sampleEvents.forEach((e) => e.city && citySet.add(e.city.trim()));
        setCities(Array.from(citySet));
      } catch (err) {
        console.warn("Could not fetch categories/cities metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Server-side paginated fetch from backend
  const fetchEvents = useCallback(
    async (pageToLoad = currentPage) => {
      setLoadingEvents(true);
      try {
        let apiSortBy = "eventDate";
        let apiSortDir = "asc";
        if (sortBy === "date-desc") {
          apiSortBy = "eventDate";
          apiSortDir = "desc";
        } else if (sortBy === "title-asc") {
          apiSortBy = "title";
          apiSortDir = "asc";
        } else if (sortBy === "seats-desc") {
          apiSortBy = "availableSeats";
          apiSortDir = "desc";
        }

        const params = {
          page: Math.max(0, pageToLoad - 1), // Spring Boot Pageable is 0-indexed
          size: itemsPerPage,
          sortBy: apiSortBy,
          sortDir: apiSortDir,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (selectedCategory !== "ALL") {
          params.category = selectedCategory;
        }
        if (selectedCity !== "ALL") {
          params.city = selectedCity;
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
        console.warn("Backend API call failed, using sample events fallback:", err);
        // Fallback to sample events if backend is not reachable
        let filtered = [...sampleEvents];
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase().trim();
          filtered = filtered.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.city.toLowerCase().includes(q) ||
              e.category.toLowerCase().includes(q)
          );
        }
        if (selectedCategory !== "ALL") {
          filtered = filtered.filter(
            (e) => e.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        if (selectedCity !== "ALL") {
          filtered = filtered.filter(
            (e) => e.city.toLowerCase() === selectedCity.toLowerCase()
          );
        }
        const total = filtered.length;
        const totalP = Math.max(1, Math.ceil(total / itemsPerPage));
        const s = (pageToLoad - 1) * itemsPerPage;
        setEvents(filtered.slice(s, s + itemsPerPage));
        setTotalPages(totalP);
        setTotalElements(total);
      } finally {
        setLoadingEvents(false);
      }
    },
    [debouncedSearch, selectedCategory, selectedCity, sortBy, currentPage, itemsPerPage]
  );

  // Trigger backend fetch on page change or filter update
  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, debouncedSearch, selectedCategory, selectedCity, sortBy, fetchEvents]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedCity !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedCity("ALL");
    setSortBy("date-asc");
    setCurrentPage(1);
  };

  return (
    <div className="home-page-root">
      {/* Modern Hero Section with Search & Logo */}
      <section className="home-hero">
        <div className="home-hero-content">
          {/* Brand Logo & Tag */}
          <div className="home-hero-brand">
            <img
              src="/Bridge2Event.png"
              alt="Bridge2Event"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="hero-brand-title">Bridge2Event</span>
          </div>

          <div className="home-hero-badge">
            <Sparkles size={15} /> Discover & Book Live Events
          </div>

          <h1 className="home-hero-headline">
            Explore Exciting Events & <br />
            <span>Reserve Your Passes Instantly</span>
          </h1>

          <p className="home-hero-subtitle">
            Your gateway to top conferences, tech meetups, music concerts, and workshops.
            Search all events, book digital tickets with encrypted QR codes, and gain instant venue entry.
          </p>

          {/* Main Search Bar Card */}
          <div className="hero-search-card">
            <div className="search-bar-inner">
              <div className="search-input-group">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search events by title, keyword, city, or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn-clear-search"
                    title="Clear search query"
                    aria-label="Clear search query"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {cities.length > 1 && (
                <CustomDropdown
                  value={selectedCity}
                  onChange={setSelectedCity}
                  icon={MapPin}
                  className="hero-city-dropdown"
                  options={cities.map((c) => ({
                    value: c,
                    label: c === "ALL" ? "All Cities" : c,
                  }))}
                />
              )}

              <a href="#events" className="btn-search-trigger">
                <span>Find Events</span>
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="hero-category-pills">
              <span className="pills-label">
                <Filter size={14} /> Categories:
              </span>
              <div className="pills-list">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-pill ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "active"
                        : ""
                    }`}
                  >
                    {cat === "ALL" ? "All Events" : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Events Showcase Section */}
      <section className="home-catalog-section" id="events">
        <div className="catalog-container">
          {/* Section Controls Bar */}
          <div className="catalog-header-bar">
            <div>
              <span className="catalog-badge">Event Directory</span>
              <h2 className="catalog-title">All Available Events</h2>
              <p className="catalog-subtitle">
                Browse, search, and book your tickets for upcoming experiences.
              </p>
            </div>

            {/* Filter Status & Sort Selector */}
            <div className="catalog-controls">
              <div className="events-count-pill">
                <strong>{totalElements}</strong>{" "}
                {totalElements === 1 ? "Event Found" : "Events Found"}
              </div>

              {/* Modern Category Dropdown */}
              <CustomDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
                label="Category:"
                icon={Filter}
                dropdownAlign="left"
                options={categories.map((cat) => ({
                  value: cat,
                  label: cat === "ALL" ? "All Categories" : cat,
                }))}
              />

              {/* Modern Sort by Dropdown */}
              <CustomDropdown
                value={sortBy}
                onChange={setSortBy}
                label="Sort by:"
                icon={ArrowUpDown}
                dropdownAlign="right"
                options={[
                  { value: "date-asc", label: "Date: Soonest First" },
                  { value: "date-desc", label: "Date: Latest First" },
                  { value: "title-asc", label: "Title: A to Z" },
                  { value: "seats-desc", label: "Available Seats" },
                ]}
              />

              {hasActiveFilters && (
                <button
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

          {/* Active Filter Tags Indicator */}
          {hasActiveFilters && (
            <div className="active-filter-chips">
              <span className="chips-title">Active Filters:</span>
              {searchQuery.trim() && (
                <span className="filter-chip">
                  Keyword: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X size={13} />
                  </button>
                </span>
              )}
              {selectedCategory !== "ALL" && (
                <span className="filter-chip">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("ALL")}>
                    <X size={13} />
                  </button>
                </span>
              )}
              {selectedCity !== "ALL" && (
                <span className="filter-chip">
                  City: {selectedCity}
                  <button onClick={() => setSelectedCity("ALL")}>
                    <X size={13} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Events Grid / Loading / Empty States */}
          {loadingEvents ? (
            <div className="events-loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="event-skeleton-card">
                  <div className="skeleton-thumb shimmer" />
                  <div className="skeleton-content">
                    <div className="skeleton-line short shimmer" />
                    <div className="skeleton-line medium shimmer" />
                    <div className="skeleton-line long shimmer" />
                    <div className="skeleton-line button shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="events-empty-card">
              <div className="empty-icon-wrapper">
                <Search size={36} />
              </div>
              <h3>No Events Found</h3>
              <p>
                {hasActiveFilters
                  ? "We couldn't find any events matching your search or filter settings."
                  : "There are currently no events published on Bridge2Event. Check back soon!"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="btn-empty-reset"
                >
                  <RotateCcw size={16} />
                  <span>Clear All Search Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="events-grid">
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
                const isFillingFast = remainingSeats > 0 && remainingSeats < 15;

                return (
                  <article key={ev.id} className="event-card">
                    {/* Card Thumbnail */}
                    <div className="event-thumbnail">
                      {ev.imageUrl ? (
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          loading="lazy"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="event-thumb-fallback"
                        style={{ display: ev.imageUrl ? "none" : "flex" }}
                      >
                        <Ticket size={40} className="fallback-ticket-icon" />
                      </div>

                      {ev.category && (
                        <span className="event-category-badge">
                          {ev.category}
                        </span>
                      )}

                      {/* Status Overlay Badge */}
                      {isSoldOut ? (
                        <span className="event-seat-tag sold-out">
                          Sold Out
                        </span>
                      ) : isFillingFast ? (
                        <span className="event-seat-tag filling-fast">
                          🔥 Selling Fast
                        </span>
                      ) : null}
                    </div>

                    {/* Card Body */}
                    <div className="event-card-body">
                      <h3 className="event-card-title" title={ev.title}>
                        {ev.title}
                      </h3>

                      {ev.description && (
                        <p className="event-card-description">
                          {ev.description}
                        </p>
                      )}

                      {/* Event Key Metadata */}
                      <div className="event-meta-list">
                        <div className="event-meta-item">
                          <Calendar size={16} className="meta-icon" />
                          <span>
                            {ev.eventDate}
                            {ev.startTime ? ` • ${ev.startTime}` : ""}
                          </span>
                        </div>

                        <div className="event-meta-item">
                          <MapPin size={16} className="meta-icon" />
                          <span>
                            {ev.venue ? `${ev.venue}, ` : ""}
                            <strong>{ev.city || "Venue TBA"}</strong>
                          </span>
                        </div>

                        {ev.organizerName && (
                          <div className="event-meta-item organizer-item">
                            <Users size={16} className="meta-icon" />
                            <span>
                              Host: <em>{ev.organizerName}</em>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="event-card-footer">
                        <div className="seat-indicator">
                          <span
                            className={`seat-dot ${
                              isSoldOut
                                ? "dot-red"
                                : isFillingFast
                                ? "dot-amber"
                                : "dot-green"
                            }`}
                          />
                          <span className="seat-text">
                            {isSoldOut
                              ? "Sold Out (0 seats left)"
                              : `${remainingSeats} seats left`}
                          </span>
                        </div>

                        <Link
                          to={`/events/${ev.id}`}
                          className={`btn-card-action ${
                            isSoldOut ? "sold-out" : ""
                          }`}
                        >
                          <span>{isSoldOut ? "View Info" : "Book Tickets"}</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Server-Side Pagination Controls from Backend */}
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
                  disabled={currentPage === 1 || loadingEvents}
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
                      disabled={loadingEvents}
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
                  disabled={currentPage === totalPages || loadingEvents}
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
      </section>
    </div>
  );
}
