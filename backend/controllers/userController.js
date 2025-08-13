import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signupUser = async (req, res) => {
  try {
    const {
      full_name,
      user_email,
      user_name,
      user_password,
      gender,
      contact_no,
      nic,
    } = req.body;

    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);

    const newUser = new User({
      full_name,
      user_email,
      user_name,
      user_password: hashedPassword,
      gender,
      contact_no,
      nic,
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
