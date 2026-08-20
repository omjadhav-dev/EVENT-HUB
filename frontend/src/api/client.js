const BASE_URL = "/api/v1";

// Central fetch wrapper for talking to the Express backend.
//
// - credentials: "include" is required on every request because auth is
//   done via httpOnly cookies (accessToken/refreshToken) set by the
//   backend on login - without this, the browser won't send/accept them.
// - JSON bodies are stringified automatically; FormData (used for file
//   uploads like the event cover image) is left as-is so the browser sets
//   the correct multipart boundary itself.
// - On a non-2xx response, throws an Error whose message is the backend's
//   apiResponse/apiError "message" field, so callers can just show
//   err.message to the user.
async function request(path, { method = "GET", body, headers = {} } = {}) {
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: isFormData
      ? headers
      : { "Content-Type": "application/json", ...headers },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body (e.g. network-level failure) - fall through with data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
