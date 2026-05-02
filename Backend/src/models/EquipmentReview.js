import mongoose from "mongoose";

const equipmentReviewSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent a user from leaving multiple reviews on the same equipment
equipmentReviewSchema.index({ equipment: 1, user: 1 }, { unique: true });

const EquipmentReview = mongoose.model("EquipmentReview", equipmentReviewSchema);

export default EquipmentReview;
