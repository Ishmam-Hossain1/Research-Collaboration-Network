import { google } from "googleapis";
import GoogleToken from "../models/GoogleToken.js";
import Conference from "../models/Conference.js";

const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const connectGoogleCalendar = async (req, res) => {
  try {
    const oauth2Client = createOAuthClient();

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      state: req.user._id.toString(),
    });

    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleCalendarCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ message: "Missing Google OAuth data" });
    }

    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    await GoogleToken.findOneAndUpdate(
      { userId: state },
      {
        userId: state,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date,
      },
      { upsert: true, new: true }
    );

    res.redirect(`${process.env.FRONTEND_URL}/calendar-connected`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoogleCalendarStatus = async (req, res) => {
  try {
    const token = await GoogleToken.findOne({ userId: req.user._id });

    res.status(200).json({
      connected: !!token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addConferenceToCalendar = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    const conference = await Conference.findById(conferenceId);

    if (!conference) {
      return res.status(404).json({ message: "Conference not found" });
    }

    const token = await GoogleToken.findOne({ userId: req.user._id });

    if (!token) {
      return res.status(401).json({
        message: "Google Calendar is not connected",
        needsGoogleAuth: true,
      });
    }

    const oauth2Client = createOAuthClient();

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate,
      token_type: token.tokenType,
      scope: token.scope,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    const event = {
      summary: conference.title,
      location: conference.location,
      description: `
${conference.description || ""}

Field: ${conference.field}
Website: ${conference.website || "N/A"}
Submission Deadline: ${
        conference.submissionDeadline
          ? new Date(conference.submissionDeadline).toLocaleDateString()
          : "N/A"
      }

Added from Research Connect.
      `,
      start: {
        dateTime: new Date(conference.startDate).toISOString(),
      },
      end: {
        dateTime: new Date(conference.endDate).toISOString(),
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 * 24 },
          { method: "email", minutes: 60 * 24 * 7 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    res.status(201).json({
      message: "Conference added to Google Calendar",
      eventLink: response.data.htmlLink,
      eventId: response.data.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add conference to Google Calendar",
      error: error.message,
    });
  }
};