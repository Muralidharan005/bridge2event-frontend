import api from "./axios";
import { apiCache } from "../utils/apiCache";

// GET /organizer/dashboard (cached 2 minutes)
export const getOrganizerDashboard = (options = {}) => {
  const key = "organizer:dashboard";
  return apiCache.fetch(key, () => api.get("/organizer/dashboard"), {
    ttl: 2 * 60 * 1000,
    ...options,
  });
};

// Synchronous helper to read cached organizer dashboard stats
export const getCachedOrganizerDashboard = () => {
  return apiCache.get("organizer:dashboard");
};

// GET /organizer/bookings - Get all attendee bookings for this organizer (cached 2 minutes)
export const getOrganizerBookings = (options = {}) => {
  const key = "organizer:bookings";
  return apiCache.fetch(key, () => api.get("/organizer/bookings"), {
    ttl: 2 * 60 * 1000,
    ...options,
  });
};

// Synchronous helper to read cached organizer bookings
export const getCachedOrganizerBookings = () => {
  return apiCache.get("organizer:bookings");
};

// GET /organizer/bookings/event/{eventId} - Get bookings for a specific event (cached 2 minutes)
export const getOrganizerEventBookings = (eventId, options = {}) => {
  const key = `organizer:bookings:event:${eventId}`;
  return apiCache.fetch(
    key,
    () => api.get(`/organizer/bookings/event/${eventId}`),
    { ttl: 2 * 60 * 1000, ...options }
  );
};

// POST /check-in - Validate QR code -> invalidates organizer and admin metrics
export const checkInTicket = async (qrCode) => {
  const res = await api.post("/check-in", { qrCode });
  apiCache.invalidateOrganizer();
  apiCache.invalidateAdmin();
  return res;
};

// DELETE /organizer/bookings/{id} - Delete / remove an attendee's booked ticket -> invalidates caches
export const deleteOrganizerBooking = async (bookingId) => {
  const res = await api.delete(`/organizer/bookings/${bookingId}`);
  apiCache.invalidateOrganizer();
  apiCache.invalidateEvents();
  apiCache.invalidateAdmin();
  return res;
};

// Clear organizer caches manually
export const clearOrganizerCache = () => {
  apiCache.invalidateOrganizer();
};

