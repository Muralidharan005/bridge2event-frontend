import api from "./axios";

// GET /events - All public events
export const getAllEvents = () => {
  return api.get("/events");
};

// GET /events/paginated - Server-side paginated events with backend search, filter & sort
export const getPaginatedEvents = (params = {}) => {
  return api.get("/events/paginated", { params });
};

// GET /events/categories - Distinct categories from backend
export const getEventCategories = () => {
  return api.get("/events/categories");
};

// GET /events/cities - Distinct cities from backend
export const getEventCities = () => {
  return api.get("/events/cities");
};

// GET /events/{id} - Single event details
export const getEventById = (id) => {
  return api.get(`/events/${id}`);
};

// GET /events/my-events - Events created by the logged-in organizer
export const getMyEvents = () => {
  return api.get("/events/my-events");
};

// POST /events - Create event (ORGANIZER only)
export const createEvent = (eventData) => {
  return api.post("/events", eventData);
};

// PUT /events/{id} - Update event (ORGANIZER only)
export const updateEvent = (id, eventData) => {
  return api.put(`/events/${id}`, eventData);
};

// DELETE /events/{id} - Delete event (ORGANIZER only)
export const deleteEvent = (id) => {
  return api.delete(`/events/${id}`);
};

// GET /events/{eventId}/tickets - Get ticket types for an event
export const getEventTickets = (eventId) => {
  return api.get(`/events/${eventId}/tickets`);
};

// POST /events/{eventId}/tickets - Add ticket type to event (ORGANIZER only)
export const createTicketType = (eventId, ticketData) => {
  return api.post(`/events/${eventId}/tickets`, ticketData);
};
