import express from "express";
import { askAIChatbot } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protect, askAIChatbot);

export default router;