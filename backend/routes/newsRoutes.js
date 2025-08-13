import express from "express";
import {
  getPublishedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getAllNewsAdmin,
  toggleLikeNews,
  addComment,
  getNewsStats,
} from "../controllers/newsController.js";
import { uploadNewsImage } from "../middleware/upload.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/published", getPublishedNews);
router.get("/stats", getNewsStats);
router.get("/:id", getNewsById);

// User routes (authentication required)
router.post("/:id/like", authenticateUser, toggleLikeNews);
router.post("/:id/comment", authenticateUser, addComment);

// Admin routes (authentication required)
router.get("/admin/all", authenticateUser, getAllNewsAdmin);
router.post("/admin/create", authenticateUser, uploadNewsImage, createNews);
router.put("/admin/:id", authenticateUser, uploadNewsImage, updateNews);
router.delete("/admin/:id", authenticateUser, deleteNews);

// Test route
router.get("/test/connection", (req, res) => {
  res.json({
    success: true,
    message: "News routes are working!",
    timestamp: new Date().toISOString(),
  });
});

export default router;
