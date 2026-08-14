import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
    bookEvent,
    cancelBooking,
    checkInAttendee,
    getMyBookings,
    getEventRegistrations,
} from "../controllers/registration.controllers.js";

const registrationRouter = Router();

registrationRouter.route("/book/:eventId").post(verifyJWT, bookEvent);
registrationRouter.route("/cancel/:registrationId").patch(verifyJWT, cancelBooking);
registrationRouter.route("/check-in").post(verifyJWT, checkInAttendee);
registrationRouter.route("/my-bookings").get(verifyJWT, getMyBookings);
registrationRouter.route("/event/:eventId").get(verifyJWT, getEventRegistrations);

export default registrationRouter;