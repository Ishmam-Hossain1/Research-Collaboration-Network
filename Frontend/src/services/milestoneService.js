import api from '../lib/api';

export const getMilestones = (projectId) => api.get(`/milestones/${projectId}`);
export const createMilestone = (data) => api.post('/milestones', data);
export const updateMilestone = (id, data) => api.put(`/milestones/${id}`, data);
export const deleteMilestone = (id) => api.delete(`/milestones/${id}`);
export const getActivities = (projectId) => api.get(`/milestones/activity/${projectId}`);
export const reorderMilestones = (orderUpdates) =>
  api.put('/milestones/reorder', { milestones: orderUpdates });

export const toggleMilestone = (id) => api.patch(`/milestones/${id}/toggle`);

export const updateMilestoneSubtasks = (id, subtasks) =>
  api.patch(`/milestones/${id}/subtasks`, { subtasks });