import api from "./axios";

// POST /bookings - Create a booking
export const createBooking = (bookingData) => {
  return api.post("/bookings", bookingData);
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
export const cancelBooking = (id) => {
  return api.put(`/bookings/${id}/cancel`);
};
