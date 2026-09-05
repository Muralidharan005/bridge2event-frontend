import api from "./axios";

// POST /payments - Make a payment for a booking
export const makePayment = (paymentData) => {
  return api.post("/payments", paymentData);
};

// GET /payments/booking/{bookingId} - Get payment details by booking
export const getPaymentByBooking = (bookingId) => {
  return api.get(`/payments/booking/${bookingId}`);
};
