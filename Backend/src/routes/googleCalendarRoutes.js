import express from "express";
import {
  connectGoogleCalendar,
  googleCalendarCallback,
  getGoogleCalendarStatus,
  addConferenceToCalendar,
} from "../controllers/googleCalendarController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/connect", protect, connectGoogleCalendar);
router.get("/callback", googleCalendarCallback);
router.get("/status", protect, getGoogleCalendarStatus);
router.post("/add-conference", protect, addConferenceToCalendar);

export default router;