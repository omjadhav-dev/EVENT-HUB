import { io } from "socket.io-client";

// No URL passed - connects to same origin as the page, which the Vite
// dev server proxies to the backend (see vite.config.js, '/socket.io').
// withCredentials sends the accessToken httpOnly cookie along with the
// handshake, same as apiClient's credentials: "include".
export function createChatSocket() {
  return io({
    withCredentials: true,
    autoConnect: true,
  });
}
