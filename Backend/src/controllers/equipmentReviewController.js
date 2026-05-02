import mongoose from "mongoose";
import EquipmentReview from "../models/EquipmentReview.js";
import Equipment from "../models/Equipment.js";

// ADD REVIEW
export const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid equipment ID" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        // Use findOneAndUpdate with upsert to handle both create and update
        const review = await EquipmentReview.findOneAndUpdate(
            { equipment: id, user: userId },
            { rating, comment: comment || "" },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        ).populate("user", "username email");

        res.status(201).json({
            message: "Review submitted successfully",
            review: review,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET EQUIPMENT REVIEWS
export const getEquipmentReviews = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid equipment ID" });
        }

        const reviews = await EquipmentReview.find({ equipment: id })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE REVIEW BY ID
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review id" });
        }

        const review = await EquipmentReview.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Authorization check
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this review" });
        }

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        const populatedReview = await EquipmentReview.findById(review._id).populate("user", "username email");

        res.status(200).json({
            message: "Review updated successfully",
            review: populatedReview,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE REVIEW BY ID
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review id" });
        }

        const review = await EquipmentReview.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Authorization check
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await EquipmentReview.findByIdAndDelete(id);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
