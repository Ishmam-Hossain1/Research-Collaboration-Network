
// import express from "express";
// import multer from "multer";
// import {
//   signupUser,
//   loginUser,
//   getProfilePicture,
// } from "../controllers/authController.js";

// const router = express.Router();

// const upload = multer({ dest: "uploads/" });

// router.post("/signup", upload.single("profilePicture"), signupUser);
// router.post("/login", loginUser);
// router.get("/profile-picture/:id", getProfilePicture);

// export default router;


import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import {
  signupUser,
  loginUser,
  getProfilePicture,
} from "../controllers/authController.js";

const router = express.Router();

const uploadDir = process.env.VERCEL
  ? "/tmp/uploads"
  : path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post("/signup", upload.single("profilePicture"), signupUser);
router.post("/login", loginUser);
router.get("/profile-picture/:id", getProfilePicture);

export default router;