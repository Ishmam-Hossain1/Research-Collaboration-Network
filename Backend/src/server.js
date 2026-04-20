
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

// import feedbackRoutes from "./routes/feedbackRoutes.js";


// import chatRoutes from "./routes/chatRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";

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

// // Connect to database
// connectDB();

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

// app.use("/api/feedback", feedbackRoutes);

// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);


// // Default route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server started on PORT: ${PORT}`);
// });
// const startServer = async () => {
//   try {
//     await connectDB();
//     console.log("MongoDB connected successfully");
//     initGridFS();
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
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import milestoneRoutes from "./routes/milestoneRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Track online users
const onlineUsers = new Map(); // userId -> Set of socketIds

const emitOnlineUsers = () => {
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
};

// Socket.IO connection
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
app.use("/api/feedback", feedbackRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/milestones", milestoneRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    initGridFS();

    server.listen(PORT, () => {
      console.log(`Server started on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();