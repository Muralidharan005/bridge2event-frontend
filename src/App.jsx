import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

// Public & Common Pages
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Attendee / USER Pages
import MyBookingsPage from "./pages/MyBookingsPage";
import ExploreEventsPage from "./pages/ExploreEventsPage";

// ORGANIZER Pages
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import OrganizerBookingsPage from "./pages/OrganizerBookingsPage";
import CheckInPage from "./pages/CheckInPage";

// ADMIN Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
        <ScrollToTop />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/explore-events" element={<ExploreEventsPage />} />
              <Route path="/events" element={<ExploreEventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* USER Role Routes (Attendees) */}
              <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
                <Route path="/my-tickets" element={<MyBookingsPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
              </Route>

              {/* ORGANIZER Role Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
                <Route
                  path="/organizer/dashboard"
                  element={<OrganizerDashboard />}
                />
                <Route
                  path="/organizer/bookings"
                  element={<OrganizerBookingsPage />}
                />
                <Route
                  path="/organizer/create-event"
                  element={<CreateEventPage />}
                />
                <Route
                  path="/organizer/edit-event/:id"
                  element={<EditEventPage />}
                />
                <Route path="/organizer/check-in" element={<CheckInPage />} />
              </Route>

              {/* ADMIN Role Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
