import mongoose from "mongoose";

const conferenceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    acronym: { type: String, trim: true },
    field: { type: String, required: true, trim: true },
    location: { type: String, default: "Online", trim: true },
    website: { type: String, default: "", trim: true },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    submissionDeadline: {
      type: Date,
      default: null,
    },

    acceptanceDate: {
      type: Date,
      default: null,
    },

    cameraReadyDeadline: {
      type: Date,
      default: null,
    },

    description: { type: String, default: "", trim: true },
    organizer: { type: String, default: "", trim: true },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    mode: {
      type: String,
      enum: ["Online", "On-site", "Hybrid"],
      default: "Online",
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

conferenceSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error("Conference end date must be after start date"));
  }

  if (
    this.submissionDeadline &&
    this.startDate &&
    this.submissionDeadline > this.startDate
  ) {
    return next(
      new Error("Submission deadline should be before the conference start date")
    );
  }

  if (
    this.acceptanceDate &&
    this.submissionDeadline &&
    this.acceptanceDate < this.submissionDeadline
  ) {
    return next(
      new Error("Acceptance date should be after submission deadline")
    );
  }

  if (
    this.cameraReadyDeadline &&
    this.acceptanceDate &&
    this.cameraReadyDeadline < this.acceptanceDate
  ) {
    return next(
      new Error("Camera-ready deadline should be after acceptance date")
    );
  }

  if (
    this.cameraReadyDeadline &&
    this.startDate &&
    this.cameraReadyDeadline > this.startDate
  ) {
    return next(
      new Error("Camera-ready deadline should be before conference start date")
    );
  }

  next();
});

const Conference = mongoose.model("Conference", conferenceSchema);

export default Conference;