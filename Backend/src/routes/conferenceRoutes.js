import express from "express";
import {
  createConference,
  getConferences,
  getConferenceById,
  updateConference,
  deleteConference,
} from "../controllers/conferenceController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createConference);
router.get("/", getConferences);
router.get("/:id", getConferenceById);
router.put("/:id", protect, updateConference);
router.delete("/:id", protect, deleteConference);

export default router;