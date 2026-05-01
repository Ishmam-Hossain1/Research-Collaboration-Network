import mongoose from "mongoose";

const equipmentBookingSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: { type: String, required: true },   // e.g. "2026-05-15"
    endDate: { type: String, required: true },     // e.g. "2026-05-17"
    totalDays: { type: Number, required: true, min: 1 },
    totalCost: { type: Number, required: true },   // in tk
    purpose: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    ownerNote: { type: String, trim: true, default: "" },
    usageNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const EquipmentBooking = mongoose.model("EquipmentBooking", equipmentBookingSchema);
export default EquipmentBooking;
