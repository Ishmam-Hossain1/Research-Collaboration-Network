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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    projectName: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    ownerNotes: {
      type: String,
      trim: true,
      default: "",
    },
    requesterNotes: {
      type: String,
      trim: true,
      default: "",
    },
    // Usage tracking
    actualStartDate: { type: Date, default: null },
    actualEndDate: { type: Date, default: null },
    usageReport: {
      type: String,
      trim: true,
      default: "",
    },
    // Rating after use
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    reviewComment: {
      type: String,
      trim: true,
      default: "",
    },
    // Cancellation
    cancelledBy: {
      type: String,
      enum: ["requester", "owner", null],
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent overlapping approved bookings for the same equipment
equipmentBookingSchema.index({ equipment: 1, startDate: 1, endDate: 1 });

const EquipmentBooking = mongoose.model(
  "EquipmentBooking",
  equipmentBookingSchema
);
export default EquipmentBooking;
