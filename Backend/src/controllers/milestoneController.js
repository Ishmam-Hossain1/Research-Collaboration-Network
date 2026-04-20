import mongoose from "mongoose";
import Milestone from "../models/Milestone.js";
import Activity from "../models/Activity.js";
import updateProjectProgress from "../utils/updateProjectProgress.js";
import logActivity from "../utils/logActivity.js";

const recalculateMilestoneStatus = (milestone) => {
  if (milestone.subtasks && milestone.subtasks.length > 0) {
    const total = milestone.subtasks.length;
    const completed = milestone.subtasks.filter((s) => s.completed).length;

    if (completed === 0) {
      milestone.status = "Pending";
      milestone.completedAt = null;
      milestone.completedBy = null;
    } else if (completed === total) {
      milestone.status = "Completed";
      if (!milestone.completedAt) milestone.completedAt = new Date();
    } else {
      milestone.status = "In Progress";
      milestone.completedAt = null;
      milestone.completedBy = null;
    }
  } else {
    if (milestone.status === "Completed") {
      if (!milestone.completedAt) milestone.completedAt = new Date();
    } else {
      milestone.completedAt = null;
      milestone.completedBy = null;
    }
  }
};

export const createMilestone = async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      status,
      startDate,
      deadline,
      order,
      subtasks,
      weight,
    } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: "projectId and title are required",
      });
    }

    const milestone = await Milestone.create({
      projectId,
      title,
      description: description || "",
      status: status || "Pending",
      startDate: startDate || null,
      deadline: deadline || null,
      order: typeof order === "number" ? order : 0,
      weight: weight || 1,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
    });

    recalculateMilestoneStatus(milestone);
    await milestone.save();

    await updateProjectProgress(projectId);
    await logActivity(projectId, req.user._id, `Added milestone "${title}"`);

    res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create milestone",
      error: error.message,
    });
  }
};

export const getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project id",
      });
    }

    const milestones = await Milestone.find({ projectId }).sort({
      order: 1,
      startDate: 1,
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch milestones",
      error: error.message,
    });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      startDate,
      deadline,
      order,
      subtasks,
      weight,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone id",
      });
    }

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    if (title !== undefined) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (startDate !== undefined) milestone.startDate = startDate || null;
    if (deadline !== undefined) milestone.deadline = deadline || null;
    if (typeof order === "number") milestone.order = order;
    if (weight !== undefined) milestone.weight = weight;

    if (Array.isArray(subtasks)) {
      milestone.subtasks = subtasks.map((task) => ({
        title: task.title,
        completed: !!task.completed,
      }));
    }

    if (status !== undefined && !Array.isArray(subtasks)) {
      milestone.status = status;

      if (status === "Completed") {
        milestone.completedAt = new Date();
        milestone.completedBy = req.user._id;
      } else {
        milestone.completedAt = null;
        milestone.completedBy = null;
      }
    }

    recalculateMilestoneStatus(milestone);

    if (milestone.status === "Completed" && !milestone.completedBy) {
      milestone.completedBy = req.user._id;
    }

    await milestone.save();

    const progress = await updateProjectProgress(milestone.projectId);
    await logActivity(
      milestone.projectId,
      req.user._id,
      `Updated milestone "${milestone.title}"`
    );

    res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      milestone,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update milestone",
      error: error.message,
    });
  }
};

export const toggleMilestoneCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone id",
      });
    }

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    if (milestone.subtasks && milestone.subtasks.length > 0) {
      const allCompleted = milestone.subtasks.every((task) => task.completed);

      milestone.subtasks = milestone.subtasks.map((task) => ({
        title: task.title,
        completed: !allCompleted,
      }));

      if (!allCompleted) {
        milestone.status = "Completed";
        milestone.completedAt = new Date();
        milestone.completedBy = req.user._id;
      } else {
        milestone.status = "Pending";
        milestone.completedAt = null;
        milestone.completedBy = null;
      }
    } else {
      const willComplete = milestone.status !== "Completed";

      milestone.status = willComplete ? "Completed" : "Pending";
      milestone.completedAt = willComplete ? new Date() : null;
      milestone.completedBy = willComplete ? req.user._id : null;
    }

    await milestone.save();

    const progress = await updateProjectProgress(milestone.projectId);
    await logActivity(
      milestone.projectId,
      req.user._id,
      `${milestone.status === "Completed" ? "Completed" : "Reopened"} milestone "${milestone.title}"`
    );

    res.status(200).json({
      success: true,
      message: "Milestone completion toggled successfully",
      milestone,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle milestone completion",
      error: error.message,
    });
  }
};

export const updateMilestoneSubtasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { subtasks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone id",
      });
    }

    if (!Array.isArray(subtasks)) {
      return res.status(400).json({
        success: false,
        message: "subtasks must be an array",
      });
    }

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    milestone.subtasks = subtasks.map((task) => ({
      title: task.title,
      completed: !!task.completed,
    }));

    recalculateMilestoneStatus(milestone);

    if (milestone.status === "Completed") {
      milestone.completedBy = req.user._id;
      if (!milestone.completedAt) milestone.completedAt = new Date();
    }

    await milestone.save();

    const progress = await updateProjectProgress(milestone.projectId);
    await logActivity(
      milestone.projectId,
      req.user._id,
      `Updated subtasks for milestone "${milestone.title}"`
    );

    res.status(200).json({
      success: true,
      message: "Milestone subtasks updated successfully",
      milestone,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update milestone subtasks",
      error: error.message,
    });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone id",
      });
    }

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    const projectId = milestone.projectId;
    const title = milestone.title;

    await milestone.deleteOne();

    const progress = await updateProjectProgress(projectId);
    await logActivity(projectId, req.user._id, `Deleted milestone "${title}"`);

    res.status(200).json({
      success: true,
      message: "Milestone deleted successfully",
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete milestone",
      error: error.message,
    });
  }
};

export const getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project id",
      });
    }

    const activities = await Activity.find({ projectId })
      .populate("userId", "name username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity log",
      error: error.message,
    });
  }
};

export const reorderMilestones = async (req, res) => {
  try {
    const { milestones } = req.body;

    if (!milestones || !Array.isArray(milestones)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    for (const item of milestones) {
      if (!item.id || typeof item.order !== "number") continue;
      await Milestone.findByIdAndUpdate(item.id, { order: item.order });
    }

    res.status(200).json({
      success: true,
      message: "Milestone order updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};