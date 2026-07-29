import {mongoose, Schema, model} from "mongoose"

const registrationSchema = new Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    qrCode: {
        type: String,
        required: true,
        unique: true,
    },
    checkedIn: { 
        type: Boolean, 
        default: false ,
    },
    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        required: true,
    }
}, {timestamps: true})