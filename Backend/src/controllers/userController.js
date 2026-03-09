import fs from "fs";
import User from "../models/User.js";
import { getGridFSBucket } from "../config/gridfs.js";

export const createUser = async (req, res) => {
  try {
    const { username, email, password, researchInterests } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      researchInterests
    });

    res.status(201).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL RESEARCHERS WITH SEARCH + FILTER
export const getResearchers = async (req, res) => {
  try {
    const { search = "", researchInterest = "", skill = "", excludeUserId = "" } = req.query;

    const query = {};

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    if (search.trim()) {
      query.$or = [
        { username: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (researchInterest.trim()) {
      query.researchInterests = {
        $elemMatch: { $regex: researchInterest.trim(), $options: "i" },
      };
    }

    if (skill.trim()) {
      query.skills = {
        $elemMatch: { $regex: skill.trim(), $options: "i" },
      };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Researchers fetched successfully",
      count: users.length,
      researchers: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      researchInterests,
      aboutMe,
      skills,
      relationshipStatus,
    } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // optional uniqueness checks if username/email are changed
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    if (researchInterests !== undefined) {
      user.researchInterests = researchInterests;
    }

    if (aboutMe !== undefined) {
      user.aboutMe = aboutMe;
    }

    if (skills !== undefined) {
      user.skills = skills;
    }

    if (relationshipStatus !== undefined) {
      user.relationshipStatus = relationshipStatus;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        researchInterests: updatedUser.researchInterests,
        aboutMe: updatedUser.aboutMe,
        skills: updatedUser.skills,
        relationshipStatus: updatedUser.relationshipStatus,
        profilePictureId: updatedUser.profilePictureId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD PROFILE PICTURE (GridFS)
export const uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No profile picture file provided" });
    }

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

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    user.profilePictureId = uploadStream.id;
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePictureId: updatedUser.profilePictureId,
        aboutMe: updatedUser.aboutMe,
        skills: updatedUser.skills,
        relationshipStatus: updatedUser.relationshipStatus,
        researchInterests: updatedUser.researchInterests,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER PROFILE
export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};