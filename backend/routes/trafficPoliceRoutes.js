import express from "express";
import {
  getLicenseByNumber,
  recordViolation,
  getMyViolationRecords,
  getDashboardStats,
  searchLicenses,
} from "../controllers/trafficPoliceController.js";
import { authenticateTrafficPolice } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Traffic Police routes are working" });
});

// License search and information routes
router.get("/license/:licenseNumber", authenticateTrafficPolice, getLicenseByNumber);
router.get("/search", authenticateTrafficPolice, searchLicenses);

// Violation management routes
router.post("/violations", authenticateTrafficPolice, recordViolation);
router.get("/violations/my-records", authenticateTrafficPolice, getMyViolationRecords);

// Dashboard and statistics routes
router.get("/dashboard/stats", authenticateTrafficPolice, getDashboardStats);

export default router;
