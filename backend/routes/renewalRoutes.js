import express from "express";
import {
  submitRenewalApplication,
  getUserRenewalApplications,
  getAllRenewalApplications,
  getPendingRenewalApplications,
  updateRenewalStatus,
  issueRenewedLicense,
} from "../controllers/renewalController.js";
import { uploadAny } from "../middleware/upload.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Renewal routes are working" });
});

// User routes
router.post("/submit", uploadAny, submitRenewalApplication);
router.get("/user/:userId", getUserRenewalApplications);

// Document serving route
router.get("/documents/:filename", (req, res) => {
  const { filename } = req.params;
  const path = require("path");
  const fs = require("fs");

  const filePath = path.join(process.cwd(), "uploads", "documents", filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Document not found" });
  }

  res.sendFile(filePath);
});

// Admin routes
router.get("/admin/all", getAllRenewalApplications);
router.get("/admin/pending", getPendingRenewalApplications);
router.patch("/admin/:renewalId/status", updateRenewalStatus);
router.post("/admin/:renewalId/issue", issueRenewedLicense);

export default router;
