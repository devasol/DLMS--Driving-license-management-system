import express from "express";
import {
  checkPaymentEligibility,
  submitPayment,
  getUserPaymentStatus,
  getPendingPayments,
  getAllPayments,
  verifyPaymentAndIssueLicense,
  rejectPayment,
  deletePayment,
  updatePaymentStatus,
  getUserLicense,
  getAllLicenses,
  checkLicenseEligibility,
  issueLicense,
  downloadLicense,
  upload,
} from "../controllers/paymentController.js";

const router = express.Router();

// Payment routes
router.get("/eligibility/:userId", checkPaymentEligibility);
router.post("/submit", upload.single("receipt"), submitPayment);
router.get("/status/:userId", getUserPaymentStatus);

// Admin payment management routes
router.get("/pending", getPendingPayments);
router.get("/all", getAllPayments);
router.put("/verify/:paymentId", verifyPaymentAndIssueLicense);
router.put("/reject/:paymentId", rejectPayment);
router.delete("/delete/:paymentId", deletePayment);
router.put("/update-status/:paymentId", updatePaymentStatus);

// License routes
router.get("/license/eligibility/:userId", checkLicenseEligibility);
router.post("/license/issue/:paymentId", issueLicense);
router.get("/license/:userId", getUserLicense);
router.get("/license/download/:userId", downloadLicense);
router.get("/licenses", getAllLicenses);

export default router;
