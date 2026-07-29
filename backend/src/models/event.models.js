import {model, mongoose, Schema} from "mongoose";

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ["Conference", "Hackathon", "Meetup", "Seminar", "Workshop"],
        required: true,
    },
    mode: {
        type: String,
        enum: ["Offline", "Online"],
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    tags: {
        type: String,
        required: true,
        lowercase: true,
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    venue: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    ticketType: {
        type: String,
        enum: ["Free", "Paid"],
        required: true,
    },
    ticketPrice: {
        type: Number,
    },
    registrationCount: 
    { 
        type: Number, 
        default: 0 
    }
}, {timestamps: true})

export const Event = model("Event", eventSchema)