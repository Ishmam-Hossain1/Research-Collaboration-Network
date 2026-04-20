// import mongoose from "mongoose";
// import Chat from "../models/Chat.js";

// // CREATE CHAT OR RETURN EXISTING CHAT
// export const createChat = async (req, res) => {
//   try {
//     const { senderId, receiverId } = req.body;

//     if (!senderId || !receiverId) {
//       return res
//         .status(400)
//         .json({ message: "senderId and receiverId are required" });
//     }

//     if (
//       !mongoose.Types.ObjectId.isValid(senderId) ||
//       !mongoose.Types.ObjectId.isValid(receiverId)
//     ) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     if (senderId === receiverId) {
//       return res
//         .status(400)
//         .json({ message: "You cannot create a chat with yourself" });
//     }

//     const existingChat = await Chat.findOne({
//       members: { $all: [senderId, receiverId], $size: 2 },
//     })
//       .populate("members", "username email profilePictureId")
//       .populate({
//         path: "messageList",
//         options: { sort: { createdAt: 1 } },
//       });

//     if (existingChat) {
//       return res.status(200).json(existingChat);
//     }

//     const newChat = await Chat.create({
//       members: [senderId, receiverId],
//       messageList: [],
//     });

//     const populatedChat = await Chat.findById(newChat._id)
//       .populate("members", "username email profilePictureId")
//       .populate({
//         path: "messageList",
//         options: { sort: { createdAt: 1 } },
//       });

//     res.status(201).json({
//       message: "Chat created successfully",
//       chat: populatedChat,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // GET CHATS OF LOGGED-IN USER USING JWT
// export const getMyChats = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const chats = await Chat.find({
//       members: userId,
//     })
//       .populate("members", "username email profilePictureId")
//       .populate({
//         path: "messageList",
//         options: { sort: { createdAt: 1 } },
//       })
//       .sort({ updatedAt: -1 });

//     const formattedChats = chats.map((chat) => {
//       const otherUser = chat.members.find(
//         (member) => member._id.toString() !== userId.toString()
//       );

//       const lastMessage =
//         chat.messageList.length > 0
//           ? chat.messageList[chat.messageList.length - 1]
//           : null;

//       return {
//         _id: chat._id,
//         members: chat.members,
//         messageList: chat.messageList,
//         createdAt: chat.createdAt,
//         updatedAt: chat.updatedAt,
//         otherUser: otherUser || null,
//         lastMessageText: lastMessage?.text || "No messages yet",
//         lastMessageAt: lastMessage?.createdAt || null,
//       };
//     });

//     res.status(200).json(formattedChats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



import mongoose from "mongoose";
import Chat from "../models/Chat.js";

// CREATE CHAT OR RETURN EXISTING CHAT
export const createChat = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "senderId and receiverId are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot create a chat with yourself" });
    }

    const existingChat = await Chat.findOne({
      members: { $all: [senderId, receiverId], $size: 2 },
    })
      .populate("members", "username email profilePictureId")
      .populate({
        path: "messageList",
        options: { sort: { createdAt: 1 } },
      });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await Chat.create({
      members: [senderId, receiverId],
      messageList: [],
      seenBy: [
        { user: senderId, lastSeenAt: null },
        { user: receiverId, lastSeenAt: null },
      ],
    });

    const populatedChat = await Chat.findById(newChat._id)
      .populate("members", "username email profilePictureId")
      .populate({
        path: "messageList",
        options: { sort: { createdAt: 1 } },
      });

    res.status(201).json({
      message: "Chat created successfully",
      chat: populatedChat,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CHATS OF LOGGED-IN USER USING JWT
export const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      members: userId,
    })
      .populate("members", "username email profilePictureId")
      .populate({
        path: "messageList",
        options: { sort: { createdAt: 1 } },
      })
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map((chat) => {
      const otherUser = chat.members.find(
        (member) => member._id.toString() !== userId.toString()
      );

      const lastMessage =
        chat.messageList.length > 0
          ? chat.messageList[chat.messageList.length - 1]
          : null;

      const seenEntry = chat.seenBy?.find(
        (entry) => entry.user.toString() === userId.toString()
      );

      const lastSeenAt = seenEntry?.lastSeenAt || null;

      const isUnseen =
        !!lastMessage &&
        (!lastSeenAt ||
          new Date(lastMessage.createdAt).getTime() >
            new Date(lastSeenAt).getTime());

      return {
        _id: chat._id,
        members: chat.members,
        messageList: chat.messageList,
        seenBy: chat.seenBy,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        otherUser: otherUser || null,
        lastMessageText: lastMessage?.text || "No messages yet",
        lastMessageAt: lastMessage?.createdAt || null,
        isUnseen,
      };
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK CHAT AS SEEN FOR LOGGED-IN USER
export const markChatAsSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isMember = chat.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    const seenIndex = chat.seenBy.findIndex(
      (entry) => entry.user.toString() === userId.toString()
    );

    if (seenIndex !== -1) {
      chat.seenBy[seenIndex].lastSeenAt = new Date();
    } else {
      chat.seenBy.push({
        user: userId,
        lastSeenAt: new Date(),
      });
    }

    await chat.save();

    res.status(200).json({
      message: "Chat marked as seen",
      seenBy: chat.seenBy,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};