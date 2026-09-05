import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Ticket,
  LogIn,
  UserPlus,
  Home,
  LayoutDashboard,
  CalendarCheck,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Users,
  Info,
  ChevronDown,
  X,
  Mail,
  Sparkles,
  LogOut,
} from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  // Close profile on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate("/login");
  };

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "events";

  // Check active routes
  const isHomeActive = location.pathname === "/";

  const isMyTicketsActive =
    location.pathname === "/my-tickets" ||
    location.pathname === "/my-bookings";

  const isOrganizerDashboardActive =
    location.pathname === "/organizer/dashboard" ||
    location.pathname.startsWith("/organizer/edit-event");

  const isOrganizerBookingsActive =
    location.pathname === "/organizer/bookings";

  const isOrganizerCreateEventActive =
    location.pathname === "/organizer/create-event";

  const isOrganizerCheckInActive =
    location.pathname === "/organizer/check-in";

  const isAdminDashboardActive =
    location.pathname === "/admin/dashboard";

  const isAdminUsersActive =
    location.pathname === "/admin/users";

  const isLoginActive = location.pathname === "/login";
  const isRegisterActive = location.pathname === "/register";

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo & Website Name */}
        <Link to="/" className="navbar-logo">
          <img
            src="/Bridge2Event.png"
            alt="Bridge2Event"
            className="navbar-logo-img"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              objectFit: "cover",
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="logo-text">Bridge2Event</span>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <Link
            to="/"
            className={`nav-link ${isHomeActive ? "active" : ""}`}
            title="Browse home page"
          >
            <Home size={16} className="nav-item-icon" />
            <span>Home</span>
          </Link>

          <Link
            to="/about"
            className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
            title="About Bridge2Event and Developer"
          >
            <Info size={16} className="nav-item-icon" />
            <span>About Us</span>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Attendee / USER role links */}
              {user?.role === "USER" && (
                <>
                  <Link
                    to="/my-tickets"
                    className={`nav-link ${isMyTicketsActive ? "active" : ""}`}
                    title="View your booked tickets & QR passes"
                  >
                    <Ticket size={16} className="nav-item-icon" />
                    <span>My Tickets</span>
                  </Link>
                </>
              )}

              {/* ORGANIZER role links */}
              {user?.role === "ORGANIZER" && (
                <>
                  <Link
                    to="/organizer/dashboard"
                    className={`nav-link ${isOrganizerDashboardActive ? "active" : ""}`}
                  >
                    <LayoutDashboard size={16} className="nav-item-icon" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/organizer/bookings"
                    className={`nav-link ${isOrganizerBookingsActive ? "active" : ""}`}
                  >
                    <CalendarCheck size={16} className="nav-item-icon" />
                    <span>Bookings</span>
                  </Link>
                  <Link
                    to="/organizer/create-event"
                    className={`nav-btn-action ${isOrganizerCreateEventActive ? "active" : ""}`}
                  >
                    <PlusCircle size={16} />
                    <span>Create Event</span>
                  </Link>
                  <Link
                    to="/organizer/check-in"
                    className={`nav-link ${isOrganizerCheckInActive ? "active" : ""}`}
                  >
                    <QrCode size={16} className="nav-item-icon" />
                    <span>Check-In</span>
                  </Link>
                </>
              )}

              {/* ADMIN role links */}
              {user?.role === "ADMIN" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`nav-link ${isAdminDashboardActive ? "active" : ""}`}
                  >
                    <ShieldCheck size={16} className="nav-item-icon" />
                    <span>Admin Panel</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`nav-link ${isAdminUsersActive ? "active" : ""}`}
                  >
                    <Users size={16} className="nav-item-icon" />
                    <span>Manage Users</span>
                  </Link>
                </>
              )}

              {/* User Profile & Logout */}
              <div className="navbar-user-section" ref={profileMenuRef}>
                <button
                  type="button"
                  className={`user-profile-trigger ${isProfileOpen ? "active" : ""}`}
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  title="Click to view profile details"
                  aria-expanded={isProfileOpen}
                >
                  <span className="user-avatar-circle">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="user-name">{user?.name}</span>
                  <ChevronDown
                    size={14}
                    className={`user-chevron ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <button
                  onClick={handleLogout}
                  className="btn-logout"
                  title="Logout"
                >
                  Logout
                </button>

                {/* Profile Details Dropdown Card */}
                {isProfileOpen && (
                  <div className="profile-dropdown-card" role="dialog" aria-label="Profile Details">
                    <div className="profile-card-header">
                      <div className="profile-card-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="profile-card-user-info">
                        <h4 className="profile-card-name">{user?.name}</h4>
                        <span className="profile-card-role-tag">{user?.role}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-close-profile"
                        onClick={() => setIsProfileOpen(false)}
                        title="Close profile"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="profile-card-body">
                      <div className="profile-detail-row">
                        <span className="detail-label">
                          <Mail size={14} className="detail-icon" /> Email
                        </span>
                        <span className="detail-value">{user?.email || "Not specified"}</span>
                      </div>

                      <div className="profile-detail-row">
                        <span className="detail-label">
                          <ShieldCheck size={14} className="detail-icon" /> Role
                        </span>
                        <span className="detail-value">{user?.role}</span>
                      </div>

                      <div className="profile-detail-row">
                        <span className="detail-label">
                          <Sparkles size={14} className="detail-icon" /> Status
                        </span>
                        <span className="detail-value status-active">
                          <span className="status-dot" /> Active
                        </span>
                      </div>
                    </div>

                    {/* Quick Role-Specific Shortcuts */}
                    <div className="profile-card-links">
                      {user?.role === "USER" && (
                        <Link
                          to="/my-tickets"
                          className="profile-link-item"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Ticket size={15} />
                          <span>My Passes & Bookings</span>
                        </Link>
                      )}
                      {user?.role === "ORGANIZER" && (
                        <>
                          <Link
                            to="/organizer/dashboard"
                            className="profile-link-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <LayoutDashboard size={15} />
                            <span>Organizer Dashboard</span>
                          </Link>
                          <Link
                            to="/organizer/bookings"
                            className="profile-link-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <CalendarCheck size={15} />
                            <span>Booked Tickets</span>
                          </Link>
                          <Link
                            to="/organizer/create-event"
                            className="profile-link-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <PlusCircle size={15} />
                            <span>Create New Event</span>
                          </Link>
                        </>
                      )}
                      {user?.role === "ADMIN" && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="profile-link-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <ShieldCheck size={15} />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/admin/users"
                            className="profile-link-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Users size={15} />
                            <span>Manage Users</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="profile-card-footer">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="btn-profile-logout"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth-buttons">
              <Link
                to="/login"
                className={`btn-login ${isLoginActive ? "active" : ""}`}
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className={`btn-register ${isRegisterActive ? "active" : ""}`}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
