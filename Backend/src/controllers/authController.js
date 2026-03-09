// import bcrypt from "bcryptjs";
// import fs from "fs";
// import mongoose from "mongoose";
// import User from "../models/User.js";
// import { getGridFSBucket } from "../config/gridfs.js";

// // SIGNUP
// export const signupUser = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ message: "Username already exists" });
//     }

//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     let profilePictureId = null;

//     if (req.file) {
//       const gfsBucket = getGridFSBucket();

//       const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
//         contentType: req.file.mimetype,
//       });

//       const readStream = fs.createReadStream(req.file.path);

//       await new Promise((resolve, reject) => {
//         readStream
//           .pipe(uploadStream)
//           .on("error", reject)
//           .on("finish", resolve);
//       });

//       profilePictureId = uploadStream.id;

//       // remove temporary local file after saving to GridFS
//       fs.unlinkSync(req.file.path);
//     }

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       profilePictureId,
//     });

//     res.status(201).json({
//       message: "User created successfully",
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//         profilePictureId: newUser.profilePictureId,
//         profilePictureUrl: newUser.profilePictureId
//           ? `http://localhost:5000/api/auth/profile-picture/${newUser.profilePictureId}`
//           : "",
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // LOGIN WITH USERNAME OR EMAIL
// export const loginUser = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;

//     if (!identifier || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const user = await User.findOne({
//       $or: [{ email: identifier }, { username: identifier }],
//     });

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);

//     if (!isPasswordCorrect) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         profilePictureId: user.profilePictureId,
//         profilePictureUrl: user.profilePictureId
//           ? `http://localhost:5000/api/auth/profile-picture/${user.profilePictureId}`
//           : "",
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // STREAM PROFILE PICTURE FROM GRIDFS
// export const getProfilePicture = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid image id" });
//     }

//     const fileId = new mongoose.Types.ObjectId(id);
//     const gfsBucket = getGridFSBucket();

//     const files = await mongoose.connection.db
//       .collection("profilePictures.files")
//       .find({ _id: fileId })
//       .toArray();

//     if (!files || files.length === 0) {
//       return res.status(404).json({ message: "Image not found" });
//     }

//     const file = files[0];
//     res.set("Content-Type", file.contentType || "image/jpeg");

//     const downloadStream = gfsBucket.openDownloadStream(fileId);
//     downloadStream.on("error", () => {
//       res.status(404).json({ message: "Error reading image" });
//     });

//     downloadStream.pipe(res);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import bcrypt from "bcryptjs";
import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getGridFSBucket } from "../config/gridfs.js";

// SIGNUP
export const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePictureId = null;

    if (req.file) {
      const gfsBucket = getGridFSBucket();

      const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });

      const readStream = fs.createReadStream(req.file.path);

      await new Promise((resolve, reject) => {
        readStream
          .pipe(uploadStream)
          .on("error", reject)
          .on("finish", resolve);
      });

      profilePictureId = uploadStream.id;

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePictureId,
      // these stay empty by default for now
      aboutMe: "",
      skills: [],
      relationshipStatus: "",
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        aboutMe: newUser.aboutMe,
        skills: newUser.skills,
        relationshipStatus: newUser.relationshipStatus,
        profilePictureId: newUser.profilePictureId,
        profilePictureUrl: newUser.profilePictureId
          ? `http://localhost:5000/api/auth/profile-picture/${newUser.profilePictureId}`
          : "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN WITH USERNAME OR EMAIL
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        aboutMe: user.aboutMe,
        skills: user.skills,
        relationshipStatus: user.relationshipStatus,
        profilePictureId: user.profilePictureId,
        profilePictureUrl: user.profilePictureId
          ? `http://localhost:5000/api/auth/profile-picture/${user.profilePictureId}`
          : "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// STREAM PROFILE PICTURE FROM GRIDFS
export const getProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid image id" });
    }

    const fileId = new mongoose.Types.ObjectId(id);
    const gfsBucket = getGridFSBucket();

    const files = await mongoose.connection.db
      .collection("profilePictures.files")
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const file = files[0];
    res.set("Content-Type", file.contentType || "image/jpeg");

    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.on("error", () => {
      res.status(404).json({ message: "Error reading image" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};