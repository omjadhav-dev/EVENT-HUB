import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Event } from "../models/event.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const createEvent = asyncHandler(async (req, res) => {
    const { title, description, category, mode, tags, start, end, venue, city } = req.body;

    if (
        [title, description, category, mode, start, end, venue, city].some(
            (field) => !field || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new apiError(400, "All fields are required");
    }

    if (!tags || (Array.isArray(tags) && tags.length === 0)) {
        throw new apiError(400, "Tags are required");
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
        title, description, category, mode, image: coverImage.url, tags, start, end, venue, city
    });

    const createdEvent = await Event.findById(event._id);
    if (!createdEvent) {
        throw new apiError(500, "Something went wrong while creating the event");
    }

    return res.status(200).json(new apiResponse(200, "Event created successfully", createdEvent));
});

export {createEvent};