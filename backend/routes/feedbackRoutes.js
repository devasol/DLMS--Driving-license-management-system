import express from "express";
import {
  getFeedbacks,
  createFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
} from "../controllers/feedbackController.js";

const router = express.Router();

// Get all feedbacks
router.get("/", getFeedbacks);

// Create a new feedback
router.post("/", createFeedback);

// Update feedback status
router.put("/:id", updateFeedbackStatus);

// Get feedback statistics
router.get("/stats", getFeedbackStats);

export default router;
