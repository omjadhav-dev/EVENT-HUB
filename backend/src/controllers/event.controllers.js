import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Event } from "../models/event.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
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
    ticketType,
    ticketPrice,
    capacity,
  } = req.body;

  if (
    [
      title,
      description,
      category,
      mode,
      start,
      end,
      venue,
      city,
      ticketType,
    ].some(
      (field) => !field || (typeof field === "string" && field.trim() === ""),
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  if (!tags || (typeof tags === "string" && tags.trim() === "")) {
    throw new apiError(400, "Tags are required");
  }

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
    tags,
    start,
    end,
    venue,
    city,
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
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
    }
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

export {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
};
