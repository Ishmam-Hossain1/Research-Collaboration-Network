import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

// Send a message
router.post("/", sendMessage);

// Get all messages of a chat
router.get("/:chatId", getMessages);

export default router;