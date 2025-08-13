import express from "express";
import {
  getUserActivities,
  getUserActivityStats,
  createUserActivity,
  getUserHistory,
} from "../controllers/userActivityController.js";

const router = express.Router();

// Get user activities with filtering and pagination
// GET /api/user-activity/:userId/activities?page=1&limit=20&activityType=exam_schedule&startDate=2024-01-01
router.get("/:userId/activities", getUserActivities);

// Get user activity statistics
// GET /api/user-activity/:userId/stats
router.get("/:userId/stats", getUserActivityStats);

// Get comprehensive user history
// GET /api/user-activity/:userId/history?page=1&limit=20
router.get("/:userId/history", getUserHistory);

// Create a new user activity (for manual logging)
// POST /api/user-activity/create
router.post("/create", createUserActivity);

export default router;
