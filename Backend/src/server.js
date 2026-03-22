<<<<<<< HEAD

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

=======
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { initGridFS } from "./config/gridfs.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import fundingRoutes from "./routes/fundingRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
>>>>>>> e724797 (feedback on project)

dotenv.config();

const app = express();
<<<<<<< HEAD
const PORT = process.env.PORT || 6000;
=======
const PORT = process.env.PORT || 5000;
>>>>>>> e724797 (feedback on project)

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
connectDB();
=======
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/funding", fundingRoutes);
app.use("/api/feedback", feedbackRoutes);
>>>>>>> e724797 (feedback on project)

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

<<<<<<< HEAD
// Start server
app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});
=======
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    initGridFS();

    app.listen(PORT, () => {
      console.log(`Server started on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
>>>>>>> e724797 (feedback on project)
