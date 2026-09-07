import api from "./axios";
import { apiCache } from "../utils/apiCache";

// GET /events - All public events (cached 3 minutes)
export const getAllEvents = (options = {}) => {
  const key = "events:all";
  return apiCache.fetch(key, () => api.get("/events"), {
    ttl: 3 * 60 * 1000,
    ...options,
  });
};

// GET /events/paginated - Server-side paginated events with backend search, filter & sort (cached 3 minutes)
export const getPaginatedEvents = (params = {}, options = {}) => {
  const key = apiCache.makeKey("events:paginated", params);
  return apiCache.fetch(
    key,
    async () => {
      const res = await api.get("/events/paginated", { params });
      // Pre-warm individual event caches so opening event details is instant!
      if (res.data?.content && Array.isArray(res.data.content)) {
        res.data.content.forEach((ev) => {
          if (ev.id) {
            apiCache.set(`events:id:${ev.id}`, ev, 3 * 60 * 1000);
          }
        });
      }
      return res;
    },
    { ttl: 3 * 60 * 1000, ...options }
  );
};

// Synchronous helper to read cached paginated events (0ms loading)
export const getCachedPaginatedEvents = (params = {}) => {
  const key = apiCache.makeKey("events:paginated", params);
  return apiCache.get(key);
};

// GET /events/categories - Distinct categories from backend (cached 10 minutes)
export const getEventCategories = (options = {}) => {
  const key = "events:categories";
  return apiCache.fetch(key, () => api.get("/events/categories"), {
    ttl: 10 * 60 * 1000,
    ...options,
  });
};

// GET /events/cities - Distinct cities from backend (cached 10 minutes)
export const getEventCities = (options = {}) => {
  const key = "events:cities";
  return apiCache.fetch(key, () => api.get("/events/cities"), {
    ttl: 10 * 60 * 1000,
    ...options,
  });
};

// GET /events/{id} - Single event details (cached 3 minutes)
export const getEventById = (id, options = {}) => {
  const key = `events:id:${id}`;
  return apiCache.fetch(key, () => api.get(`/events/${id}`), {
    ttl: 3 * 60 * 1000,
    ...options,
  });
};

// Synchronous helper to check if event details are already cached in memory
export const getCachedEvent = (id) => {
  return apiCache.get(`events:id:${id}`);
};

// GET /events/{eventId}/tickets - Get ticket types for an event (cached 2 minutes)
export const getEventTickets = (eventId, options = {}) => {
  const key = `events:tickets:${eventId}`;
  return apiCache.fetch(key, () => api.get(`/events/${eventId}/tickets`), {
    ttl: 2 * 60 * 1000,
    ...options,
  });
};

// Synchronous helper to read cached ticket types for an event
export const getCachedEventTickets = (eventId) => {
  return apiCache.get(`events:tickets:${eventId}`);
};

// GET /events/my-events - Events created by the logged-in organizer (cached 1 minute)
export const getMyEvents = (options = {}) => {
  const key = "events:my-events";
  return apiCache.fetch(key, () => api.get("/events/my-events"), {
    ttl: 60 * 1000,
    ...options,
  });
};

// POST /events - Create event (ORGANIZER only) -> invalidates cache
export const createEvent = async (eventData) => {
  const res = await api.post("/events", eventData);
  apiCache.invalidateEvents();
  return res;
};

// PUT /events/{id} - Update event (ORGANIZER only) -> invalidates cache
export const updateEvent = async (id, eventData) => {
  const res = await api.put(`/events/${id}`, eventData);
  apiCache.invalidateEvents();
  return res;
};

// DELETE /events/{id} - Delete event (ORGANIZER only) -> invalidates cache
export const deleteEvent = async (id) => {
  const res = await api.delete(`/events/${id}`);
  apiCache.invalidateEvents();
  return res;
};

// POST /events/{eventId}/tickets - Add ticket type -> invalidates tickets and event
export const createTicketType = async (eventId, ticketData) => {
  const res = await api.post(`/events/${eventId}/tickets`, ticketData);
  apiCache.invalidate(`events:tickets:${eventId}`);
  apiCache.invalidate(`events:id:${eventId}`);
  return res;
};

// Manually clear all cached events
export const clearEventsCache = () => {
  apiCache.invalidateEvents();
};
