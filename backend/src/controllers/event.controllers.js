import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Event } from "../models/event.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { generateText } from "../utils/gemini.js";
import mongoose from "mongoose";

// CREATE
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    mode,
    tags,
    start,
    end,
    venue,
    city,
    meetingLink,
    ticketType,
    ticketPrice,
    capacity,
  } = req.body;

  if (
    [title, description, category, mode, start, end, ticketType].some(
      (field) => !field || (typeof field === "string" && field.trim() === ""),
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  if (mode === "Offline" && (!venue?.trim() || !city?.trim())) {
    throw new apiError(400, "Venue and city are required for offline events");
  }

  if (mode === "Online" && !meetingLink?.trim()) {
    throw new apiError(400, "A meeting link is required for online events");
  }

  if (!tags || (typeof tags === "string" && tags.trim() === "")) {
    throw new apiError(400, "Tags are required");
  }

  // Defensive normalization: if tags ever arrives as one comma-joined
  // string (e.g. "ai, web-dev, dsa") rather than a real array, split it -
  // otherwise Mongoose would store the whole string as a single tag.
  const normalizedTags = Array.isArray(tags)
    ? tags
    : tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  if (new Date(end) <= new Date(start)) {
    throw new apiError(400, "End time must be after start time");
  }

  if (
    ticketType === "Paid" &&
    (ticketPrice === undefined || Number(ticketPrice) <= 0)
  ) {
    throw new apiError(400, "Ticket price is required for paid events");
  }

  if (!capacity || Number(capacity) < 1) {
    throw new apiError(400, "Capacity must be at least 1");
  }

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!coverImageLocalPath) {
    throw new apiError(400, "Cover Image is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new apiError(400, "Cover Image is required");
  }

  const event = await Event.create({
    title,
    description,
    category,
    mode,
    image: coverImage.url,
    tags: normalizedTags,
    start,
    end,
    venue: mode === "Offline" ? venue : "",
    city: mode === "Offline" ? city : "",
    meetingLink: mode === "Online" ? meetingLink : "",
    organizerId: req.user._id, // pulled from verifyJWT, not the client
    ticketType,
    ticketPrice: ticketType === "Paid" ? ticketPrice : 0,
    capacity,
  });

  const createdEvent = await Event.findById(event._id).populate(
    "organizerId",
    "name email",
  );
  if (!createdEvent) {
    throw new apiError(500, "Something went wrong while creating the event");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Event created successfully", createdEvent));
});

// READ (list) - supports search + filters + pagination via query params
const getAllEvents = asyncHandler(async (req, res) => {
  const {
    search, // matches title or tags
    category,
    mode,
    city,
    page = 1,
    limit = 12,
    sortBy = "start",
    sortType = "asc",
  } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (mode) filter.mode = mode;
  if (city) filter.city = { $regex: city, $options: "i" };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const events = await Event.find(filter)
    .populate("organizerId", "name email")
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const totalEvents = await Event.countDocuments(filter);

  return res.status(200).json(
    new apiResponse(200, "Events fetched successfully", {
      events,
      totalEvents,
      totalPages: Math.ceil(totalEvents / limitNum),
      currentPage: pageNum,
    }),
  );
});

// READ (single)
const getEventById = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new apiError(400, "Invalid event id");
  }

  const event = await Event.findById(eventId).populate(
    "organizerId",
    "name email",
  );

  if (!event) {
    throw new apiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Event fetched successfully", event));
});

// READ (events created by the logged-in organizer) - powers "My Events"
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizerId: req.user._id }).sort({
    start: 1,
  });

  return res
    .status(200)
    .json(new apiResponse(200, "Your events fetched successfully", events));
});

// UPDATE
const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new apiError(400, "Invalid event id");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new apiError(404, "Event not found");
  }

  if (event.organizerId.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to edit this event");
  }

  const allowedFields = [
    "title",
    "description",
    "category",
    "mode",
    "tags",
    "start",
    "end",
    "venue",
    "city",
    "meetingLink",
    "ticketType",
    "ticketPrice",
    "capacity",
  ];

  if (
    req.body.capacity !== undefined &&
    Number(req.body.capacity) < event.registrationCount
  ) {
    throw new apiError(
      400,
      `Capacity can't be lower than the ${event.registrationCount} spots already booked`,
    );
  }

  allowedFields.forEach((field) => {
    if (req.body[field] === undefined) return;

    if (field === "tags" && typeof req.body.tags === "string") {
      event.tags = req.body.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      return;
    }

    event[field] = req.body[field];
  });

  // optional cover image swap
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (coverImageLocalPath) {
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
      throw new apiError(400, "Error uploading cover image");
    }
    event.image = coverImage.url;
  }

  if (new Date(event.end) <= new Date(event.start)) {
    throw new apiError(400, "End time must be after start time");
  }

  // Whichever field doesn't apply to the (possibly just-changed) mode is
  // cleared out, so an event edited from Offline to Online doesn't keep a
  // stale venue/city hanging around, and vice versa.
  if (event.mode === "Offline") {
    if (!event.venue?.trim() || !event.city?.trim()) {
      throw new apiError(400, "Venue and city are required for offline events");
    }
    event.meetingLink = "";
  } else if (event.mode === "Online") {
    if (!event.meetingLink?.trim()) {
      throw new apiError(400, "A meeting link is required for online events");
    }
    event.venue = "";
    event.city = "";
  }

  await event.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Event updated successfully", event));
});

// DELETE
const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new apiError(400, "Invalid event id");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new apiError(404, "Event not found");
  }

  if (event.organizerId.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this event");
  }

  await Event.findByIdAndDelete(eventId);

  return res
    .status(200)
    .json(new apiResponse(200, "Event deleted successfully", {}));
});

// AI-assisted description generation - takes a rough topic + whatever
// other fields the host has already filled in, and returns a ready-to-use
// event description they can accept as-is or edit further.
const generateEventDescription = asyncHandler(async (req, res) => {
  const { topic, category, mode, tags } = req.body;

  if (!topic || !topic.trim()) {
    throw new apiError(400, "Describe the event topic first");
  }

  const contextLines = [
    `Topic: ${topic.trim()}`,
    category && `Category: ${category}`,
    mode && `Format: ${mode}`,
    tags && `Tags: ${tags}`,
  ].filter(Boolean);

  const description = await generateText({
    system:
      "You write concise, engaging event descriptions for an event-discovery website. " +
      "Write 2-3 short paragraphs (120-180 words total) that would make someone want to " +
      "attend: what the event covers, who it's for, and what attendees will get out of it. " +
      "Plain prose only - no headings, bullet points, emojis, or markdown formatting. " +
      "Do not invent specific dates, prices, or venue details.",
    prompt: `Write an event description for:\n${contextLines.join("\n")}`,
    maxTokens: 400,
  });

  return res
    .status(200)
    .json(new apiResponse(200, "Description generated successfully", { description }));
});

export {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  generateEventDescription,
};
