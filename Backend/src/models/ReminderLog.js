import mongoose from "mongoose";

const reminderLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["grant_deadline", "milestone_deadline"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    reminderKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const ReminderLog = mongoose.model("ReminderLog", reminderLogSchema);

export default ReminderLog;