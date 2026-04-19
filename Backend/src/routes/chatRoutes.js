// import express from "express";
// import { createChat, getMyChats } from "../controllers/chatController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Get chats of logged in user
// router.get("/my-chats", protect, getMyChats);

// // Create chat or get existing
// router.post("/", createChat);

// export default router;


import express from "express";
import {
  createChat,
  getMyChats,
  markChatAsSeen,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get chats of logged-in user
router.get("/my-chats", protect, getMyChats);

// Create chat or get existing
router.post("/", createChat);

// Mark a chat as seen
router.patch("/:chatId/seen", protect, markChatAsSeen);

export default router;