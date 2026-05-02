import mongoose from "mongoose";

const googleTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accessToken: String,
    refreshToken: String,
    scope: String,
    tokenType: String,
    expiryDate: Number,
  },
  { timestamps: true }
);

export default mongoose.model("GoogleToken", googleTokenSchema);