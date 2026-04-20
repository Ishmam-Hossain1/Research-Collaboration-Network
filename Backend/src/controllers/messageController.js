import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { io } from "../server.js";

// @desc Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, receiverId, text } = req.body;

    if (!chatId || !senderId || !receiverId || !text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create message
    const newMessage = await Message.create({
      chatId,
      senderId,
      receiverId,
      text,
    });

    // Add message to chat
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messageList: newMessage._id },
    });

    // Populate sender info (optional but useful)
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "username profilePictureId")
      .populate("receiverId", "username profilePictureId");

    // 🔥 Emit message to receiver in real-time
    io.to(receiverId.toString()).emit("receiveMessage", populatedMessage);

    // Also emit back to sender (optional but ensures sync)
    io.to(senderId.toString()).emit("receiveMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Get all messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate("senderId", "username profilePictureId")
      .populate("receiverId", "username profilePictureId");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};