import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  getProjectsByUser,
  getMyProjects,
  updateProject,
  deleteProject,
  getProjectStatsByUser,
  getMyProjectStats,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", getAllProjects);
router.get("/my", protect, getMyProjects);
router.get("/my/stats", protect, getMyProjectStats);
router.get("/user/:userId", getProjectsByUser);
router.get("/user/:userId/stats", getProjectStatsByUser);
router.get("/:id", getProjectById);
router.put("/:id", protect, updateProject);
// CREATE PROJECT (logged-in user only)
router.post("/", protect, createProject);

// GET ALL PROJECTS
router.get("/", getAllProjects);

// GET MY PROJECTS
router.get("/my", protect, getMyProjects);

// GET MY PROJECT STATS
router.get("/my/stats", protect, getMyProjectStats);

// GET USER PROJECTS
router.get("/user/:userId", getProjectsByUser);

// GET USER PROJECT STATS
router.get("/user/:userId/stats", getProjectStatsByUser);

// GET SINGLE PROJECT
router.get("/:id", getProjectById);

// UPDATE PROJECT (only owner)
router.put("/:id", protect, updateProject);

// DELETE PROJECT (only owner)
router.delete("/:id", protect, deleteProject);

export default router;