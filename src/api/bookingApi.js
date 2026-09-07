import api from "./axios";
import { apiCache } from "../utils/apiCache";

// POST /bookings - Create a booking
export const createBooking = async (bookingData) => {
  const res = await api.post("/bookings", bookingData);
  apiCache.invalidateEvents();
  return res;
};

// GET /bookings/my - Get current user's bookings
export const getMyBookings = () => {
  return api.get("/bookings/my");
};

// GET /bookings/{id} - Get booking by ID
export const getBookingById = (id) => {
  return api.get(`/bookings/${id}`);
};

// PUT /bookings/{id}/cancel - Cancel booking
export const cancelBooking = async (id) => {
  const res = await api.put(`/bookings/${id}/cancel`);
  apiCache.invalidateEvents();
  return res;
};
