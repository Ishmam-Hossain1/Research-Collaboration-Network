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
router.delete("/:id", protect, deleteProject);

export default router;