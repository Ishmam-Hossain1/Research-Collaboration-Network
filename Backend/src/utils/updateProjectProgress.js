import Project from "../models/Project.js";
import Milestone from "../models/Milestone.js";

const updateProjectProgress = async (projectId) => {
  const milestones = await Milestone.find({ projectId });

  if (!milestones.length) {
    await Project.findByIdAndUpdate(projectId, { progress: 0, status: "ongoing" });
    return 0;
  }

  let totalUnits = 0;
  let completedUnits = 0;

  for (const milestone of milestones) {
    const weight = milestone.weight || 1;

    if (milestone.subtasks && milestone.subtasks.length > 0) {
      totalUnits += milestone.subtasks.length * weight;

      milestone.subtasks.forEach((subtask) => {
        if (subtask.completed) completedUnits += weight;
      });
    } else {
      totalUnits += weight;
      if (milestone.status === "Completed") completedUnits += weight;
    }
  }

  const progress =
    totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);

  const status = progress === 100 ? "completed" : "ongoing";

  await Project.findByIdAndUpdate(projectId, {
    progress,
    status,
  });

  return progress;
};

export default updateProjectProgress;