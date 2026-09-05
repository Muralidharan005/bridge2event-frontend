import api from "./axios";

// GET /organizer/dashboard
export const getOrganizerDashboard = () => {
  return api.get("/organizer/dashboard");
};

// POST /check-in - Validate QR code
export const checkInTicket = (qrCode) => {
  return api.post("/check-in", { qrCode });
};

// GET /organizer/bookings - Get all attendee bookings for this organizer
export const getOrganizerBookings = () => {
  return api.get("/organizer/bookings");
};

// GET /organizer/bookings/event/{eventId} - Get bookings for a specific event
export const getOrganizerEventBookings = (eventId) => {
  return api.get(`/organizer/bookings/event/${eventId}`);
};

// DELETE /organizer/bookings/{id} - Delete / remove an attendee's booked ticket
export const deleteOrganizerBooking = (bookingId) => {
  return api.delete(`/organizer/bookings/${bookingId}`);
};

