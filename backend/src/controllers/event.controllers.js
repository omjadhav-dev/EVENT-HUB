import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Event } from "../models/event.models.js";
import { Registration } from "../models/registration.models.js";
import { EventArchive } from "../models/eventArchive.models.js";
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

// Host analytics - attendance trends + revenue across every event the
// logged-in host organizes. Revenue is derived (ticketPrice x confirmed
// registrations) rather than stored anywhere, since there's no payment
// flow yet (see README "Future Enhancements").
//
// Once an event's `end` date passes, deleteExpiredEvents.js removes the
// live Event/Registration documents and writes a stats snapshot to
// EventArchive instead - so this combines both sources rather than
// only reading the (now much smaller) live Event collection. `range`
// controls how far back archived events are pulled from; live events
// are always included since they haven't been archived yet.
const RANGE_TO_DAYS = { "1m": 30, "3m": 90, all: null };

const getHostAnalytics = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const range = RANGE_TO_DAYS.hasOwnProperty(req.query.range)
    ? req.query.range
    : "3m";
  const rangeDays = RANGE_TO_DAYS[range];
  const cutoffDate = rangeDays
    ? new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)
    : null;

  const liveEvents = await Event.find({ organizerId: hostId })
    .select("title start capacity ticketType ticketPrice")
    .sort({ start: -1 });

  const archiveFilter = { organizerId: hostId };
  if (cutoffDate) archiveFilter.end = { $gte: cutoffDate };
  const archivedEvents = await EventArchive.find(archiveFilter).sort({
    start: -1,
  });

  if (liveEvents.length === 0 && archivedEvents.length === 0) {
    return res.status(200).json(
      new apiResponse(200, "Analytics fetched successfully", {
        range,
        overview: {
          totalEvents: 0,
          totalRegistrations: 0,
          totalCheckedIn: 0,
          totalRevenue: 0,
          overallAttendanceRate: 0,
        },
        perEvent: [],
        registrationTrend: [],
      }),
    );
  }

  const liveEventIds = liveEvents.map((event) => event._id);

  // Only confirmed registrations count toward attendance/revenue -
  // cancelled ones never checked in and were never actually paid for.
  const registrations = await Registration.find({
    eventId: { $in: liveEventIds },
    status: "Confirmed",
  }).select("eventId checkedIn createdAt");

  const registrationsByEvent = new Map();
  registrations.forEach((registration) => {
    const key = registration.eventId.toString();
    if (!registrationsByEvent.has(key)) registrationsByEvent.set(key, []);
    registrationsByEvent.get(key).push(registration);
  });

  const livePerEvent = liveEvents.map((event) => {
    const eventRegs = registrationsByEvent.get(event._id.toString()) || [];
    const checkedIn = eventRegs.filter((r) => r.checkedIn).length;
    const revenue =
      event.ticketType === "Paid" ? eventRegs.length * event.ticketPrice : 0;

    return {
      eventId: event._id,
      title: event.title,
      start: event.start,
      capacity: event.capacity,
      registrations: eventRegs.length,
      checkedIn,
      attendanceRate: eventRegs.length
        ? Math.round((checkedIn / eventRegs.length) * 100)
        : 0,
      revenue,
      archived: false,
    };
  });

  // Archived events only ever had aggregate counts saved (the individual
  // Registration documents are gone), so there's no per-registration date
  // to build a daily trend from - attendanceRate is still computable.
  const archivedPerEvent = archivedEvents.map((event) => ({
    eventId: event._id,
    title: event.title,
    start: event.start,
    capacity: event.capacity,
    registrations: event.registrations,
    checkedIn: event.checkedIn,
    attendanceRate: event.registrations
      ? Math.round((event.checkedIn / event.registrations) * 100)
      : 0,
    revenue: event.revenue,
    archived: true,
  }));

  const perEvent = [...livePerEvent, ...archivedPerEvent].sort(
    (a, b) => new Date(b.start) - new Date(a.start),
  );

  const totalRegistrations = perEvent.reduce((sum, e) => sum + e.registrations, 0);
  const totalCheckedIn = perEvent.reduce((sum, e) => sum + e.checkedIn, 0);
  const totalRevenue = perEvent.reduce((sum, e) => sum + e.revenue, 0);

  // Daily registration counts (attendance trend) - only live events have
  // per-registration timestamps to bucket by day. Each archived event
  // contributes one lump point on the day it ended, so its volume still
  // shows up on the trend line even without daily granularity.
  const trendMap = new Map();
  registrations.forEach((registration) => {
    const day = registration.createdAt.toISOString().slice(0, 10);
    trendMap.set(day, (trendMap.get(day) || 0) + 1);
  });
  archivedEvents.forEach((event) => {
    if (event.registrations === 0) return;
    const day = event.end.toISOString().slice(0, 10);
    trendMap.set(day, (trendMap.get(day) || 0) + event.registrations);
  });
  const registrationTrend = Array.from(trendMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  return res.status(200).json(
    new apiResponse(200, "Analytics fetched successfully", {
      range,
      overview: {
        totalEvents: perEvent.length,
        totalRegistrations,
        totalCheckedIn,
        totalRevenue,
        overallAttendanceRate: totalRegistrations
          ? Math.round((totalCheckedIn / totalRegistrations) * 100)
          : 0,
      },
      perEvent,
      registrationTrend,
    }),
  );
});

export {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  generateEventDescription,
  getHostAnalytics,
};
