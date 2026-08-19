import "dotenv/config";
import http from "http";
import cron from "node-cron";
import app from "./app.js";
import connectDB from "./db/index.js";
import { initSocket } from "./socket/index.js";
import { deleteExpiredEvents } from "./utils/deleteExpiredEvents.js";

const port = process.env.PORT || 5000;

// Socket.io needs to share the same underlying HTTP server as Express
// (rather than app.listen directly) so both REST and websocket traffic
// come in on the same port.
const httpServer = http.createServer(app);
initSocket(httpServer);

connectDB()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Clean up any events that already expired while the server was
    // down, then keep sweeping for newly-expired ones every hour.
    deleteExpiredEvents().catch((err) =>
      console.error("Startup expired-event cleanup failed:", err),
    );

    cron.schedule("0 * * * *", () => {
      deleteExpiredEvents().catch((err) =>
        console.error("Scheduled expired-event cleanup failed:", err),
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });