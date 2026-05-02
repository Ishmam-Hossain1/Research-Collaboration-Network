import fs from "fs";
import User from "../models/User.js";
import Project from "../models/Project.js";
import { getGridFSBucket } from "../config/gridfs.js";
import createNotification from "../utils/createNotification.js";

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "openai/gpt-oss-20b";

const normalizeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
};

const getRequestUserId = (request) => {
  if (!request) return "";
  if (request.user?._id) return request.user._id.toString();
  if (request.user) return request.user.toString();
  if (request._id) return request._id.toString();
  return request.toString();
};

const getRequestProjectId = (request) => {
  if (!request) return "";
  if (request.project?._id) return request.project._id.toString();
  if (request.project) return request.project.toString();
  return "";
};

const buildLocalCandidateSummary = (currentUser, candidate) => {
  const currentInterests = normalizeArray(currentUser.researchInterests).map(
    (v) => v.toLowerCase()
  );
  const currentSkills = normalizeArray(currentUser.skills).map((v) =>
    v.toLowerCase()
  );

  const candidateInterests = normalizeArray(candidate.researchInterests);
  const candidateSkills = normalizeArray(candidate.skills);

  const sharedInterests = candidateInterests.filter((item) =>
    currentInterests.includes(String(item).toLowerCase())
  );

  const sharedSkills = candidateSkills.filter((item) =>
    currentSkills.includes(String(item).toLowerCase())
  );

  return {
    id: candidate._id.toString(),
    username: candidate.username,
    email: candidate.email,
    aboutMe: candidate.aboutMe || "",
    researchInterests: candidate.researchInterests || [],
    skills: candidate.skills || [],
    relationshipStatus: candidate.relationshipStatus || "",
    profilePictureId: candidate.profilePictureId || null,
    sharedInterests,
    sharedSkills,
  };
};

const getSuggestedCollaboratorsFromHF = async (currentUser, candidates) => {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is missing in environment variables");
  }

  const payload = {
    currentUser: {
      id: currentUser._id.toString(),
      username: currentUser.username,
      aboutMe: currentUser.aboutMe || "",
      researchInterests: normalizeArray(currentUser.researchInterests),
      skills: normalizeArray(currentUser.skills),
    },
    candidates: candidates.map((candidate) => ({
      id: candidate._id.toString(),
      username: candidate.username,
      aboutMe: candidate.aboutMe || "",
      researchInterests: normalizeArray(candidate.researchInterests),
      skills: normalizeArray(candidate.skills),
    })),
  };

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_MODEL,
      stream: false,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are an intelligent research collaborator matching assistant.

Return ONLY valid JSON.
Do not include markdown fences.
Do not include explanations outside JSON.

Required JSON shape:
{
  "matches": [
    {
      "id": "candidate user id",
      "matchScore": 0,
      "reason": "short explanation",
      "sharedInterests": ["..."],
      "sharedSkills": ["..."]
    }
  ]
}

Rules:
- matchScore must be an integer from 0 to 100.
- Rank candidates from best to worst.
- Prefer overlap in researchInterests first, then skills.
- sharedInterests and sharedSkills must contain only items that actually overlap.
- Keep reason concise and practical.
- Return at most 8 matches.
- If there is no meaningful overlap, DO NOT include that candidate.
- It is acceptable to return an empty matches array.`,
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Hugging Face API request failed");
  }

  const rawContent = data?.choices?.[0]?.message?.content || "{}";

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error("Failed to parse Hugging Face model response");
  }

  return Array.isArray(parsed.matches) ? parsed.matches : [];
};

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

    const user = await User.findById(id)
      .select("-password")
      .populate("collaborators", "-password")
      .populate("requestedCollaborations.user", "-password")
      .populate("requestedCollaborations.project", "title abstract researchField status progress owner")
      .populate("sentCollaborations.user", "-password")
      .populate("sentCollaborations.project", "title abstract researchField status progress owner");

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
      user.researchInterests = normalizeArray(researchInterests);
    }

    if (aboutMe !== undefined) {
      user.aboutMe = aboutMe;
    }

    if (skills !== undefined) {
      user.skills = normalizeArray(skills);
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

// UPLOAD PROFILE PICTURE
export const uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ message: "No profile picture file provided" });
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

// SEND PROJECT COLLABORATION REQUEST
export const sendCollaborationRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId, projectId } = req.body;

    if (!fromUserId || !toUserId || !projectId) {
      return res.status(400).json({
        message: "fromUserId, toUserId, and projectId are required",
      });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({
        message: "You cannot send a collaboration request to yourself",
      });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    const project = await Project.findById(projectId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== toUserId.toString()) {
      return res.status(400).json({
        message: "Collaboration request must be sent to the project owner",
      });
    }

    const alreadyProjectCollaborator = project.collaborators.some(
      (collaboratorId) =>
        collaboratorId.toString() === fromUserId.toString()
    );

    if (alreadyProjectCollaborator) {
      return res.status(400).json({
        message: "You are already collaborating on this project",
      });
    }

    const alreadySent = toUser.requestedCollaborations.some(
      (request) =>
        getRequestUserId(request) === fromUserId.toString() &&
        getRequestProjectId(request) === projectId.toString()
    );

    if (alreadySent) {
      return res.status(400).json({
        message: "Collaboration request already sent for this project",
      });
    }

    toUser.requestedCollaborations.push({
      user: fromUserId,
      project: projectId,
    });

    fromUser.sentCollaborations.push({
      user: toUserId,
      project: projectId,
    });

    await toUser.save();
    await fromUser.save();

    await createNotification({
      recipient: toUser._id,
      sender: fromUser._id,
      title: "New Project Collaboration Request",
      message: `${fromUser.username} wants to collaborate on "${project.title}".`,
      type: "collaboration",
      link: "/collaboration-requests",
    });

    res.status(200).json({
      message: "Collaboration request sent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET INCOMING PROJECT COLLABORATION REQUESTS
export const getCollaborationRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("requestedCollaborations.user", "-password")
      .populate(
        "requestedCollaborations.project",
        "title abstract researchField status progress owner"
      )
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

// GET SENT PROJECT COLLABORATION REQUESTS
export const getSentCollaborationRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("sentCollaborations.user", "-password")
      .populate(
        "sentCollaborations.project",
        "title abstract researchField status progress owner"
      )
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

// ACCEPT PROJECT COLLABORATION REQUEST
export const acceptCollaborationRequest = async (req, res) => {
  try {
    const { currentUserId, requesterUserId, projectId } = req.body;

    if (!currentUserId || !requesterUserId || !projectId) {
      return res.status(400).json({
        message: "currentUserId, requesterUserId, and projectId are required",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterUserId);
    const project = await Project.findById(projectId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        message: "Only the project owner can accept this collaboration request",
      });
    }

    const hasRequest = currentUser.requestedCollaborations.some(
      (request) =>
        getRequestUserId(request) === requesterUserId.toString() &&
        getRequestProjectId(request) === projectId.toString()
    );

    if (!hasRequest) {
      return res.status(400).json({
        message: "Collaboration request not found",
      });
    }

    currentUser.requestedCollaborations =
      currentUser.requestedCollaborations.filter(
        (request) =>
          !(
            getRequestUserId(request) === requesterUserId.toString() &&
            getRequestProjectId(request) === projectId.toString()
          )
      );

    requesterUser.sentCollaborations =
      requesterUser.sentCollaborations.filter(
        (request) =>
          !(
            getRequestUserId(request) === currentUserId.toString() &&
            getRequestProjectId(request) === projectId.toString()
          )
      );

    await currentUser.save();
    await requesterUser.save();

    await Project.findByIdAndUpdate(projectId, {
      $addToSet: {
        collaborators: requesterUserId,
      },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: {
        collaborators: requesterUserId,
      },
    });

    await User.findByIdAndUpdate(requesterUserId, {
      $addToSet: {
        collaborators: currentUserId,
      },
    });

    const updatedProject = await Project.findById(projectId)
      .populate("owner", "username email profilePictureId")
      .populate("collaborators", "username email profilePictureId");

    await createNotification({
      recipient: requesterUserId,
      sender: currentUserId,
      title: "Project collaboration request accepted",
      message: `${currentUser.username} accepted your request to collaborate on "${project.title}".`,
      type: "collaboration",
      link: `/projects/${projectId}`,
    });

    res.status(200).json({
      message: "Collaboration request accepted successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REJECT PROJECT COLLABORATION REQUEST
export const rejectCollaborationRequest = async (req, res) => {
  try {
    const { currentUserId, requesterUserId, projectId } = req.body;

    if (!currentUserId || !requesterUserId || !projectId) {
      return res.status(400).json({
        message: "currentUserId, requesterUserId, and projectId are required",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterUserId);
    const project = await Project.findById(projectId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        message: "Only the project owner can reject this collaboration request",
      });
    }

    const hasRequest = currentUser.requestedCollaborations.some(
      (request) =>
        getRequestUserId(request) === requesterUserId.toString() &&
        getRequestProjectId(request) === projectId.toString()
    );

    if (!hasRequest) {
      return res.status(400).json({
        message: "Collaboration request not found",
      });
    }

    currentUser.requestedCollaborations =
      currentUser.requestedCollaborations.filter(
        (request) =>
          !(
            getRequestUserId(request) === requesterUserId.toString() &&
            getRequestProjectId(request) === projectId.toString()
          )
      );

    requesterUser.sentCollaborations =
      requesterUser.sentCollaborations.filter(
        (request) =>
          !(
            getRequestUserId(request) === currentUserId.toString() &&
            getRequestProjectId(request) === projectId.toString()
          )
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

// REMOVE EXISTING USER COLLABORATOR
export const removeCollaborator = async (req, res) => {
  try {
    const { currentUserId, collaboratorUserId } = req.body;

    if (!currentUserId || !collaboratorUserId) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }

    if (currentUserId === collaboratorUserId) {
      return res
        .status(400)
        .json({ message: "You cannot remove yourself as a collaborator" });
    }

    const currentUser = await User.findById(currentUserId);
    const collaboratorUser = await User.findById(collaboratorUserId);

    if (!currentUser || !collaboratorUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const areCollaborators = currentUser.collaborators.some(
      (id) => id.toString() === collaboratorUserId
    );

    if (!areCollaborators) {
      return res.status(400).json({
        message: "This user is not in your collaborators list",
      });
    }

    currentUser.collaborators = currentUser.collaborators.filter(
      (id) => id.toString() !== collaboratorUserId
    );

    collaboratorUser.collaborators = collaboratorUser.collaborators.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await collaboratorUser.save();

    res.status(200).json({
      message: "Collaborator removed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL SENT PROJECT COLLABORATION REQUEST
export const cancelSentCollaborationRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId, projectId } = req.body;

    if (!fromUserId || !toUserId || !projectId) {
      return res.status(400).json({
        message: "fromUserId, toUserId, and projectId are required",
      });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestExists = fromUser.sentCollaborations.some(
      (request) =>
        getRequestUserId(request) === toUserId.toString() &&
        getRequestProjectId(request) === projectId.toString()
    );

    if (!requestExists) {
      return res.status(400).json({
        message: "Sent collaboration request not found",
      });
    }

    fromUser.sentCollaborations = fromUser.sentCollaborations.filter(
      (request) =>
        !(
          getRequestUserId(request) === toUserId.toString() &&
          getRequestProjectId(request) === projectId.toString()
        )
    );

    toUser.requestedCollaborations = toUser.requestedCollaborations.filter(
      (request) =>
        !(
          getRequestUserId(request) === fromUserId.toString() &&
          getRequestProjectId(request) === projectId.toString()
        )
    );

    await fromUser.save();
    await toUser.save();

    res.status(200).json({
      message: "Collaboration request cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// REMOVE USER FROM PROJECT COLLABORATION
export const removeProjectCollaboration = async (req, res) => {
  try {
    const { currentUserId, projectId, collaboratorUserId } = req.body;

    if (!currentUserId || !projectId) {
      return res.status(400).json({
        message: "currentUserId and projectId are required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectOwnerId = project.owner.toString();

    // If owner removes someone, use collaboratorUserId.
    // If collaborator removes themselves, use currentUserId.
    const userToRemoveId =
      currentUserId.toString() === projectOwnerId
        ? collaboratorUserId
        : currentUserId;

    if (!userToRemoveId) {
      return res.status(400).json({
        message: "collaboratorUserId is required when owner removes a collaborator",
      });
    }

    const isOwner = currentUserId.toString() === projectOwnerId;

    const isCollaborator = project.collaborators.some(
      (id) => id.toString() === currentUserId.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        message: "Not authorized to remove this collaboration",
      });
    }

    const userExistsInProject = project.collaborators.some(
      (id) => id.toString() === userToRemoveId.toString()
    );

    if (!userExistsInProject) {
      return res.status(400).json({
        message: "This user is not a collaborator on this project",
      });
    }

    await Project.findByIdAndUpdate(projectId, {
      $pull: {
        collaborators: userToRemoveId,
      },
    });

    // Check if these two users still share another project.
    // If yes, keep them in each other's user-level collaborators.
    const remainingSharedProjects = await Project.countDocuments({
      owner: projectOwnerId,
      collaborators: userToRemoveId,
      _id: { $ne: projectId },
    });

    if (remainingSharedProjects === 0) {
      await User.findByIdAndUpdate(projectOwnerId, {
        $pull: {
          collaborators: userToRemoveId,
        },
      });

      await User.findByIdAndUpdate(userToRemoveId, {
        $pull: {
          collaborators: projectOwnerId,
        },
      });
    }

    const updatedProject = await Project.findById(projectId)
      .populate("owner", "username email profilePictureId")
      .populate("collaborators", "username email profilePictureId");

    res.status(200).json({
      message: "Collaboration removed successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SUGGESTED COLLABORATORS
export const getSuggestedCollaborators = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await User.findById(id)
      .populate("collaborators", "_id")
      .select("-password");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUserHasData =
      normalizeArray(currentUser.researchInterests).length > 0 ||
      normalizeArray(currentUser.skills).length > 0;

    if (!currentUserHasData) {
      return res.status(400).json({
        message: "Please add research interests or skills first.",
      });
    }

    const collaboratorIds = currentUser.collaborators.map((user) =>
      user._id.toString()
    );

    const candidates = await User.find({
      _id: {
        $ne: currentUser._id,
        $nin: collaboratorIds,
      },
    }).select("-password");

    const usableCandidates = candidates.filter((candidate) => {
      const hasInterests =
        normalizeArray(candidate.researchInterests).length > 0;
      const hasSkills = normalizeArray(candidate.skills).length > 0;
      return hasInterests || hasSkills;
    });

    if (usableCandidates.length === 0) {
      return res.status(200).json({
        message: "No suitable researchers found.",
        count: 0,
        matches: [],
      });
    }

    const topPool = usableCandidates.slice(0, 20);

    let aiMatches = [];
    try {
      aiMatches = await getSuggestedCollaboratorsFromHF(currentUser, topPool);
    } catch (error) {
      console.error("Hugging Face matching failed:", error.message);
    }

    let matches;

    if (aiMatches.length > 0) {
      matches = aiMatches
        .map((match) => {
          const candidate = topPool.find(
            (user) => user._id.toString() === String(match.id)
          );

          if (!candidate) return null;

          const summary = buildLocalCandidateSummary(currentUser, candidate);

          return {
            user: {
              id: summary.id,
              username: summary.username,
              email: summary.email,
              aboutMe: summary.aboutMe,
              researchInterests: summary.researchInterests,
              skills: summary.skills,
              relationshipStatus: summary.relationshipStatus,
              profilePictureId: summary.profilePictureId,
            },
            matchScore: Number(match.matchScore) || 0,
            reason: match.reason || "Good potential collaborator match.",
            sharedInterests: Array.isArray(match.sharedInterests)
              ? match.sharedInterests
              : summary.sharedInterests,
            sharedSkills: Array.isArray(match.sharedSkills)
              ? match.sharedSkills
              : summary.sharedSkills,
          };
        })
        .filter(Boolean)
        .filter(
          (m) => m.sharedInterests.length > 0 || m.sharedSkills.length > 0
        )
        .sort((a, b) => b.matchScore - a.matchScore);
    } else {
      matches = topPool
        .map((candidate) => {
          const summary = buildLocalCandidateSummary(currentUser, candidate);

          const score =
            summary.sharedInterests.length * 20 +
            summary.sharedSkills.length * 15;

          return {
            user: {
              id: summary.id,
              username: summary.username,
              email: summary.email,
              aboutMe: summary.aboutMe,
              researchInterests: summary.researchInterests,
              skills: summary.skills,
              relationshipStatus: summary.relationshipStatus,
              profilePictureId: summary.profilePictureId,
            },
            matchScore: Math.min(score, 100),
            reason: "Matched using shared research interests and skills.",
            sharedInterests: summary.sharedInterests,
            sharedSkills: summary.sharedSkills,
          };
        })
        .filter(
          (item) =>
            item.sharedInterests.length > 0 || item.sharedSkills.length > 0
        )
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8);
    }

    res.status(200).json({
      message: "Suggested collaborators fetched successfully",
      count: matches.length,
      matches,
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