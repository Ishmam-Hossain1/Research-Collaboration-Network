import express from "express";
import {
  createMilestone,
  getProjectMilestones,
  updateMilestone,
  deleteMilestone,
  getProjectActivities,
  reorderMilestones,
  toggleMilestoneCompletion,
  updateMilestoneSubtasks,
} from "../controllers/milestoneController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createMilestone);

router.get("/activity/:projectId", protect, getProjectActivities);
router.get("/:projectId", protect, getProjectMilestones);

router.put("/reorder", protect, reorderMilestones);
router.patch("/:id/toggle", protect, toggleMilestoneCompletion);
router.patch("/:id/subtasks", protect, updateMilestoneSubtasks);

router.put("/:id", protect, updateMilestone);
router.delete("/:id", protect, deleteMilestone);

export default router;