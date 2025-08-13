// auth.js (Backend route for user login)
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // Import your User model

const router = express.Router();

// POST /api/users/login
router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ user_email: email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare entered password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.user_password);
    
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // If login is successful, return user data or a success message
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
