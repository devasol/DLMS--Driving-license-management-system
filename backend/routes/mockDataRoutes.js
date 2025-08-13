import express from "express";
const router = express.Router();

// Mock data routes for development
router.get("/users", (req, res) => {
  res.json([
    { id: 1, name: "Test User 1", email: "user1@example.com" },
    { id: 2, name: "Test User 2", email: "user2@example.com" },
  ]);
});

export default router;
