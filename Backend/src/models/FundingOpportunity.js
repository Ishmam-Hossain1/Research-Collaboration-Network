import mongoose from "mongoose";

const fundingOpportunitySchema = new mongoose.Schema(
  {
    grantTitle: {
      type: String,
      required: true,
      trim: true,
    },
    fundingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    eligibilityCriteria: {
      type: String,
      required: true,
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const FundingOpportunity = mongoose.model(
  "FundingOpportunity",
  fundingOpportunitySchema
);

export default FundingOpportunity;

