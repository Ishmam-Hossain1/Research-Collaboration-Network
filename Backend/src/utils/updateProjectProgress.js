import Project from "../models/Project.js";
import Milestone from "../models/Milestone.js";

const updateProjectProgress = async (projectId) => {
  const milestones = await Milestone.find({ projectId });

  let progress = 0;

  if (milestones.length > 0) {
    const completedCount = milestones.filter(
      (milestone) => milestone.status === "Completed"
    ).length;

    progress = Math.round((completedCount / milestones.length) * 100);
  }

  const status =
    milestones.length > 0 && progress === 100 ? "completed" : "ongoing";

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      progress,
      status,
    },
    { new: true }
  ).populate("owner", "username email");

  return project;
};

export default updateProjectProgress;