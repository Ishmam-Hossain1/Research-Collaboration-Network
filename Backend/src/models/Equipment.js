import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0=Sunday, 6=Saturday
    required: true,
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "17:00"
});

const equipmentSchema = new mongoose.Schema(
  {
    name: {
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
      required: true,
      trim: true,
      enum: [
        "Microscopy",
        "Spectroscopy",
        "Chromatography",
        "Computing",
        "Imaging",
        "Electronics",
        "Biology",
        "Chemistry",
        "Physics",
        "Other",
      ],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    specifications: {
      type: String,
      trim: true,
      default: "",
    },
    usageInstructions: {
      type: String,
      trim: true,
      default: "",
    },
    rentalPricePerDay: {
      type: Number,
      default: 1,
      min: 0,
      max: 5,
    },
    pricePerDay: {
      type: Number,
      default: 1,
      min: 0,
      max: 5,
    }, // Alias for compatibility
    isFree: {
      type: Boolean,
      default: true,
    },
    availabilitySchedule: [availabilitySlotSchema],
    // Blocked-out specific date ranges (maintenance, personal use, etc.)
    blockedDates: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        reason: { type: String, default: "Unavailable" },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available",
    },
    images: [{ type: String }], // URLs or file paths
    tags: [{ type: String, trim: true }],
    maxBookingDays: {
      type: Number,
      default: 7,
      min: 1,
    },
    requiresTraining: {
      type: Boolean,
      default: false,
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;
