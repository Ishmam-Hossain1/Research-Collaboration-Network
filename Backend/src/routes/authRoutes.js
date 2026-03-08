// import express from "express";
// import { signupUser, loginUser } from "../controllers/authController.js";

// const router = express.Router();

// router.post("/signup", signupUser);
// router.post("/login", loginUser);

// export default router;

import express from "express";
import multer from "multer";
import {
  signupUser,
  loginUser,
  getProfilePicture,
} from "../controllers/authController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/signup", upload.single("profilePicture"), signupUser);
router.post("/login", loginUser);
router.get("/profile-picture/:id", getProfilePicture);

export default router;