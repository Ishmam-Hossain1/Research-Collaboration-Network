// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";


// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 6000;

// // Connect to MongoDB
// connectDB()
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => {
//     console.error("MongoDB connection failed:", err.message);
//     process.exit(1);
//   });





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
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

connectDB();

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});
