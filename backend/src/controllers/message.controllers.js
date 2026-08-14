import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Message } from "../models/message.models.js";
import { Event } from "../models/event.models.js";

// GET - anyone logged in can read an event's chat, whether or not they
// booked a ticket, so people who couldn't attend can still follow / weigh
// in on the discussion.
const getMessages = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new apiError(400, "Invalid event id");
  }

  const eventExists = await Event.exists({ _id: eventId });
  if (!eventExists) {
    throw new apiError(404, "Event not found");
  }

  const messages = await Message.find({ eventId })
    .populate("userId", "name")
    .sort({ createdAt: 1 })
    .limit(200);

  return res
    .status(200)
    .json(new apiResponse(200, "Messages fetched successfully", messages));
});

// Shared by the REST POST route and the socket "send-message" handler so
// there's exactly one place that persists a chat message.
export const createMessage = async ({ eventId, userId, text }) => {
  if (!text || !text.trim()) {
    throw new apiError(400, "Message can't be empty");
  }

  const eventExists = await Event.exists({ _id: eventId });
  if (!eventExists) {
    throw new apiError(404, "Event not found");
  }

  const message = await Message.create({
    eventId,
    userId,
    text: text.trim().slice(0, 500),
  });

  return message.populate("userId", "name");
};

// POST - same access rule as above: any authenticated user can post.
const postMessage = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new apiError(400, "Invalid event id");
  }

  const populatedMessage = await createMessage({ eventId, userId: req.user._id, text });

  return res
    .status(200)
    .json(new apiResponse(200, "Message sent successfully", populatedMessage));
});

export { getMessages, postMessage };
