import express from "express";
import {
  getDashboardStats,
  getAdminActivity,
  deleteAdminActivity,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  recordViolation,
  getUserViolations,
  updateViolation,
  deleteViolation,
  getAllViolations,
  getReports,
  getSavedReports,
  getSavedReportById,
  deleteSavedReport,
} from "../controllers/adminController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// Dashboard
router.get("/dashboard", authenticateAdmin, getDashboardStats);
router.get("/activity", authenticateAdmin, getAdminActivity); // Add missing activity endpoint
router.delete("/activity/:activityId", authenticateAdmin, deleteAdminActivity); // Delete activity endpoint

// User management
router.get("/users", authenticateAdmin, getAllUsers);
router.get("/users/:id", authenticateAdmin, getUserById);
router.put("/users/:id", authenticateAdmin, updateUser);
router.delete("/users/:id", authenticateAdmin, deleteUser);

// Violations management
router.post("/violations", authenticateAdmin, recordViolation);
router.get("/violations", authenticateAdmin, getAllViolations);
router.get("/violations/user/:userId", authenticateAdmin, getUserViolations);
router.put("/violations/:violationId", authenticateAdmin, updateViolation);
router.delete("/violations/:violationId", authenticateAdmin, deleteViolation);

// Seed test users
router.post("/seed-users", async (req, res) => {
  try {
    console.log("Seeding test users");

    // Create test users directly in the database
    const db = mongoose.connection.db;

    // Check if users collection exists, create it if not
    const collections = await db.listCollections({ name: "users" }).toArray();
    if (collections.length === 0) {
      console.log("Creating users collection");
      await db.createCollection("users");
    }

    // Insert test users
    const testUsers = [
      {
        fullName: "Test Admin",
        email: "admin@example.com",
        role: "admin",
        phone: "1234567890",
        address: "123 Admin St",
        createdAt: new Date(),
      },
      {
        fullName: "Test User",
        email: "user@example.com",
        role: "user",
        phone: "0987654321",
        address: "456 User Ave",
        createdAt: new Date(),
      },
      {
        fullName: "John Doe",
        email: "john@example.com",
        role: "user",
        phone: "5551234567",
        address: "789 Main St",
        createdAt: new Date(),
      },
    ];

    const result = await db.collection("users").insertMany(testUsers);
    console.log(`Created ${result.insertedCount} test users`);

    res.json({
      message: "Test users created successfully",
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("Error seeding test users:", error);
    res.status(500).json({
      message: "Error seeding test users",
      error: error.message,
    });
  }
});

// Reports
router.get("/reports", authenticateAdmin, getReports);
router.get("/saved-reports", authenticateAdmin, getSavedReports);
router.get("/saved-reports/:id", authenticateAdmin, getSavedReportById);
router.delete("/saved-reports/:id", authenticateAdmin, deleteSavedReport);

export default router;
