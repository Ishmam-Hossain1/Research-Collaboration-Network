// import express from "express";
// import User from "../models/User.js";

// const router = express.Router();

// // CREATE USER
// router.post("/", async (req, res) => {
//   try {
//     const { username, email, password, researchInterests } = req.body;

//     const newUser = new User({
//       username,
//       email,
//       password,
//       researchInterests,
//     });

//     await newUser.save();

//     res.status(201).json({
//       message: "User created successfully",
//       user: newUser,
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Error creating user",
//       error: error.message
//     });
//   }
// });

// export default router;

import express from "express";
import multer from "multer";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  uploadProfilePicture,
} from "../controllers/userController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET USER PROFILE
router.get("/:id", getUserProfile);

// UPDATE USER PROFILE
router.put("/:id", updateUserProfile);

// UPDATE PROFILE PICTURE (multipart)
router.put("/:id/profile-picture", upload.single("profilePicture"), uploadProfilePicture);

// DELETE USER PROFILE
router.delete("/:id", deleteUserProfile);

export default router;