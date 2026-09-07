import api from "./axios";
import { apiCache } from "../utils/apiCache";

// POST /bookings - Create a booking
export const createBooking = async (bookingData) => {
  const res = await api.post("/bookings", bookingData);
  apiCache.invalidateEvents();
  apiCache.invalidate("bookings");
  apiCache.invalidateOrganizer();
  apiCache.invalidateAdmin();
  return res;
};

// GET /bookings/my - Get current user's bookings (cached 2 minutes)
export const getMyBookings = (options = {}) => {
  const key = "bookings:my";
  return apiCache.fetch(key, () => api.get("/bookings/my"), {
    ttl: 2 * 60 * 1000,
    ...options,
  });
};

// Synchronous helper to read cached user bookings
export const getCachedMyBookings = () => {
  return apiCache.get("bookings:my");
};

// GET /bookings/{id} - Get booking by ID
export const getBookingById = (id) => {
  return api.get(`/bookings/${id}`);
};

// PUT /bookings/{id}/cancel - Cancel booking
export const cancelBooking = async (id) => {
  const res = await api.put(`/bookings/${id}/cancel`);
  apiCache.invalidateEvents();
  apiCache.invalidate("bookings");
  apiCache.invalidateOrganizer();
  apiCache.invalidateAdmin();
  return res;
};
