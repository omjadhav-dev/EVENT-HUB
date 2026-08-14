// require('dotenv).config({path: "./.env"})
import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./db/index.js";
import { initSocket } from "./socket/index.js";

dotenv.config({
  path: "./.env",
});

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
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });