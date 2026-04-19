import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Project from "../models/Project.js";

// ADD FEEDBACK
export const addFeedback = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project id" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if user already submitted feedback
        const existingFeedback = await Feedback.findOne({ project: projectId, user: userId });
        if (existingFeedback) {
            existingFeedback.rating = rating;
            existingFeedback.comment = comment || "";
            await existingFeedback.save();

            const populatedFeedback = await Feedback.findById(existingFeedback._id).populate("user", "username email");
            return res.status(200).json({ message: "Feedback updated", feedback: populatedFeedback });
        }

        const newFeedback = await Feedback.create({
            project: projectId,
            user: userId,
            rating,
            comment: comment || "",
        });

        const populatedFeedback = await Feedback.findById(newFeedback._id).populate("user", "username email");

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback: populatedFeedback,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already provided feedback for this project." });
        }
        res.status(500).json({ message: error.message });
    }
};

// GET PROJECT FEEDBACK
export const getProjectFeedback = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project id" });
        }

        const feedbacks = await Feedback.find({ project: projectId })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE FEEDBACK BY ID
export const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid feedback id" });
        }

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        // Authorization check
        if (feedback.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this feedback" });
        }

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }
            feedback.rating = rating;
        }

        if (comment !== undefined) {
            feedback.comment = comment;
        }

        await feedback.save();

        const populatedFeedback = await Feedback.findById(feedback._id).populate("user", "username email");

        res.status(200).json({
            message: "Feedback updated successfully",
            feedback: populatedFeedback,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE FEEDBACK BY ID
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid feedback id" });
        }

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        // Authorization check
        if (feedback.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this feedback" });
        }

        await Feedback.findByIdAndDelete(id);

        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
