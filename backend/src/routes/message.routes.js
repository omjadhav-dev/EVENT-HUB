import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { getMessages, postMessage } from "../controllers/message.controllers.js";

const messageRouter = Router();

// Any logged-in user (not just registered attendees) can read/post -
// see message.controllers.js for why.
messageRouter.route("/:eventId").get(verifyJWT, getMessages).post(verifyJWT, postMessage);

export default messageRouter;
