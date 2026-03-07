import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { username, email, password, researchInterests } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      researchInterests
    });

    res.status(201).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};