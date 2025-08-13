import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { uploadProfilePicture } from "../middleware/upload.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all users from database");

    // Try to use the User model first
    let users = [];
    try {
      users = await User.find({})
        .select("-password -user_password") // Exclude password fields
        .sort({ createdAt: -1 });

      console.log(`Found ${users.length} users using User model`);
    } catch (modelError) {
      console.error("Error using User model:", modelError);
    }

    // If model approach returns few or no users, try direct collection access
    if (users.length < 2) {
      try {
        const db = mongoose.connection.db;
        const collectionUsers = await db.collection("users").find({}).toArray();
        console.log(
          `Found ${collectionUsers.length} users using direct collection access`
        );

        // If we found more users with direct access, use those instead
        if (collectionUsers.length > users.length) {
          users = collectionUsers;
        }
      } catch (collectionError) {
        console.error("Error using direct collection access:", collectionError);
      }
    }

    // Map the response to a consistent format
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      fullName: user.fullName || user.full_name || user.user_name || "Unknown",
      email: user.email || user.user_email || "No Email",
      role: user.role || (user.isAdmin ? "admin" : "user"),
      phone: user.phone || user.contact_no || "No Phone",
      address: user.address || "No Address",
      dateOfBirth: user.dateOfBirth || user.dob || null,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt || user.created_at || new Date(),
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching user with ID: ${id}`);

    let user;
    try {
      user = await User.findById(id).select("-password -user_password");
    } catch (modelError) {
      console.error("Error using User model:", modelError);

      // If model approach fails, try direct collection access
      try {
        const db = mongoose.connection.db;
        user = await db.collection("users").findOne({
          _id: new mongoose.Types.ObjectId(id),
        });
      } catch (collectionError) {
        console.error("Error using direct collection access:", collectionError);
      }
    }

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Format user data
    const formattedUser = {
      _id: user._id,
      fullName: user.fullName || user.full_name || user.user_name,
      email: user.email || user.user_email,
      role: user.role || (user.isAdmin ? "admin" : "user"),
      phone: user.phone || user.contact_no,
      address: user.address,
      dateOfBirth: user.dateOfBirth || user.dob,
      nationality: user.nationality || "Ethiopian",
      bloodType: user.bloodType || user.blood_group || null,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt || user.created_at,
    };

    res.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
});

// Change user password
router.put("/change-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password || user.user_password
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updateData = {
      password: hashedNewPassword,
      user_password: hashedNewPassword,
    };

    await User.findByIdAndUpdate(id, updateData);

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log(`Updating user with ID: ${id}`);
    console.log("Update data:", updates);

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.user_password;

    let updatedUser;
    try {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select("-password -user_password");
    } catch (modelError) {
      console.error("Error using User model for update:", modelError);

      // If model approach fails, try direct collection access
      try {
        const db = mongoose.connection.db;
        await db
          .collection("users")
          .updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updates }
          );

        // Fetch the updated user
        updatedUser = await db.collection("users").findOne({
          _id: new mongoose.Types.ObjectId(id),
        });
      } catch (collectionError) {
        console.error(
          "Error using direct collection access for update:",
          collectionError
        );
        return res.status(500).json({
          message: "Error updating user",
          error: collectionError.message,
        });
      }
    }

    if (!updatedUser) {
      console.log("User not found for update");
      return res.status(404).json({ message: "User not found" });
    }

    // Format the response
    const formattedUser = {
      _id: updatedUser._id,
      fullName:
        updatedUser.fullName || updatedUser.full_name || updatedUser.user_name,
      email: updatedUser.email || updatedUser.user_email,
      role: updatedUser.role || (updatedUser.isAdmin ? "admin" : "user"),
      phone: updatedUser.phone || updatedUser.contact_no,
      address: updatedUser.address,
      dateOfBirth: updatedUser.dateOfBirth || updatedUser.dob,
      nationality: updatedUser.nationality || "Ethiopian",
      bloodType: updatedUser.bloodType || updatedUser.blood_group || null,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt || updatedUser.created_at,
    };

    console.log("User updated successfully");
    res.json(formattedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting user with ID: ${id}`);

    let result;
    try {
      result = await User.findByIdAndDelete(id);
    } catch (modelError) {
      console.error("Error using User model for deletion:", modelError);

      // If model approach fails, try direct collection access
      try {
        const db = mongoose.connection.db;
        result = await db.collection("users").deleteOne({
          _id: new mongoose.Types.ObjectId(id),
        });
      } catch (collectionError) {
        console.error(
          "Error using direct collection access for deletion:",
          collectionError
        );
        return res.status(500).json({
          message: "Error deleting user",
          error: collectionError.message,
        });
      }
    }

    if (!result) {
      console.log("User not found for deletion");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User deleted successfully");
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
});

// Upload profile picture
router.post("/:id/profile-picture", uploadProfilePicture, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Uploading profile picture for user: ${id}`);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("Uploaded file:", req.file);

    // Update user with new profile picture filename
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilePicture: req.file.filename },
      { new: true }
    ).select("-password -user_password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Profile picture updated successfully");

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: req.file.filename,
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName || updatedUser.full_name,
        email: updatedUser.email || updatedUser.user_email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
});

// Serve profile pictures
router.get("/profile-picture/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const profilePicturesDir = path.join(
      __dirname,
      "../uploads/profile-pictures"
    );
    const filePath = path.join(profilePicturesDir, filename);

    console.log("Serving profile picture:", filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Profile picture not found",
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg";

    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error serving profile picture",
      error: error.message,
    });
  }
});

// Serve profile pictures
router.get("/profile-picture/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "profile-pictures",
      filename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Profile picture not found",
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error serving profile picture",
      error: error.message,
    });
  }
});

export default router;
