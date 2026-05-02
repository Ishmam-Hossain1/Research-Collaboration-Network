
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
//   getSuggestedCollaborators,
// } from "../controllers/userController.js";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// // GET ALL RESEARCHERS
// router.get("/", getResearchers);

// // GET SUGGESTED COLLABORATORS
// router.get("/:id/suggested-collaborators", getSuggestedCollaborators);

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
  createUser,
  getResearchers,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  sendCollaborationRequest,
  getCollaborationRequests,
  getSentCollaborationRequests,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
  removeCollaborator,
  cancelSentCollaborationRequest,
  getSuggestedCollaborators,
  deleteUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

/*
  IMPORTANT:
  Keep all specific routes BEFORE "/:id".
  Otherwise Express may treat words like "researchers" or "collaboration-request"
  as an id and cause 404/confusing errors.
*/

// Create user
router.post("/", createUser);

// Researchers list/search
// This supports your current frontend call: /api/users?search=...
router.get("/", getResearchers);

// This also supports: /api/users/researchers
router.get("/researchers", getResearchers);

// Collaboration request routes
router.post("/collaboration-request", sendCollaborationRequest);

// These support your current CollaborationRequests.jsx calls:
router.post("/collaboration-request/accept", acceptCollaborationRequest);
router.post("/collaboration-request/reject", rejectCollaborationRequest);

// These keep compatibility with the alternate route names:
router.post("/accept-collaboration-request", acceptCollaborationRequest);
router.post("/reject-collaboration-request", rejectCollaborationRequest);

// CANCEL SENT COLLABORATION REQUEST
router.post("/collaboration-request/cancel", cancelSentCollaborationRequest);

// Remove collaborator
router.post("/remove-collaborator", removeCollaborator);

// User-specific collaboration routes
router.get("/:id/collaboration-requests", getCollaborationRequests);
router.get("/:id/sent-collaboration-requests", getSentCollaborationRequests);

// Suggested collaborators
router.get("/:id/suggested-collaborators", getSuggestedCollaborators);

// Profile picture
router.put(
  "/:id/profile-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);

// User profile
router.get("/:id", getUserProfile);
router.put("/:id", updateUserProfile);
router.delete("/:id", deleteUserProfile);

export default router;