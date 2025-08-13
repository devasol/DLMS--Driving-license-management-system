import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "simple-signup-server",
    port: PORT,
  });
});

// Signup endpoint
app.post("/signup", async (req, res) => {
  try {
    console.log("Received signup request:", req.body);

    const {
      full_name,
      user_email,
      user_name,
      user_password,
      contact_no,
      gender,
      nic,
    } = req.body;

    // Validate required fields
    if (!full_name || !user_email || !user_password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ user_email }, { email: user_email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_password, salt);

    // Create new user
    const newUser = {
      fullName: full_name,
      email: user_email,
      user_email,
      user_name,
      password: hashedPassword,
      user_password: hashedPassword,
      contact_no,
      phone: contact_no,
      gender,
      nic,
      role: "user",
      isAdmin: false,
      createdAt: new Date(),
    };

    // Insert user into database
    const result = await db.collection("users").insertOne(newUser);

    console.log("User created successfully:", result.insertedId);

    // Return success response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: result.insertedId,
        full_name,
        user_email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Error during signup",
      error: error.message,
    });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    console.log("Received login request");

    // Extract credentials
    const { email, password, isAdmin } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    console.log(`Processing ${isAdmin ? "admin" : "user"} login for: ${email}`);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Find user in the database
    const normalizedEmail = email.toLowerCase();
    let user = null;

    // Try to find user in users collection
    user = await db.collection("users").findOne({
      $or: [{ email: normalizedEmail }, { user_email: normalizedEmail }],
    });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("User found:", user.full_name || user.fullName);

    // Get password field (handle different field names)
    const storedPassword = user.password || user.user_password;

    if (!storedPassword) {
      console.error("No password field found in user document");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, storedPassword);

    if (!isMatch) {
      console.log("Password doesn't match");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Login successful");

    // Return success response with user data
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        full_name: user.full_name || user.fullName || user.name,
        user_email: user.user_email || user.email,
        type: isAdmin ? "admin" : "user",
      },
      token: "sample-token-for-testing", // In a real app, generate a JWT token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
});

// Add admin login endpoint to simple server
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Processing admin login for:", email);

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Try both "admin" and "admins" collections
    let admin = null;

    // First try "admins" collection
    try {
      admin = await db.collection("admins").findOne({ admin_email: email });
    } catch (err) {
      console.log("Error querying 'admins' collection:", err.message);
    }

    // If not found, try "admin" collection
    if (!admin) {
      try {
        admin = await db.collection("admin").findOne({ admin_email: email });
      } catch (err) {
        console.log("Error querying 'admin' collection:", err.message);
      }
    }

    // If still not found, try users collection with admin role
    if (!admin) {
      try {
        admin = await db.collection("users").findOne({
          $or: [
            { email: email, role: "admin" },
            { user_email: email, role: "admin" },
            { email: email, isAdmin: true },
            { user_email: email, isAdmin: true },
          ],
        });
      } catch (err) {
        console.log("Error querying users with admin role:", err.message);
      }
    }

    if (!admin) {
      console.log("Admin not found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password field - handle different field names
    const passwordField =
      admin.admin_password || admin.password || admin.user_password;
    if (!passwordField) {
      console.error("Admin password field is undefined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, passwordField);
    if (!isMatch) {
      console.log("Password doesn't match for admin");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Admin password verified");

    // Return success with admin info
    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: admin._id.toString(),
        admin_name:
          admin.admin_name ||
          admin.admin_username ||
          admin.fullName ||
          admin.full_name,
        admin_email: admin.admin_email || admin.email || admin.user_email,
        type: "admin",
      },
    });
  } catch (adminError) {
    console.error("Admin login error:", adminError);
    return res.status(500).json({
      message: "Error during admin login. Please try again.",
      error: adminError.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple signup server running on port ${PORT}`);
});

// Handle process signals for clean shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down simple server gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down simple server gracefully");
  process.exit(0);
});
