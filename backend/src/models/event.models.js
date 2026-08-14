import { model, mongoose, Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
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

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

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
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    // Only used when mode === "Online" - shown in place of venue/city.
    meetingLink: {
      type: String,
      trim: true,
      default: "",
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
      default: 0,
      min: 0,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    registrationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = model("Event", eventSchema);