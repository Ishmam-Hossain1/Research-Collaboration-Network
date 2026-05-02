import api from "../lib/api";

export const getMyNotifications = () => api.get("/notifications");

export const getUnreadNotificationCount = () =>
  api.get("/notifications/unread-count");

export const markNotificationAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  api.patch("/notifications/read-all");