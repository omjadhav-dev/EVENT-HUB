import { apiClient } from "./client";

// params: { search, category, mode, city, page, limit, sortBy, sortType }
export function getAllEvents(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  ).toString();
  return apiClient.get(`/events${query ? `?${query}` : ""}`);
}

export function getEventById(eventId) {
  return apiClient.get(`/events/${eventId}`);
}

export function getMyEvents() {
  return apiClient.get("/events/my-events");
}

// Splits a "ai, web-dev, dsa" input string into ["ai", "web-dev", "dsa"].
// Appending each tag as its own FormData entry (same key repeated) makes
// multer parse req.body.tags as a real array, matching the Event model's
// `tags: [String]` schema - a single comma-joined string would otherwise
// be stored as one giant tag and could never render as separate pills.
function appendEventFormData(formData, eventData) {
  Object.entries(eventData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "tags" && typeof value === "string") {
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => formData.append("tags", tag));
      return;
    }

    formData.append(key, value);
  });
}

// eventData: plain object of event fields; coverImageFile: File | null
export function createEvent(eventData, coverImageFile) {
  const formData = new FormData();
  appendEventFormData(formData, eventData);
  if (coverImageFile) formData.append("coverImage", coverImageFile);

  return apiClient.post("/events/create", formData);
}

export function updateEvent(eventId, eventData, coverImageFile) {
  const formData = new FormData();
  appendEventFormData(formData, eventData);
  if (coverImageFile) formData.append("coverImage", coverImageFile);

  return apiClient.patch(`/events/${eventId}`, formData);
}

export function deleteEvent(eventId) {
  return apiClient.delete(`/events/${eventId}`);
}

export function generateDescription({ topic, category, mode, tags }) {
  return apiClient.post("/events/generate-description", { topic, category, mode, tags });
}

// Attendance trends + revenue across every event the logged-in host organizes.
// range: "1m" | "3m" | "all" (defaults to "3m" on the backend).
export function getHostAnalytics(range) {
  return apiClient.get(`/events/analytics${range ? `?range=${range}` : ""}`);
}
