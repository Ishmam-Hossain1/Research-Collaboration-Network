// import express from "express";
// import multer from "multer";
// import {
//   getResearchers,
//   getUserProfile,
//   updateUserProfile,
//   deleteUserProfile,
//   uploadProfilePicture,
//   sendCollaborationRequest,
//   getCollaborationRequests,
//   getSentCollaborationRequests,
//   acceptCollaborationRequest,
//   rejectCollaborationRequest,
// } from "../controllers/userController.js";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// // GET ALL RESEARCHERS
// router.get("/", getResearchers);

// // SEND COLLABORATION REQUEST
// router.post("/collaboration-request", sendCollaborationRequest);

// // ACCEPT COLLABORATION REQUEST
// router.post("/collaboration-request/accept", acceptCollaborationRequest);

// // REJECT COLLABORATION REQUEST
// router.post("/collaboration-request/reject", rejectCollaborationRequest);

// // GET RECEIVED COLLABORATION REQUESTS
// router.get("/:id/collaboration-requests", getCollaborationRequests);

// // GET SENT COLLABORATION REQUESTS
// router.get("/:id/sent-collaboration-requests", getSentCollaborationRequests);

// // GET USER PROFILE
// router.get("/:id", getUserProfile);

// // UPDATE USER PROFILE
// router.put("/:id", updateUserProfile);

// // UPDATE PROFILE PICTURE
// router.put("/:id/profile-picture", upload.single("profilePicture"), uploadProfilePicture);

// // DELETE USER PROFILE
// router.delete("/:id", deleteUserProfile);

// export default router;

import express from "express";
import multer from "multer";
import {
  getResearchers,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  uploadProfilePicture,
  sendCollaborationRequest,
  getCollaborationRequests,
  getSentCollaborationRequests,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
  getSuggestedCollaborators,
} from "../controllers/userController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET ALL RESEARCHERS
router.get("/", getResearchers);

// GET SUGGESTED COLLABORATORS
router.get("/:id/suggested-collaborators", getSuggestedCollaborators);

// SEND COLLABORATION REQUEST
router.post("/collaboration-request", sendCollaborationRequest);

// ACCEPT COLLABORATION REQUEST
router.post("/collaboration-request/accept", acceptCollaborationRequest);

// REJECT COLLABORATION REQUEST
router.post("/collaboration-request/reject", rejectCollaborationRequest);

// GET RECEIVED COLLABORATION REQUESTS
router.get("/:id/collaboration-requests", getCollaborationRequests);

// GET SENT COLLABORATION REQUESTS
router.get("/:id/sent-collaboration-requests", getSentCollaborationRequests);

// GET USER PROFILE
router.get("/:id", getUserProfile);

// UPDATE USER PROFILE
router.put("/:id", updateUserProfile);

// UPDATE PROFILE PICTURE
router.put("/:id/profile-picture", upload.single("profilePicture"), uploadProfilePicture);

// DELETE USER PROFILE
router.delete("/:id", deleteUserProfile);

export default router;