import express from "express";
import {
  getUserNotifications,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  createNotification,
  deleteNotification,
  getUnreadCount,
  addSampleNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications for a user
router.get("/user/:userId", getUserNotifications);

// Get unread notification count for a user
router.get("/user/:userId/unread-count", getUnreadCount);

// Mark a specific notification as seen
router.patch("/:notificationId/seen", markNotificationAsSeen);

// Mark all notifications as seen for a user
router.patch("/user/:userId/mark-all-seen", markAllNotificationsAsSeen);

// Create a new notification
router.post("/", createNotification);

// Delete a notification
router.delete("/:notificationId", deleteNotification);

// Add sample notifications for testing
router.post("/user/:userId/sample", addSampleNotifications);

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Notification routes are working!",
    timestamp: new Date().toISOString()
  });
});

export default router;
