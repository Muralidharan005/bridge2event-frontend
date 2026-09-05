import api from "./axios";

// POST /tickets/booking/{bookingId} - Generate ticket for booking
export const generateTicket = (bookingId) => {
  return api.post(`/tickets/booking/${bookingId}`);
};

// GET /tickets/booking/{bookingId} - Get ticket details by booking ID
export const getTicketByBookingId = (bookingId) => {
  return api.get(`/tickets/booking/${bookingId}`);
};

// GET /tickets/{ticketId} - Get ticket details
export const getTicketById = (ticketId) => {
  return api.get(`/tickets/${ticketId}`);
};

// Direct URL helper for QR code image from backend
export const getTicketQrUrl = (ticketId) => {
  return `http://localhost:8080/tickets/${ticketId}/qr`;
};
