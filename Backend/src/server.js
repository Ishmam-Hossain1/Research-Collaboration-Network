
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import http from "http";
// import { Server } from "socket.io";
// import { connectDB } from "./config/db.js";
// import { initGridFS } from "./config/gridfs.js";

// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import projectRoutes from "./routes/projectRoutes.js";
// import datasetRoutes from "./routes/datasetRoutes.js";
// import fundingRoutes from "./routes/fundingRoutes.js";
// import resourceRoutes from "./routes/resourceRoutes.js";
// import feedbackRoutes from "./routes/feedbackRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";
// import milestoneRoutes from "./routes/milestoneRoutes.js";
// import conferenceRoutes from "./routes/conferenceRoutes.js";
// import googleCalendarRoutes from "./routes/googleCalendarRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import aiRoutes from "./routes/aiRoutes.js"; // ✅ NEW
// import grantApplicationRoutes from "./routes/grantApplicationRoutes.js";
// import equipmentRoutes from "./routes/equipmentRoutes.js";

// import { startReminderJob } from "./jobs/reminderJob.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// const server = http.createServer(app);

// export const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // Track online users
// const onlineUsers = new Map(); // userId -> Set of socketIds

// const emitOnlineUsers = () => {
//   io.emit("onlineUsers", Array.from(onlineUsers.keys()));
// };

// // Socket.IO connection
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join", (userId) => {
//     if (!userId) return;

//     socket.join(userId);

//     if (!onlineUsers.has(userId)) {
//       onlineUsers.set(userId, new Set());
//     }

//     onlineUsers.get(userId).add(socket.id);

//     console.log(`User ${userId} joined room ${userId}`);
//     emitOnlineUsers();
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);

//     for (const [userId, socketIds] of onlineUsers.entries()) {
//       if (socketIds.has(socket.id)) {
//         socketIds.delete(socket.id);

//         if (socketIds.size === 0) {
//           onlineUsers.delete(userId);
//         }

//         break;
//       }
//     }

//     emitOnlineUsers();
//   });
// });

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/datasets", datasetRoutes);
// app.use("/api/funding", fundingRoutes);
// app.use("/api/resources", resourceRoutes);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/milestones", milestoneRoutes);
// app.use("/api/conferences", conferenceRoutes);
// app.use("/api/google-calendar", googleCalendarRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/ai", aiRoutes); // ✅ NEW
// app.use("/api/grant-applications", grantApplicationRoutes);
// app.use("/api/equipment", equipmentRoutes);



// // Default route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Start server
// const startServer = async () => {
//   try {
//     await connectDB();
//     console.log("MongoDB connected successfully");

//     initGridFS();
//     startReminderJob();

//     server.listen(PORT, () => {
//       console.log(`Server started on PORT: ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Server startup failed:", error.message);
//     process.exit(1);
//   }
// };

// startServer();


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { initGridFS } from "./config/gridfs.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import fundingRoutes from "./routes/fundingRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import milestoneRoutes from "./routes/milestoneRoutes.js";
import conferenceRoutes from "./routes/conferenceRoutes.js";
import googleCalendarRoutes from "./routes/googleCalendarRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import grantApplicationRoutes from "./routes/grantApplicationRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";

import { startReminderJob } from "./jobs/reminderJob.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "http://localhost:5173"
    : /^http:\/\/localhost:(5173|5174|5175|5176|5177|5178|5179|5180|3000)$/;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Track online users
const onlineUsers = new Map();

const emitOnlineUsers = () => {
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;

    socket.join(userId);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    console.log(`User ${userId} joined room ${userId}`);
    emitOnlineUsers();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const [userId, socketIds] of onlineUsers.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);

        if (socketIds.size === 0) {
          onlineUsers.delete(userId);
        }

        break;
      }
    }

    emitOnlineUsers();
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/funding", fundingRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/conferences", conferenceRoutes);
app.use("/api/google-calendar", googleCalendarRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/grant-applications", grantApplicationRoutes);
app.use("/api/equipment", equipmentRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const initializeApp = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    initGridFS();

    if (!process.env.VERCEL) {
      startReminderJob();

      server.listen(PORT, () => {
        console.log(`Server started on PORT: ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
};

initializeApp();

export default app;