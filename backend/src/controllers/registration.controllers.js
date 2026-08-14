import mongoose from "mongoose";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Registration } from "../models/registration.models.js";
import { Event } from "../models/event.models.js";

const CANCELLATION_CUTOFF_HOURS = 24;

const bookEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new apiError(400, "Invalid event id");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new apiError(404, "Event not found");
  }

  if (new Date(event.start) <= new Date()) {
    throw new apiError(400, "This event has already started or ended");
  }

  const existingBooking = await Registration.findOne({
    eventId,
    userId: req.user._id,
    status: "Confirmed",
  });
  if (existingBooking) {
    throw new apiError(
      400,
      "You already have a confirmed booking for this event",
    );
  }

  // A user can only ever have one Registration document per event - see
  // the unique({ eventId, userId }) index in registration.models.js. If
  // they previously cancelled, that document still exists (cancelBooking
  // just flips its status rather than deleting it), so re-booking has to
  // reuse and re-confirm it instead of creating a second document, which
  // would violate the unique index.
  const cancelledBooking = await Registration.findOne({
    eventId,
    userId: req.user._id,
    status: "Cancelled",
  });

  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, $expr: { $lt: ["$registrationCount", "$capacity"] } },
    { $inc: { registrationCount: 1 } },
    { returnDocument: "after" },
  );

  if (!updatedEvent) {
    throw new apiError(400, "This event is fully booked");
  }

  let registration;
  try {
    if (cancelledBooking) {
      cancelledBooking.status = "Confirmed";
      cancelledBooking.qrCode = crypto.randomUUID();
      cancelledBooking.checkedIn = false;
      registration = await cancelledBooking.save();
    } else {
      registration = await Registration.create({
        eventId,
        userId: req.user._id,
        qrCode: crypto.randomUUID(),
        status: "Confirmed",
      });
    }
  } catch (error) {
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: -1 } });
    console.error("bookEvent failed to save registration:", error);
    throw new apiError(500, "Something went wrong while booking the event");
  }

  // Populated so the frontend can immediately match this against
  // event.eventId._id (same shape getMyBookings/cancelBooking return) -
  // without this, the QR code wouldn't appear until the next refetch.
  await registration.populate("eventId");

  return res
    .status(200)
    .json(new apiResponse(200, "Event booked successfully", registration));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { registrationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(registrationId)) {
    throw new apiError(400, "Invalid registration id");
  }

  const registration =
    await Registration.findById(registrationId).populate("eventId");
  if (!registration) {
    throw new apiError(404, "Booking not found");
  }

  if (registration.userId.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to cancel this booking");
  }

  if (registration.status === "Cancelled") {
    throw new apiError(400, "This booking is already cancelled");
  }

  const hoursUntilEvent =
    (new Date(registration.eventId.start) - new Date()) / (1000 * 60 * 60);
  if (hoursUntilEvent < CANCELLATION_CUTOFF_HOURS) {
    throw new apiError(
      400,
      `Bookings can't be cancelled within ${CANCELLATION_CUTOFF_HOURS} hours of the event starting`,
    );
  }

  registration.status = "Cancelled";
  await registration.save();

  await Event.findByIdAndUpdate(registration.eventId._id, {
    $inc: { registrationCount: -1 },
  });

  return res
    .status(200)
    .json(new apiResponse(200, "Booking cancelled successfully", registration));
});

const checkInAttendee = asyncHandler(async (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode) {
    throw new apiError(400, "QR code is required");
  }

  const registration = await Registration.findOne({ qrCode }).populate(
    "eventId",
  );
  if (!registration) {
    throw new apiError(404, "Invalid QR code — no matching booking found");
  }

  if (registration.eventId.organizerId.toString() !== req.user._id.toString()) {
    throw new apiError(
      403,
      "You are not authorized to check in attendees for this event",
    );
  }

  if (registration.status === "Cancelled") {
    throw new apiError(400, "This booking was cancelled");
  }

  if (registration.checkedIn) {
    throw new apiError(400, "This attendee has already been checked in");
  }

  registration.checkedIn = true;
  await registration.save();

  return res
    .status(200)
    .json(
      new apiResponse(200, "Attendee checked in successfully", registration),
    );
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Registration.find({ userId: req.user._id })
    .populate("eventId")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new apiResponse(200, "Bookings fetched successfully", bookings));
});

const getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new apiError(400, "Invalid event id");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new apiError(404, "Event not found");
  }

  if (event.organizerId.toString() !== req.user._id.toString()) {
    throw new apiError(
      403,
      "You are not authorized to view registrations for this event",
    );
  }

  const registrations = await Registration.find({ eventId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new apiResponse(200, "Registrations fetched successfully", registrations),
    );
});

export {
  bookEvent,
  cancelBooking,
  checkInAttendee,
  getMyBookings,
  getEventRegistrations,
};
