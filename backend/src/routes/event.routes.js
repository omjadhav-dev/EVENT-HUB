import { Router } from "express";
import { upload } from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.js";
import {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  generateEventDescription,
} from "../controllers/event.controllers.js";

const eventRouter = Router();

// Specific paths before "/:eventId" so they aren't swallowed by the param route
eventRouter.route("/my-events").get(verifyJWT, getMyEvents)
eventRouter.route("/generate-description").post(verifyJWT, generateEventDescription)

eventRouter.route("/").get(getAllEvents)

eventRouter.route("/create").post(verifyJWT, upload.fields([
    {
        name: "coverImage",
        maxCount: 1
    }
]), createEvent)

eventRouter.route("/:eventId")
    .get(getEventById)
    .patch(verifyJWT, upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), updateEvent)
    .delete(verifyJWT, deleteEvent)

export default eventRouter;
