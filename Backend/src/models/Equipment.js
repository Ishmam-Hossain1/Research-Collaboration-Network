import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "17:00"
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Microscopy",
        "Spectroscopy",
        "Chromatography",
        "Thermal Analysis",
        "Imaging & Scanning",
        "Computing & Data",
        "Molecular Biology",
        "Chemistry",
        "Physics",
        "Other",
      ],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    condition: {
      type: String,
      enum: ["Excellent", "Good", "Fair"],
      default: "Good",
    },
    location: { type: String, trim: true, default: "" },
    availabilitySchedule: [availabilitySlotSchema],
    isActive: { type: Boolean, default: true },
    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;
