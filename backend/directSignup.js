import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5002; // Use a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Direct signup server is working" });
});

// Direct signup route
app.post("/signup", async (req, res) => {
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

    console.log("Received signup request for:", user_email);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get User model
    const userSchema = new mongoose.Schema({
      full_name: String,
      user_email: { type: String, unique: true },
      user_name: String,
      user_password: String,
      gender: String,
      contact_no: String,
      nic: String,
    });
    
    // Check if model already exists to avoid overwrite warning
    const User = mongoose.models.User || mongoose.model("User", userSchema);
    
    // Check if user exists
    const existingUser = await User.findOne({ user_email: user_email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);
    
    // Create new user
    const newUser = new User({
      full_name,
      user_email: user_email.toLowerCase(),
      user_name,
      user_password: hashedPassword,
      gender,
      contact_no,
      nic,
    });
    
    // Save user
    await newUser.save();
    
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        full_name: newUser.full_name,
        user_email: newUser.user_email,
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Error during signup", 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Direct signup server running on port ${PORT}`);
  console.log(`Test at: http://localhost:${PORT}/test`);
  console.log(`Signup endpoint: http://localhost:${PORT}/signup`);
});