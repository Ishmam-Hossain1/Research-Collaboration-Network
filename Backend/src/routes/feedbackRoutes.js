import express from "express";
import protect from "../middleware/authMiddleware.js";
import { addFeedback, getProjectFeedback, updateFeedback, deleteFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

// Fetch all feedback for a specific project (public route)
router.get("/:projectId", getProjectFeedback);

// Add feedback for a specific project (requires login)
router.post("/:projectId", protect, addFeedback);

// Update feedback by feedback ID (only owner)
router.put("/:id", protect, updateFeedback);

// Delete feedback by feedback ID (only owner)
router.delete("/:id", protect, deleteFeedback);

export default router;
