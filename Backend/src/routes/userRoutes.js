
import express from "express";
import multer from "multer";
import {
  getResearchers,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  uploadProfilePicture,
} from "../controllers/userController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET ALL RESEARCHERS
router.get("/", getResearchers);

// GET USER PROFILE
router.get("/:id", getUserProfile);

// UPDATE USER PROFILE
router.put("/:id", updateUserProfile);

// UPDATE PROFILE PICTURE (multipart)
router.put("/:id/profile-picture", upload.single("profilePicture"), uploadProfilePicture);

// DELETE USER PROFILE
router.delete("/:id", deleteUserProfile);

export default router;