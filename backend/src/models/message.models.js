import { model, mongoose, Schema } from "mongoose";

// Chat lives per-event and is intentionally open to any logged-in user,
// not just people with a confirmed booking - the point is to let people
// who couldn't attend still weigh in / ask questions (see
// registration.routes.js verifyJWT for the auth boundary).
const messageSchema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

export const Message = model("Message", messageSchema);
