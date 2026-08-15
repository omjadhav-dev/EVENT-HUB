import { apiClient } from "./client";

// name, email, password, userType ("Attendee" | "Host"), state, city
export function registerUser({ name, email, password, userType, state, city }) {
  return apiClient.post("/users/register", { name, email, password, userType, state, city });
}

export function loginUser({ email, password }) {
  return apiClient.post("/users/login", { email, password });
}

export function logoutUser() {
  return apiClient.post("/users/logout");
}

// Used on app load to restore a session from the httpOnly cookie.
export function getCurrentUser() {
  return apiClient.get("/users/me");
}

// userType is intentionally not editable after signup.
export function updateUserProfile({ name }) {
  return apiClient.patch("/users/update-profile", { name });
}
