
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { connectDB } from "./config/db.js";


// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// connectDB();

// // Default route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server started on PORT: ${PORT}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import { initGridFS } from "./config/gridfs.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    console.log("MongoDB connected successfully");

    // Initialize GridFS AFTER connection
    initGridFS();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server started on PORT: ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();