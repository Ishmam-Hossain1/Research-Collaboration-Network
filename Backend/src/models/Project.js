import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    abstract: {
      type: String,
      required: true,
      trim: true,
    },

    researchField: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    objective: {
      type: String,
      trim: true,
      default: "",
    },

    methodology: {
      type: String,
      trim: true,
      default: "",
    },

    expectedOutcome: {
      type: String,
      trim: true,
      default: "",
    },

    fundingSource: {
      type: String,
      trim: true,
      default: "",
    },

    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    keywords: [
      {
        type: String,
        trim: true,
      },
    ],

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;