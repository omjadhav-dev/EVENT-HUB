import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { createMessage } from "../controllers/message.controllers.js";

// One socket.io room per event: "event:<eventId>". Any authenticated
// user can join/post - same access rule as the REST chat routes (see
// message.controllers.js) since the point is letting people who aren't
// attending still weigh in.
function roomFor(eventId) {
  return `event:${eventId}`;
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // Auth handshake middleware - reuses the same accessToken httpOnly
  // cookie the REST API uses, so logging in once covers both.
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Unauthorized"));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.accessToken;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded?._id).select("-password -refreshToken");
      if (!user) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-event", (eventId) => {
      if (!mongoose.Types.ObjectId.isValid(eventId)) return;
      socket.join(roomFor(eventId));
    });

    socket.on("leave-event", (eventId) => {
      socket.leave(roomFor(eventId));
    });

    socket.on("send-message", async ({ eventId, text }, ack) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
          throw new Error("Invalid event id");
        }
        const message = await createMessage({ eventId, userId: socket.user._id, text });

        // Broadcast to everyone in the room (including the sender) so
        // every open tab renders from the same event, in send order.
        io.to(roomFor(eventId)).emit("new-message", message);
        if (typeof ack === "function") ack({ ok: true });
      } catch (err) {
        if (typeof ack === "function") ack({ ok: false, message: err.message });
      }
    });
  });

  return io;
}
