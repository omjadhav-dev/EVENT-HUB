import { model, mongoose, Schema } from "mongoose";

// A small, permanent snapshot of a host's event stats, written right
// before deleteExpiredEvents.js removes the real Event/Registration/
// Message documents. This is the only thing that lets the Analytics
// dashboard keep showing revenue and attendance history for events
// that no longer exist anywhere else in the database.
const eventArchiveSchema = new Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    start: {
      type: Date,
      required: true,
    },

    end: {
      type: Date,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    ticketType: {
      type: String,
      enum: ["Free", "Paid"],
      required: true,
    },

    registrations: {
      type: Number,
      default: 0,
    },

    checkedIn: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const EventArchive = model("EventArchive", eventArchiveSchema);
