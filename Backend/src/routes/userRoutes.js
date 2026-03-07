import express from "express";
import User from "../models/User.js";

const router = express.Router();

// CREATE USER
router.post("/", async (req, res) => {
  try {
    const { username, email, password, researchInterests } = req.body;

    const newUser = new User({
      username,
      email,
      password,
      researchInterests,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error.message
    });
  }
});

export default router;