import mongoose from "mongoose";

const grantApplicationSchema = new mongoose.Schema(
  {
    fundingOpportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundingOpportunity",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },

    abstract: {
      type: String,
      required: true,
      trim: true,
    },

    requestedFunding: {
      type: Number,
      required: true,
      min: 0,
    },

    researchField: {
      type: String,
      required: true,
      trim: true,
    },

    proposalFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    proposalFileName: {
      type: String,
      required: true,
    },

    proposalMimeType: {
      type: String,
      default: "application/octet-stream",
    },

    proposalFileSize: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected"],
      default: "submitted",
    },

    reviewerNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const GrantApplication = mongoose.model(
  "GrantApplication",
  grantApplicationSchema
);

export default GrantApplication;