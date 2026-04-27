import express from "express";
import multer from "multer";
import {
  submitGrantApplication,
  getMyGrantApplications,
  getReceivedGrantApplications,
  getGrantApplicationById,
  updateGrantApplicationStatus,
  downloadGrantProposal,
  deleteGrantApplication,
  updateMyGrantApplication,
} from "../controllers/grantApplicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("proposal"), submitGrantApplication);

router.get("/mine", protect, getMyGrantApplications);

router.get("/received", protect, getReceivedGrantApplications);

router.get("/:id", protect, getGrantApplicationById);

router.get("/:id/download", protect, downloadGrantProposal);

router.put("/:id/status", protect, updateGrantApplicationStatus);

router.delete("/:id", protect, deleteGrantApplication);

router.put("/:id", protect, updateMyGrantApplication);

export default router;