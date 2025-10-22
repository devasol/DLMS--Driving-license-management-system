import express from "express";
import * as licenseController from "../controllers/licenseController.js";
import { uploadAny } from "../middleware/upload.js";

const router = express.Router();

// Test route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "License routes are working" });
});

// Application routes
router.post("/applications", uploadAny, licenseController.submitApplication);
router.get("/applications/user/:userId", licenseController.getUserApplications);
router.get("/applications/:applicationId", licenseController.getApplication);
router.delete(
  "/applications/:applicationId",
  licenseController.deleteApplication
);

// Document serving route
router.get("/documents/:filename", licenseController.serveDocument);

// Admin routes
router.get("/admin/applications", licenseController.getAllApplications);
router.get(
  "/admin/applications/pending",
  licenseController.getPendingApplications
);
router.get(
  "/admin/applications/:applicationId",
  licenseController.getApplicationDetails
);
router.patch(
  "/admin/applications/:applicationId/status",
  licenseController.updateApplicationStatus
);
router.patch(
  "/admin/applications/:applicationId/review",
  licenseController.markApplicationUnderReview
);
router.delete(
  "/admin/applications/:applicationId",
  licenseController.deleteApplication
);
router.put(
  "/admin/applications/:applicationId",
  licenseController.updateApplication
);

// Debug route
router.get("/admin/debug/collections", licenseController.listCollections);

// Debug license data route - removed duplicate, using controller version below

// License status routes
router.get("/status", licenseController.getLicenseStatus);
router.get("/status-new", licenseController.getLicenseStatus); // Temporary route for testing
router.get("/debug/user/:userId", licenseController.debugUserLicense); // Debug endpoint

// Direct database query route (bypasses controller issues)
router.get("/status-direct", async (req, res) => {
  try {
    const { userId, userEmail } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        hasLicense: false,
      });
    }

    console.log(`🔍 Direct query for license status - userId: ${userId}`);

    // Import models directly
    const License = (await import("../models/License.js")).default;
    const mongoose = (await import("mongoose")).default;

    // Try multiple search methods
    let license = null;

    // Method 1: Direct search
    license = await License.findOne({ userId: userId });
    console.log(
      `Direct search result: ${license ? license.number : "Not found"}`
    );

    // Method 2: ObjectId conversion
    if (!license && mongoose.Types.ObjectId.isValid(userId)) {
      license = await License.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
      console.log(
        `ObjectId search result: ${license ? license.number : "Not found"}`
      );
    }

    // Method 3: String conversion
    if (!license) {
      license = await License.findOne({ userId: userId.toString() });
      console.log(
        `String search result: ${license ? license.number : "Not found"}`
      );
    }

    if (!license) {
      console.log(`❌ No license found for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: "No license found for this user",
        hasLicense: false,
      });
    }

    console.log(
      `✅ License found: ${license.number} for user ${license.userName}`
    );

    // Format response
    const currentDate = new Date();
    const expiryDate = new Date(license.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    };

    const licenseData = {
      success: true,
      hasLicense: true,
      number: license.number,
      userName: license.userName,
      userEmail: license.userEmail,
      class: license.class,
      issueDate: formatDate(license.issueDate),
      expiryDate: formatDate(license.expiryDate),
      status: license.status,
      restrictions: license.restrictions || "None",
      points: license.points || 0,
      maxPoints: license.maxPoints || 12,
      daysUntilExpiry: daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 90 && daysUntilExpiry > 0,
      isExpired: daysUntilExpiry <= 0,
    };

    console.log(`✅ Returning license data:`, licenseData);
    res.json(licenseData);
  } catch (error) {
    console.error("❌ Direct status query error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching license status",
      hasLicense: false,
      error: error.message,
    });
  }
});
router.get(
  "/application/status/:userId",
  licenseController.getApplicationStatus
);

// License verification route (for QR code scanning)
router.get("/verify/:licenseNumber", licenseController.verifyLicense);

// User violations route (for user dashboard)
router.get("/violations/user/:userId", licenseController.getUserViolations);

export default router;
