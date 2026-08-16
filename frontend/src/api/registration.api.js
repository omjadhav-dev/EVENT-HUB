import { apiClient } from "./client";

export function bookEvent(eventId) {
  return apiClient.post(`/registrations/book/${eventId}`);
}

export function cancelBooking(registrationId) {
  return apiClient.patch(`/registrations/cancel/${registrationId}`);
}

// qrCode is the registration's qrCode string (used both for an actual QR
// scan and for the organizer's manual "check in" button in My Events,
// which already has the full registration object - qrCode included -
// from getEventRegistrations).
export function checkInAttendee(qrCode) {
  return apiClient.post("/registrations/check-in", { qrCode });
}

export function getMyBookings() {
  return apiClient.get("/registrations/my-bookings");
}

export function getEventRegistrations(eventId) {
  return apiClient.get(`/registrations/event/${eventId}`);
}
