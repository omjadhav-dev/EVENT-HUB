import { apiClient } from "./client";

export function getEventMessages(eventId) {
  return apiClient.get(`/messages/${eventId}`);
}

export function postEventMessage(eventId, text) {
  return apiClient.post(`/messages/${eventId}`, { text });
}
