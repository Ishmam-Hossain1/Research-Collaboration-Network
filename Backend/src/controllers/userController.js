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
      researchInterests,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL RESEARCHERS WITH SEARCH + FILTER
export const getResearchers = async (req, res) => {
  try {
    const {
      search = "",
      researchInterest = "",
      skill = "",
      excludeUserId = "",
    } = req.query;

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

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

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

    const user = await User.findById(id)
      .select("-password")
      .populate("collaborators", "-password");

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
      readStream.pipe(uploadStream).on("error", reject).on("finish", resolve);
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

// SEND COLLABORATION REQUEST
export const sendCollaborationRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }

    if (fromUserId === toUserId) {
      return res
        .status(400)
        .json({ message: "You cannot send a collaboration request to yourself" });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadySent = toUser.requestedCollaborations.some(
      (userId) => userId.toString() === fromUserId
    );

    if (alreadySent) {
      return res.status(400).json({ message: "Collaboration request already sent" });
    }

    toUser.requestedCollaborations.push(fromUserId);
    fromUser.sentCollaborations.push(toUserId);

    await toUser.save();
    await fromUser.save();

    res.status(200).json({
      message: "Collaboration request sent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET INCOMING COLLABORATION REQUESTS
export const getCollaborationRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("requestedCollaborations", "-password")
      .select("requestedCollaborations");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Collaboration requests fetched successfully",
      count: user.requestedCollaborations.length,
      requests: user.requestedCollaborations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SENT COLLABORATION REQUESTS
export const getSentCollaborationRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("sentCollaborations", "-password")
      .select("sentCollaborations");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Sent collaboration requests fetched successfully",
      count: user.sentCollaborations.length,
      requests: user.sentCollaborations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACCEPT COLLABORATION REQUEST
export const acceptCollaborationRequest = async (req, res) => {
  try {
    const { currentUserId, requesterUserId } = req.body;

    if (!currentUserId || !requesterUserId) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterUserId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasRequest = currentUser.requestedCollaborations.some(
      (id) => id.toString() === requesterUserId
    );

    if (!hasRequest) {
      return res.status(400).json({ message: "Collaboration request not found" });
    }

    currentUser.requestedCollaborations =
      currentUser.requestedCollaborations.filter(
        (id) => id.toString() !== requesterUserId
      );

    requesterUser.sentCollaborations =
      requesterUser.sentCollaborations.filter(
        (id) => id.toString() !== currentUserId
      );

    const alreadyCollaboratorsForCurrentUser = currentUser.collaborators.some(
      (id) => id.toString() === requesterUserId
    );

    if (!alreadyCollaboratorsForCurrentUser) {
      currentUser.collaborators.push(requesterUserId);
    }

    const alreadyCollaboratorsForRequester = requesterUser.collaborators.some(
      (id) => id.toString() === currentUserId
    );

    if (!alreadyCollaboratorsForRequester) {
      requesterUser.collaborators.push(currentUserId);
    }

    await currentUser.save();
    await requesterUser.save();

    res.status(200).json({
      message: "Collaboration request accepted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REJECT COLLABORATION REQUEST
export const rejectCollaborationRequest = async (req, res) => {
  try {
    const { currentUserId, requesterUserId } = req.body;

    if (!currentUserId || !requesterUserId) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterUserId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasRequest = currentUser.requestedCollaborations.some(
      (id) => id.toString() === requesterUserId
    );

    if (!hasRequest) {
      return res.status(400).json({ message: "Collaboration request not found" });
    }

    currentUser.requestedCollaborations =
      currentUser.requestedCollaborations.filter(
        (id) => id.toString() !== requesterUserId
      );

    requesterUser.sentCollaborations =
      requesterUser.sentCollaborations.filter(
        (id) => id.toString() !== currentUserId
      );

    await currentUser.save();
    await requesterUser.save();

    res.status(200).json({
      message: "Collaboration request rejected successfully",
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