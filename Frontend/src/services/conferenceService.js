import api from "../lib/api";

export const getConferences = (params = {}) =>
  api.get("/conferences", { params });

export const getGoogleCalendarStatus = () =>
  api.get("/google-calendar/status");

export const connectGoogleCalendar = () =>
  api.get("/google-calendar/connect");

export const addConferenceEventToCalendar = (conferenceId) =>
  api.post("/google-calendar/add-conference", {
    conferenceId,
    type: "event",
  });

export const addSubmissionDeadlineToCalendar = (conferenceId) =>
  api.post("/google-calendar/add-conference", {
    conferenceId,
    type: "deadline",
  });

export const saveConference = (conferenceId) =>
  api.post(`/conferences/${conferenceId}/save`);

export const unsaveConference = (conferenceId) =>
  api.delete(`/conferences/${conferenceId}/save`);

export const getSavedConferences = () =>
  api.get("/conferences/saved");