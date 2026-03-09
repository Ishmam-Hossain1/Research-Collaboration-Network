import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    researchInterests: {
      type: [String],
      default: [],
    },

    aboutMe: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    relationshipStatus: {
      type: String,
      default: "",
      trim: true,
    },

    requestedCollaborations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    sentCollaborations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    profilePictureId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;