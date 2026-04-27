import fs from "fs";
import mongoose from "mongoose";
import GrantApplication from "../models/GrantApplication.js";
import FundingOpportunity from "../models/FundingOpportunity.js";
import { getGrantApplicationsBucket } from "../config/gridfs.js";

export const submitGrantApplication = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Proposal document is required" });
    }

    const {
      fundingOpportunity,
      projectTitle,
      abstract,
      requestedFunding,
      researchField,
    } = req.body;

    if (
      !fundingOpportunity ||
      !projectTitle ||
      !abstract ||
      !requestedFunding ||
      !researchField
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(fundingOpportunity)) {
      return res.status(400).json({ message: "Invalid funding opportunity ID" });
    }

    const opportunity = await FundingOpportunity.findById(fundingOpportunity);

    if (!opportunity) {
      return res.status(404).json({ message: "Funding opportunity not found" });
    }

    const existingApplication = await GrantApplication.findOne({
      fundingOpportunity,
      applicant: req.user._id,
      status: { $in: ["submitted", "under_review"] },
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this funding opportunity",
      });
    }

    const gfsBucket = getGrantApplicationsBucket();

    const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    const readStream = fs.createReadStream(req.file.path);

    await new Promise((resolve, reject) => {
      readStream.pipe(uploadStream).on("error", reject).on("finish", resolve);
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const application = await GrantApplication.create({
      fundingOpportunity,
      applicant: req.user._id,
      projectTitle,
      abstract,
      requestedFunding,
      researchField,
      proposalFileId: uploadStream.id,
      proposalFileName: req.file.originalname,
      proposalMimeType: req.file.mimetype,
      proposalFileSize: req.file.size,
      status: "submitted",
    });

    await application.populate("fundingOpportunity");
    await application.populate("applicant", "username email");

    res.status(201).json({
      message: "Grant application submitted successfully",
      application,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Error submitting grant application",
      error: error.message,
    });
  }
};

export const getMyGrantApplications = async (req, res) => {
  try {
    const applications = await GrantApplication.find({
      applicant: req.user._id,
    })
      .populate("fundingOpportunity")
      .populate("applicant", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching your grant applications",
      error: error.message,
    });
  }
};

export const getReceivedGrantApplications = async (req, res) => {
  try {
    const myFundingOpportunities = await FundingOpportunity.find({
      postedBy: req.user._id,
    }).select("_id");

    const opportunityIds = myFundingOpportunities.map((item) => item._id);

    const applications = await GrantApplication.find({
      fundingOpportunity: { $in: opportunityIds },
    })
      .populate("fundingOpportunity")
      .populate("applicant", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching received grant applications",
      error: error.message,
    });
  }
};

export const getGrantApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await GrantApplication.findById(id)
      .populate("fundingOpportunity")
      .populate("applicant", "username email");

    if (!application) {
      return res.status(404).json({ message: "Grant application not found" });
    }

    const isApplicant =
      application.applicant._id.toString() === req.user._id.toString();

    const isFundingOwner =
      application.fundingOpportunity.postedBy.toString() ===
      req.user._id.toString();

    if (!isApplicant && !isFundingOwner) {
      return res.status(403).json({
        message: "Not authorized to view this application",
      });
    }

    res.status(200).json({ application });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching grant application",
      error: error.message,
    });
  }
};

export const updateMyGrantApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectTitle, abstract, requestedFunding, researchField } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await GrantApplication.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Grant application not found" });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to edit this application",
      });
    }

    if (!["submitted", "under_review"].includes(application.status)) {
      return res.status(400).json({
        message: "Approved or rejected applications cannot be edited",
      });
    }

    application.projectTitle = projectTitle || application.projectTitle;
    application.abstract = abstract || application.abstract;
    application.requestedFunding =
      requestedFunding !== undefined
        ? requestedFunding
        : application.requestedFunding;
    application.researchField = researchField || application.researchField;

    await application.save();

    await application.populate("fundingOpportunity");
    await application.populate("applicant", "username email");

    res.status(200).json({
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating application",
      error: error.message,
    });
  }
};

export const updateGrantApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerNote } = req.body;

    const allowedStatuses = [
      "submitted",
      "under_review",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const application = await GrantApplication.findById(id).populate(
      "fundingOpportunity"
    );

    if (!application) {
      return res.status(404).json({ message: "Grant application not found" });
    }

    const isFundingOwner =
      application.fundingOpportunity.postedBy.toString() ===
      req.user._id.toString();

    if (!isFundingOwner) {
      return res.status(403).json({
        message: "Only the funding opportunity creator can update status",
      });
    }

    application.status = status;

    if (reviewerNote !== undefined) {
      application.reviewerNote = reviewerNote;
    }

    await application.save();

    await application.populate("fundingOpportunity");
    await application.populate("applicant", "username email");

    res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating application status",
      error: error.message,
    });
  }
};

export const downloadGrantProposal = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await GrantApplication.findById(id)
      .populate("fundingOpportunity")
      .populate("applicant", "username email");

    if (!application) {
      return res.status(404).json({ message: "Grant application not found" });
    }

    const isApplicant =
      application.applicant._id.toString() === req.user._id.toString();

    const isFundingOwner =
      application.fundingOpportunity.postedBy.toString() ===
      req.user._id.toString();

    if (!isApplicant && !isFundingOwner) {
      return res.status(403).json({
        message: "Not authorized to download this proposal",
      });
    }

    const gfsBucket = getGrantApplicationsBucket();
    const fileId = new mongoose.Types.ObjectId(application.proposalFileId);

    const files = await mongoose.connection.db
      .collection("grantApplications.files")
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "Proposal file not found" });
    }

    res.set(
      "Content-Type",
      application.proposalMimeType || "application/octet-stream"
    );

    res.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        application.proposalFileName
      )}"`
    );

    const downloadStream = gfsBucket.openDownloadStream(fileId);

    downloadStream.on("error", () => {
      res.status(500).json({ message: "Error reading proposal file" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      message: "Error downloading proposal",
      error: error.message,
    });
  }
};

export const deleteGrantApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await GrantApplication.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Grant application not found" });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the applicant can delete this application",
      });
    }

    if (application.status !== "submitted") {
      return res.status(400).json({
        message: "Only submitted applications can be deleted",
      });
    }

    const gfsBucket = getGrantApplicationsBucket();

    try {
      await gfsBucket.delete(
        new mongoose.Types.ObjectId(application.proposalFileId)
      );
    } catch {
      // Continue even if file is already missing
    }

    await GrantApplication.findByIdAndDelete(id);

    res.status(200).json({
      message: "Grant application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting grant application",
      error: error.message,
    });
  }
};