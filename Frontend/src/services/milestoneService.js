import api from "../lib/api";

export const getMilestones = (projectId) => {
  return api.get(`/milestones/${projectId}`);
};

export const createMilestone = (data) => {
  return api.post("/milestones", data);
};

export const updateMilestone = (id, data) => {
  return api.put(`/milestones/${id}`, data);
};

export const deleteMilestone = (id) => {
  return api.delete(`/milestones/${id}`);
};

export const toggleMilestone = (id) => {
  return api.patch(`/milestones/${id}/toggle`);
};

export const updateMilestoneSubtasks = (id, subtasks) => {
  return api.patch(`/milestones/${id}/subtasks`, { subtasks });
};

export const reorderMilestones = (orderUpdates) => {
  return api.put("/milestones/reorder", {
    milestones: orderUpdates,
  });
};

export const getActivities = (projectId) => {
  return api.get(`/milestones/activity/${projectId}`);
};