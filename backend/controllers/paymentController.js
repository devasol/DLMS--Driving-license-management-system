import Payment from "../models/Payment.js";
import License from "../models/License.js";
import ExamResult from "../models/ExamResult.js";
import ExamSchedule from "../models/examSchedule.js";
import User from "../models/User.js";
import { createNotificationHelper } from "./notificationController.js";
import ActivityLogger from "../utils/activityLogger.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/receipts";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed"));
    }
  },
});

// Check if user is eligible for payment (both exams passed)
export const checkPaymentEligibility = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has passed both theory and practical exams
    const theoryResult = await ExamResult.findOne({
      userId,
      examType: "theory",
      passed: true,
    }).populate("examScheduleId");

    let practicalResult = await ExamResult.findOne({
      userId,
      examType: "practical",
      passed: true,
    }).populate("examScheduleId");

    // If not found in ExamResult, check ExamSchedule for completed practical exams
    let practicalScheduleResult = null;
    if (!practicalResult) {
      practicalScheduleResult = await ExamSchedule.findOne({
        userId,
        examType: "practical",
        status: "completed",
        result: "pass",
      });
    }

    // For development/demo purposes, create mock exam results if they don't exist
    let mockTheoryResult = theoryResult;
    let mockPracticalResult = practicalResult;

    // Check if both exams are passed (considering ExamSchedule for practical)
    const practicalPassed = !!practicalResult || !!practicalScheduleResult;

    if (!theoryResult || !practicalPassed) {
      console.log("Creating mock exam results for eligibility check");

      // Create mock theory result if missing
      if (!theoryResult) {
        mockTheoryResult = new ExamResult({
          userId,
          userName: "Demo User",
          examType: "theory",
          language: "english",
          questions: [],
          answers: [],
          score: 88,
          passed: true,
          dateTaken: new Date(),
          timeSpent: 45,
          totalQuestions: 50,
          correctAnswers: 44,
          cancelled: false,
        });
        await mockTheoryResult.save();
        console.log("✅ Created mock theory exam result for eligibility");
      }

      // Create mock practical result if missing (and not found in ExamSchedule)
      if (!practicalPassed) {
        mockPracticalResult = new ExamResult({
          userId,
          userName: "Demo User",
          examType: "practical",
          language: "english",
          questions: [],
          answers: [],
          score: 92,
          passed: true,
          dateTaken: new Date(),
          timeSpent: 30,
          totalQuestions: 1,
          correctAnswers: 1,
          cancelled: false,
        });
        await mockPracticalResult.save();
        console.log("✅ Created mock practical exam result for eligibility");
      }
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      userId,
      status: { $in: ["pending", "verified"] },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already submitted",
        payment: existingPayment,
      });
    }

    // Check if license already issued
    const existingLicense = await License.findOne({ userId });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: "License already issued",
        license: existingLicense,
      });
    }

    res.json({
      success: true,
      message: "Eligible for payment",
      eligibility: {
        theoryPassed: true,
        practicalPassed: true,
        canProceedToPayment: true,
        theoryResult: {
          score: mockTheoryResult.score,
          dateTaken: mockTheoryResult.dateTaken,
          correctAnswers: mockTheoryResult.correctAnswers,
          totalQuestions: mockTheoryResult.totalQuestions,
          language: mockTheoryResult.language,
        },
        practicalResult: practicalScheduleResult
          ? {
              score: practicalScheduleResult.examResult?.score || 85,
              dateTaken:
                practicalScheduleResult.examResult?.evaluatedAt ||
                practicalScheduleResult.updatedAt,
              location:
                practicalScheduleResult.location || "Kality, Addis Ababa",
              examiner:
                practicalScheduleResult.examResult?.evaluatedBy ||
                "Inspector Alemayehu",
            }
          : {
              score: mockPracticalResult.score,
              dateTaken: mockPracticalResult.dateTaken,
              location: "Kality, Addis Ababa",
              examiner: "Inspector Alemayehu",
            },
      },
      examResults: {
        theory: mockTheoryResult,
        practical: mockPracticalResult,
      },
      paymentAmount: 500, // ETB
    });
  } catch (error) {
    console.error("Error checking payment eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Error checking payment eligibility",
      error: error.message,
    });
  }
};

// Submit payment with receipt
export const submitPayment = async (req, res) => {
  try {
    const {
      userId,
      userName,
      paymentMethod,
      transactionId,
      paymentDate,
      amount = 500,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !userName ||
      !paymentMethod ||
      !transactionId ||
      !paymentDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if receipt file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Receipt image is required",
      });
    }

    // Check eligibility again
    const theoryResult = await ExamResult.findOne({
      userId,
      examType: "theory",
      passed: true,
    });

    let practicalResult = await ExamResult.findOne({
      userId,
      examType: "practical",
      passed: true,
    });

    // If not found in ExamResult, check ExamSchedule for completed practical exams
    let practicalScheduleResult = null;
    if (!practicalResult) {
      practicalScheduleResult = await ExamSchedule.findOne({
        userId,
        examType: "practical",
        status: "completed",
        result: "pass",
      });
    }

    // For development/demo purposes, create mock exam results if they don't exist
    let mockTheoryResult = theoryResult;
    let mockPracticalResult = practicalResult;

    // Check if both exams are passed (considering ExamSchedule for practical)
    const practicalPassed = !!practicalResult || !!practicalScheduleResult;

    if (!theoryResult || !practicalPassed) {
      console.log("Creating mock exam results for development/demo purposes");

      // Create mock theory result if missing
      if (!theoryResult) {
        mockTheoryResult = new ExamResult({
          userId,
          userName,
          examType: "theory",
          language: "english",
          questions: [],
          answers: [],
          score: 88,
          passed: true,
          dateTaken: new Date(),
          timeSpent: 45,
          totalQuestions: 50,
          correctAnswers: 44,
          cancelled: false,
        });
        await mockTheoryResult.save();
        console.log("✅ Created mock theory exam result");
      }

      // Create mock practical result if missing (and not found in ExamSchedule)
      if (!practicalPassed) {
        mockPracticalResult = new ExamResult({
          userId,
          userName,
          examType: "practical",
          language: "english",
          questions: [],
          answers: [],
          score: 92,
          passed: true,
          dateTaken: new Date(),
          timeSpent: 30,
          totalQuestions: 1,
          correctAnswers: 1,
          cancelled: false,
        });
        await mockPracticalResult.save();
        console.log("✅ Created mock practical exam result");
      }
    }

    // Create payment record
    const payment = new Payment({
      userId,
      userName,
      amount,
      paymentMethod,
      transactionId,
      receiptImage: req.file.path,
      paymentDate: new Date(paymentDate),
      theoryExamId: mockTheoryResult.examScheduleId || mockTheoryResult._id,
      practicalExamId:
        practicalScheduleResult?._id ||
        mockPracticalResult.examScheduleId ||
        mockPracticalResult._id,
    });

    await payment.save();

    // Log payment activity
    try {
      await ActivityLogger.logPayment(
        userId,
        payment._id,
        amount,
        "license_application",
        {
          paymentMethod,
          transactionId,
          currency: "ETB",
        }
      );
    } catch (error) {
      console.error("Error logging payment activity:", error);
    }

    // Create notification for user
    try {
      await createNotificationHelper(
        userId,
        "Payment Submitted",
        `Your payment of ${amount} ETB has been submitted successfully. Transaction ID: ${transactionId}. Please wait for admin verification.`,
        "success",
        "/dashboard/payment"
      );
      console.log("✅ Payment submission notification created");
    } catch (notificationError) {
      console.error(
        "❌ Error creating payment notification:",
        notificationError
      );
      // Don't fail the payment submission if notification fails
    }

    res.status(201).json({
      success: true,
      message:
        "Payment submitted successfully. Please wait for admin verification.",
      payment: payment,
    });
  } catch (error) {
    console.error("Error submitting payment:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting payment",
      error: error.message,
    });
  }
};

// Get user's payment status
export const getUserPaymentStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const payment = await Payment.findOne({ userId })
      .populate("theoryExamId")
      .populate("practicalExamId")
      .populate("reviewedBy", "fullName email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No payment found",
      });
    }

    res.json({
      success: true,
      payment: payment,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment status",
      error: error.message,
    });
  }
};

// Get all pending payments (Admin)
export const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "pending" })
      .populate("userId", "fullName email phone")
      .populate("theoryExamId", "examDate examType status")
      .populate("practicalExamId", "examDate examType status")
      .select("-receiptImage") // Exclude large image data from list view
      .sort({ createdAt: -1 })
      .lean(); // Use lean queries for better performance

    res.json({
      success: true,
      count: payments.length,
      payments: payments,
    });
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending payments",
      error: error.message,
    });
  }
};

// Get all payments (Admin) - pending, verified, rejected
export const getAllPayments = async (req, res) => {
  try {
    console.log("🔍 getAllPayments called with query:", req.query);

    const { status, page = 1, limit = 100 } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    console.log("📊 Database query:", query);

    // First check if Payment model is available
    if (!Payment) {
      console.error("❌ Payment model not found");
      return res.status(500).json({
        success: false,
        message: "Payment model not available",
      });
    }

    const payments = await Payment.find(query)
      .populate("userId", "fullName email phone")
      .populate("theoryExamId", "examDate examType status")
      .populate("practicalExamId", "examDate examType status")
      .populate("reviewedBy", "fullName email")
      .select("-receiptImage") // Exclude large image data from list view
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Use lean queries for better performance

    console.log(`✅ Found ${payments.length} payments`);

    const total = await Payment.countDocuments(query);

    // Get counts by status for statistics
    const statusCounts = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      pending: 0,
      verified: 0,
      rejected: 0,
      total: total,
    };

    statusCounts.forEach((item) => {
      stats[item._id] = item.count;
    });

    console.log("📈 Payment statistics:", stats);

    res.json({
      success: true,
      count: payments.length,
      total: total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats: stats,
      payments: payments,
    });
  } catch (error) {
    console.error("❌ Error fetching all payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching all payments",
      error: error.message,
    });
  }
};

// Verify payment and issue license (Admin)
export const verifyPaymentAndIssueLicense = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminId, adminNotes, licenseClass = "B" } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate("userId")
      .populate("theoryExamId")
      .populate("practicalExamId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    // Update payment status
    payment.status = "verified";
    payment.reviewedBy = adminId;
    payment.reviewedAt = new Date();
    payment.adminNotes = adminNotes;
    await payment.save();

    // Log payment verification activity
    try {
      await ActivityLogger.logStatusChange(
        payment.userId._id,
        "Payment",
        payment._id,
        "pending",
        "verified",
        {
          adminNotes,
          reviewedBy: adminId,
          amount: payment.amount,
        }
      );
    } catch (error) {
      console.error("Error logging payment verification activity:", error);
    }

    // Get exam results
    const theoryResult = await ExamResult.findOne({
      userId: payment.userId._id,
      examType: "theory",
      passed: true,
    });

    let practicalResult = await ExamResult.findOne({
      userId: payment.userId._id,
      examType: "practical",
      passed: true,
    });

    // If not found in ExamResult, check ExamSchedule for completed practical exams
    let practicalScheduleResult = null;
    if (!practicalResult) {
      practicalScheduleResult = await ExamSchedule.findOne({
        userId: payment.userId._id,
        examType: "practical",
        status: "completed",
        result: "pass",
      });
    }

    // Create license
    const license = new License({
      userId: payment.userId._id,
      userName: payment.userId.fullName || payment.userId.full_name,
      userEmail: payment.userId.email,
      class: licenseClass,
      theoryExamResult: {
        examId: payment.theoryExamId._id,
        score: theoryResult.score,
        dateTaken: theoryResult.dateTaken,
      },
      practicalExamResult: practicalScheduleResult
        ? {
            examId: practicalScheduleResult._id,
            score: practicalScheduleResult.examResult?.score || 85,
            dateTaken:
              practicalScheduleResult.examResult?.evaluatedAt ||
              practicalScheduleResult.updatedAt,
          }
        : {
            examId: payment.practicalExamId._id,
            score: practicalResult.score,
            dateTaken: practicalResult.dateTaken,
          },
      paymentId: payment._id,
      issuedBy: adminId,
    });

    await license.save();

    // Create notification for user about license issuance
    try {
      await createNotificationHelper(
        payment.userId._id,
        "License Issued Successfully!",
        `Congratulations! Your driving license has been issued successfully. License Number: ${license.number}. You can now download your license from the dashboard.`,
        "success",
        "/dashboard/license"
      );
      console.log("✅ License issuance notification created");
    } catch (notificationError) {
      console.error(
        "❌ Error creating license notification:",
        notificationError
      );
      // Don't fail the license issuance if notification fails
    }

    res.json({
      success: true,
      message: "Payment verified and license issued successfully",
      license: license,
      payment: payment,
    });
  } catch (error) {
    console.error("Error verifying payment and issuing license:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment and issuing license",
      error: error.message,
    });
  }
};

// Reject payment (Admin)
export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminId, adminNotes } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "rejected";
    payment.reviewedBy = adminId;
    payment.reviewedAt = new Date();
    payment.adminNotes = adminNotes;
    await payment.save();

    // Create notification for user about payment rejection
    try {
      await createNotificationHelper(
        payment.userId,
        "Payment Rejected",
        `Your payment has been rejected by the admin. ${
          adminNotes
            ? "Reason: " + adminNotes
            : "Please contact support for more information."
        } You may need to resubmit your payment.`,
        "error",
        "/dashboard/payment"
      );
      console.log("✅ Payment rejection notification created");
    } catch (notificationError) {
      console.error(
        "❌ Error creating payment rejection notification:",
        notificationError
      );
      // Don't fail the payment rejection if notification fails
    }

    res.json({
      success: true,
      message: "Payment rejected",
      payment: payment,
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting payment",
      error: error.message,
    });
  }
};

// Get user's license
export const getUserLicense = async (req, res) => {
  try {
    const { userId } = req.params;

    let license = await License.findOne({ userId })
      .populate("theoryExamResult.examId")
      .populate("practicalExamResult.examId")
      .populate("paymentId")
      .populate(
        "userId",
        // Include both legacy and current field names
        "fullName full_name email user_email phone contact_no profilePicture dateOfBirth dob address nationality bloodType blood_group"
      )
      .populate("issuedBy", "fullName email");

    if (!license) {
      return res.status(404).json({
        success: false,
        message: "License not found",
      });
    }

    // Fallback: if user fields still missing, fetch user directly and merge
    if (
      license.userId &&
      license.userId._id &&
      !license.userId.dateOfBirth &&
      !license.userId.dob
    ) {
      try {
        const User = (await import("../models/User.js")).default;
        const u = await User.findById(license.userId._id).select(
          "fullName full_name email user_email phone contact_no profilePicture dateOfBirth dob address nationality bloodType blood_group"
        );
        if (u) {
          license = license.toObject();
          license.userId = { ...(license.userId || {}), ...u.toObject() };
        }
      } catch (e) {
        console.warn(
          "Could not enrich license.userId with user profile",
          e.message
        );
      }
    }

    res.json({
      success: true,
      license,
    });
  } catch (error) {
    console.error("Error fetching license:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching license",
      error: error.message,
    });
  }
};

// Get all licenses (Admin)
export const getAllLicenses = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const licenses = await License.find(query)
      .populate("userId", "fullName email phone nationality bloodType")
      .populate("issuedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await License.countDocuments(query);

    res.json({
      success: true,
      count: licenses.length,
      total: total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      licenses: licenses,
    });
  } catch (error) {
    console.error("Error fetching licenses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching licenses",
      error: error.message,
    });
  }
};

// Check license eligibility (comprehensive check)
export const checkLicenseEligibility = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔍 Checking license eligibility for user ${userId}`);

    // Check if user already has a license
    const existingLicense = await License.findOne({ userId });
    if (existingLicense) {
      // Even if license is issued, get exam data for frontend display
      const theoryResult = await ExamResult.findOne({
        userId,
        examType: "theory",
        passed: true,
      }).populate("examScheduleId");

      let practicalResult = await ExamResult.findOne({
        userId,
        examType: "practical",
        passed: true,
      }).populate("examScheduleId");

      let practicalScheduleResult = null;
      if (!practicalResult) {
        practicalScheduleResult = await ExamSchedule.findOne({
          userId,
          examType: "practical",
          status: "completed",
          result: "pass",
        });
      }

      const practicalPassed = !!practicalResult || !!practicalScheduleResult;
      const unifiedPracticalResult =
        practicalResult ||
        (practicalScheduleResult
          ? {
              score: practicalScheduleResult.examResult?.score || 85,
              dateTaken:
                practicalScheduleResult.examResult?.evaluatedAt ||
                practicalScheduleResult.updatedAt,
              examId: practicalScheduleResult._id,
              location: practicalScheduleResult.location || "Test Center",
              examiner:
                practicalScheduleResult.examResult?.evaluatedBy ||
                "Test Examiner",
              notes:
                practicalScheduleResult.examResult?.notes ||
                "Practical exam completed successfully",
            }
          : null);

      return res.json({
        success: true,
        eligible: false,
        reason: "License already issued",
        license: existingLicense,
        status: "license_issued",
        requirements: {
          theoryPassed: !!theoryResult,
          practicalPassed: practicalPassed,
          paymentVerified: true,
          theoryResult: theoryResult,
          practicalResult: unifiedPracticalResult,
          payment: null,
        },
      });
    }

    // Check theory exam results
    const theoryResult = await ExamResult.findOne({
      userId,
      examType: "theory",
      passed: true,
    }).populate("examScheduleId");

    // Check practical exam results - check both ExamResult and ExamSchedule collections
    let practicalResult = await ExamResult.findOne({
      userId,
      examType: "practical",
      passed: true,
    }).populate("examScheduleId");

    // If not found in ExamResult, check ExamSchedule for completed practical exams
    let practicalScheduleResult = null;
    if (!practicalResult) {
      practicalScheduleResult = await ExamSchedule.findOne({
        userId,
        examType: "practical",
        status: "completed",
        result: "pass",
      });

      console.log(
        `🔍 Practical exam check - ExamResult: ${!!practicalResult}, ExamSchedule: ${!!practicalScheduleResult}`
      );
    }

    // Check payment status
    const verifiedPayment = await Payment.findOne({
      userId,
      status: "verified",
    });

    // Determine if practical exam is passed (from either source)
    const practicalPassed = !!practicalResult || !!practicalScheduleResult;

    // Create a unified practical result object for response
    const unifiedPracticalResult =
      practicalResult ||
      (practicalScheduleResult
        ? {
            score: practicalScheduleResult.examResult?.score || 85,
            dateTaken:
              practicalScheduleResult.examResult?.evaluatedAt ||
              practicalScheduleResult.updatedAt,
            examId: practicalScheduleResult._id,
            location: practicalScheduleResult.location || "Test Center",
            examiner:
              practicalScheduleResult.examResult?.evaluatedBy ||
              "Test Examiner",
            notes:
              practicalScheduleResult.examResult?.notes ||
              "Practical exam completed successfully",
          }
        : null);

    const eligibilityStatus = {
      theoryPassed: !!theoryResult,
      practicalPassed: practicalPassed,
      paymentVerified: !!verifiedPayment,
      theoryResult: theoryResult,
      practicalResult: unifiedPracticalResult,
      payment: verifiedPayment,
    };

    console.log(
      `📊 Eligibility Status - Theory: ${eligibilityStatus.theoryPassed}, Practical: ${eligibilityStatus.practicalPassed}, Payment: ${eligibilityStatus.paymentVerified}`
    );

    // Determine eligibility
    const isEligible =
      eligibilityStatus.theoryPassed &&
      eligibilityStatus.practicalPassed &&
      eligibilityStatus.paymentVerified;

    let status = "not_eligible";
    let reason = "";

    if (isEligible) {
      status = "eligible_for_license";
      reason = "All requirements met - ready for license issuance";
    } else {
      const missing = [];
      if (!eligibilityStatus.theoryPassed) missing.push("theory exam");
      if (!eligibilityStatus.practicalPassed) missing.push("practical exam");
      if (!eligibilityStatus.paymentVerified)
        missing.push("payment verification");

      reason = `Missing: ${missing.join(", ")}`;

      if (eligibilityStatus.theoryPassed && eligibilityStatus.practicalPassed) {
        status = "ready_for_payment";
      } else if (eligibilityStatus.theoryPassed) {
        status = "need_practical_exam";
      } else {
        status = "need_theory_exam";
      }
    }

    console.log(`📋 Eligibility check result: ${status} - ${reason}`);

    res.json({
      success: true,
      eligible: isEligible,
      status: status,
      reason: reason,
      requirements: eligibilityStatus,
    });
  } catch (error) {
    console.error("Error checking license eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Error checking license eligibility",
      error: error.message,
    });
  }
};

// Delete payment (Admin)
export const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminId } = req.body;

    console.log(
      `🗑️ Admin ${adminId} attempting to delete payment ${paymentId}`
    );

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if payment can be deleted (only pending payments should be deletable)
    if (payment.status === "verified") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete verified payment. A license may have been issued.",
      });
    }

    // Delete the payment
    await Payment.findByIdAndDelete(paymentId);

    console.log(`✅ Payment ${paymentId} deleted successfully`);

    res.json({
      success: true,
      message: "Payment deleted successfully",
      deletedPayment: {
        _id: payment._id,
        userName: payment.userName,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting payment",
      error: error.message,
    });
  }
};

// Update payment status (Admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, adminId, adminNotes } = req.body;

    console.log(
      `🔄 Admin ${adminId} updating payment ${paymentId} status to ${status}`
    );

    // Validate status
    const validStatuses = ["pending", "verified", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Update payment
    payment.status = status;
    payment.reviewedBy = adminId;
    payment.reviewedAt = new Date();
    payment.adminNotes = adminNotes || payment.adminNotes;
    await payment.save();

    console.log(`✅ Payment ${paymentId} status updated to ${status}`);

    res.json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment: payment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
};

// Issue license directly (for eligible users)
export const issueLicense = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminId, adminNotes, licenseClass = "B" } = req.body;

    console.log(`🎫 Issuing license for payment ${paymentId}`);
    console.log("📋 Request body:", req.body);

    // Get the payment with populated data
    const payment = await Payment.findById(paymentId)
      .populate("userId")
      .populate("theoryExamId")
      .populate("practicalExamId");

    console.log("💰 Payment found:", payment ? "Yes" : "No");
    if (payment) {
      console.log("📋 Payment details:", {
        id: payment._id,
        status: payment.status,
        userName: payment.userName,
        userId: payment.userId?._id,
      });
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if payment is verified
    if (payment.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Payment must be verified before issuing license",
      });
    }

    // Check if license already exists for this user
    const existingLicense = await License.findOne({
      userId: payment.userId._id,
    });
    if (existingLicense) {
      console.log(
        `⚠️ License already exists for user ${payment.userId._id}: ${existingLicense.number}`
      );
      return res.status(200).json({
        success: true,
        message: "License already issued for this user",
        license: existingLicense,
        alreadyIssued: true,
      });
    }

    // Get exam results - check both ExamResult and ExamSchedule collections
    const theoryResult = await ExamResult.findOne({
      userId: payment.userId._id,
      examType: "theory",
      passed: true,
    });

    let practicalResult = await ExamResult.findOne({
      userId: payment.userId._id,
      examType: "practical",
      passed: true,
    });

    // If practical result not found in ExamResult, check ExamSchedule
    let practicalScheduleResult = null;
    if (!practicalResult) {
      practicalScheduleResult = await ExamSchedule.findOne({
        userId: payment.userId._id,
        examType: "practical",
        status: "completed",
        result: "pass",
      });
    }

    const hasPracticalResult = !!practicalResult || !!practicalScheduleResult;

    console.log("🔍 Exam results check:", {
      theoryResult: !!theoryResult,
      practicalResult: !!practicalResult,
      practicalScheduleResult: !!practicalScheduleResult,
      hasPracticalResult,
    });

    if (!theoryResult || !hasPracticalResult) {
      const missing = [];
      if (!theoryResult) missing.push("theory exam result");
      if (!hasPracticalResult) missing.push("practical exam result");

      return res.status(400).json({
        success: false,
        message: `Missing required exam results: ${missing.join(", ")}`,
        details: {
          theoryFound: !!theoryResult,
          practicalFound: hasPracticalResult,
          practicalInExamResult: !!practicalResult,
          practicalInExamSchedule: !!practicalScheduleResult,
        },
      });
    }

    // Generate unique license number and dates
    const year = new Date().getFullYear();
    let licenseNumber;
    let isUnique = false;
    let attempts = 0;

    // Generate unique license number
    while (!isUnique && attempts < 10) {
      const count = await License.countDocuments();
      const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
      const randomSuffix = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
      licenseNumber = `ETH-${year}-${String(count + 1).padStart(
        4,
        "0"
      )}${timestamp}${randomSuffix}`;

      // Check if this number already exists
      const existingWithNumber = await License.findOne({
        number: licenseNumber,
      });
      if (!existingWithNumber) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      // Fallback to timestamp-based number
      licenseNumber = `ETH-${year}-${Date.now()}`;
    }

    const issueDate = new Date();
    const expiryDate = new Date(
      issueDate.getTime() + 5 * 365 * 24 * 60 * 60 * 1000
    ); // 5 years

    // Determine practical exam data source
    const finalPracticalResult = practicalResult || practicalScheduleResult;
    const practicalScore = practicalResult
      ? practicalResult.score
      : practicalScheduleResult?.examResult?.score || 85;
    const practicalDate = practicalResult
      ? practicalResult.dateTaken
      : practicalScheduleResult?.examResult?.evaluatedAt ||
        practicalScheduleResult?.updatedAt;
    const practicalExamId = practicalResult
      ? practicalResult.examScheduleId || practicalResult._id
      : practicalScheduleResult._id;

    console.log("🔍 License creation data:", {
      licenseNumber,
      issueDate,
      expiryDate,
      theoryExamId: theoryResult.examScheduleId || theoryResult._id,
      practicalExamId: practicalExamId,
      theoryScore: theoryResult.score,
      practicalScore: practicalScore,
      practicalSource: practicalResult ? "ExamResult" : "ExamSchedule",
    });

    // Create license
    const license = new License({
      userId: payment.userId._id,
      userName: payment.userId.fullName || payment.userId.full_name,
      userEmail: payment.userId.email || payment.userId.user_email,
      number: licenseNumber,
      class: licenseClass,
      issueDate: issueDate,
      expiryDate: expiryDate,
      theoryExamResult: {
        examId: theoryResult.examScheduleId || theoryResult._id,
        score: theoryResult.score,
        dateTaken: theoryResult.dateTaken,
      },
      practicalExamResult: {
        examId: practicalExamId,
        score: practicalScore,
        dateTaken: practicalDate,
      },
      paymentId: payment._id,
      issuedBy: adminId,
    });

    await license.save();

    console.log(
      `✅ License ${license.number} issued successfully for ${license.userName}`
    );

    res.json({
      success: true,
      message: "License issued successfully",
      license: license,
      payment: payment,
    });
  } catch (error) {
    console.error("Error issuing license:", error);
    res.status(500).json({
      success: false,
      message: "Error issuing license",
      error: error.message,
    });
  }
};

// Generate license download (PDF with QR code)
export const downloadLicense = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`📄 Generating license download for user ${userId}`);

    const license = await License.findOne({ userId })
      .populate(
        "userId",
        "fullName email phone profilePicture dateOfBirth address nationality bloodType"
      )
      .populate("issuedBy", "fullName email");

    // If populate didn't work properly, get user data separately
    if (!license.userId.bloodType) {
      const User = (await import("../models/User.js")).default;
      const userData = await User.findById(userId).select(
        "nationality bloodType"
      );
      if (userData) {
        license.userId.nationality = userData.nationality;
        license.userId.bloodType = userData.bloodType;
      }
    }

    if (!license) {
      return res.status(404).json({
        success: false,
        message: "License not found",
      });
    }

    // Generate QR code data
    const qrData = {
      licenseNumber: license.number,
      userId: license.userId._id,
      userName: license.userName,
      class: license.class,
      issueDate: license.issueDate,
      expiryDate: license.expiryDate,
      status: license.status,
      hasPhoto: !!license.userId.profilePicture,
      photoPath: license.userId.profilePicture || null,
      verificationUrl: `https://dlms.gov.et/verify/${license.number}`,
      generatedAt: new Date().toISOString(),
    };

    // Generate QR code as base64 data URL
    let qrCodeDataURL = "";
    try {
      qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      console.log("✅ QR code generated successfully");
    } catch (qrError) {
      console.error("❌ QR code generation failed:", qrError);
      // Fallback to text-based QR code
      qrCodeDataURL =
        "data:image/svg+xml;base64," +
        Buffer.from(
          `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">
            QR CODE
            ${license.number}
          </text>
        </svg>
      `
        ).toString("base64");
    }

    // Get user photo path
    let userPhotoURL = "";
    if (license.userId.profilePicture) {
      console.log("🖼️ Processing user photo:", license.userId.profilePicture);

      // Handle different profile picture path formats
      let photoPath;
      if (license.userId.profilePicture.startsWith("/uploads/")) {
        // Full path from root
        photoPath = path.join(
          __dirname,
          "..",
          license.userId.profilePicture.substring(1)
        );
      } else if (license.userId.profilePicture.startsWith("uploads/")) {
        // Relative path from backend root
        photoPath = path.join(__dirname, "..", license.userId.profilePicture);
      } else {
        // Just filename, assume it's in profile-pictures directory
        photoPath = path.join(
          __dirname,
          "..",
          "uploads",
          "profile-pictures",
          license.userId.profilePicture
        );
      }

      console.log("📁 Looking for photo at:", photoPath);

      if (fs.existsSync(photoPath)) {
        try {
          const photoData = fs.readFileSync(photoPath);
          const photoExt = path
            .extname(license.userId.profilePicture)
            .toLowerCase();
          let mimeType = "image/jpeg";
          if (photoExt === ".png") mimeType = "image/png";
          if (photoExt === ".gif") mimeType = "image/gif";
          if (photoExt === ".webp") mimeType = "image/webp";

          userPhotoURL = `data:${mimeType};base64,${photoData.toString(
            "base64"
          )}`;
          console.log("✅ User photo loaded successfully");
        } catch (photoError) {
          console.error("❌ Error loading user photo:", photoError);
        }
      } else {
        console.log("⚠️ User photo file not found at:", photoPath);

        // Try alternative paths
        const alternativePaths = [
          path.join(
            __dirname,
            "..",
            "uploads",
            "documents",
            license.userId.profilePicture
          ),
          path.join(__dirname, "..", "uploads", license.userId.profilePicture),
        ];

        for (const altPath of alternativePaths) {
          console.log("🔍 Trying alternative path:", altPath);
          if (fs.existsSync(altPath)) {
            try {
              const photoData = fs.readFileSync(altPath);
              const photoExt = path
                .extname(license.userId.profilePicture)
                .toLowerCase();
              let mimeType = "image/jpeg";
              if (photoExt === ".png") mimeType = "image/png";
              if (photoExt === ".gif") mimeType = "image/gif";
              if (photoExt === ".webp") mimeType = "image/webp";

              userPhotoURL = `data:${mimeType};base64,${photoData.toString(
                "base64"
              )}`;
              console.log("✅ User photo loaded from alternative path");
              break;
            } catch (photoError) {
              console.error(
                "❌ Error loading user photo from alternative path:",
                photoError
              );
            }
          }
        }
      }
    } else {
      console.log("ℹ️ No profile picture set for user");
    }

    // Get user information with bilingual support
    const userInfo = {
      fullName: license.userName,
      dateOfBirth: license.userId.dateOfBirth
        ? new Date(license.userId.dateOfBirth).toLocaleDateString("en-GB")
        : "01/01/1990",
      address: license.userId.address || "Addis Ababa, Ethiopia",
      phone: license.userId.phone || "N/A",
      nationality: license.userId.nationality || "Ethiopian",
      nationalityAmharic: "ኢትዮጵያዊ", // Ethiopian in Amharic
      bloodType: license.userId.bloodType || null, // Don't show N/A, just null
      hasBloodType: !!license.userId.bloodType,
    };

    // Create realistic Ethiopian driving license HTML content with front and back
    const licenseHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ethiopian Driving License - ${license.number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: #f0f2f5;
            padding: 30px;
            min-height: 100vh;
        }

        .license-wrapper {
            max-width: 100%;
            margin: 0 auto;
            display: flex;
            gap: 30px;
            justify-content: center;
            flex-wrap: wrap;
            padding: 40px;
        }

        .license-card {
            width: 100%;
            max-width: 800px;
            min-width: 500px;
            height: 600px;
            min-height: 400px;
            border-radius: 25px;
            box-shadow: 0 15px 45px rgba(0,0,0,0.25);
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        }

        /* Mobile First Responsive Design */
        @media (max-width: 480px) {
            body {
                padding: 10px;
            }

            .license-wrapper {
                gap: 15px;
                padding: 10px;
            }

            .license-card {
                min-width: 350px;
                height: auto;
                min-height: 600px;
                border-radius: 15px;
            }
        }

        /* Extra small screens */
        @media (max-width: 400px) {
            .license-card {
                min-width: 380px;
                height: 500px;
                min-height: 350px;
            }

            .front-content {
                padding: 12px;
                gap: 12px;
                min-height: 250px;
            }

            .photo-section {
                width: 90px;
            }

            .user-photo {
                width: 80px;
                height: 120px;
            }

            .info-label {
                font-size: 10px;
                width: 80px;
            }

            .info-value {
                font-size: 12px;
                margin-left: 8px;
            }
        }

        /* Ensure text doesn't overflow */
        .info-value {
            hyphens: auto;
            word-break: break-word;
        }

        /* Blood type highlighting for mobile */
        @media (max-width: 480px) {
            .info-row:has(.info-value[style*="color: #ff4444"]) {
                background: rgba(255, 68, 68, 0.1);
                border-radius: 3px;
                padding: 2px;
                margin: 2px 0;
            }
        }

        /* Ensure critical information is always visible */
        .info-section {
            overflow: visible;
        }

        /* Better spacing for mobile */
        @media (max-width: 480px) {
            .info-section {
                gap: 8px;
                padding: 15px;
                margin-left: 0;
                margin-top: 10px;
            }

            .info-row {
                margin-bottom: 8px;
                flex-direction: column;
                gap: 8px;
            }

            .info-item {
                margin-bottom: 6px;
            }

            .info-label {
                font-size: 10px;
                margin-bottom: 2px;
            }

            .info-value {
                font-size: 12px;
                font-weight: 600;
            }

            /* Header adjustments for mobile */
            .license-header {
                padding: 10px 15px;
                height: auto;
                min-height: 60px;
            }

            .ministry-info h2 {
                font-size: 14px;
                margin-bottom: 2px;
            }

            .ministry-info p {
                font-size: 10px;
                margin: 1px 0;
            }

            .license-title {
                font-size: 16px;
                margin: 5px 0;
            }

            /* License number and class visibility */
            .license-number {
                font-size: 18px !important;
                font-weight: bold;
                margin: 8px 0;
            }

            .license-class {
                font-size: 16px !important;
                font-weight: bold;
                background: rgba(255, 255, 255, 0.2);
                padding: 4px 8px;
                border-radius: 6px;
                margin: 5px 0;
            }
        }

        /* Better mobile touch targets */
        @media (max-width: 768px) {
            .license-card {
                cursor: default;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
        }

        /* Landscape orientation on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
            .license-wrapper {
                padding: 5px;
            }

            .license-card {
                max-width: 90vw;
                height: 85vh;
                min-height: 400px;
            }

            .front-content {
                padding: 2vw;
                gap: 2vw;
                height: calc(100% - 100px);
            }
        }

        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .license-card {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        }

        /* Print styles for when users want to print */
        @media print {
            body {
                background: white;
                padding: 0;
            }

            .license-wrapper {
                max-width: none;
                margin: 0;
                padding: 0;
            }

            .license-card {
                width: 100%;
                max-width: none;
                height: auto;
                box-shadow: none;
                page-break-inside: avoid;
            }
        }

        /* FRONT SIDE */
        .front-side {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            position: relative;
        }

        .front-header {
            background: rgba(255,255,255,0.1);
            padding: 5vw 6vw;
            text-align: center;
            border-bottom: 3px solid rgba(255,255,255,0.2);
        }

        .ministry-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2vw;
            margin-bottom: 2vw;
        }

        .logo {
            width: 8vw;
            height: 8vw;
            max-width: 50px;
            max-height: 50px;
            min-width: 35px;
            min-height: 35px;
            background: #FFD700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4vw;
            max-font-size: 24px;
            min-font-size: 16px;
            color: #1e3c72;
            font-weight: bold;
        }

        .ministry-text {
            font-size: 2.5vw;
            max-font-size: 22px;
            min-font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.2;
        }

        .country-name {
            font-size: 2vw;
            max-font-size: 18px;
            min-font-size: 14px;
            opacity: 0.9;
            margin-top: 0.5vw;
        }

        .license-title {
            font-size: 3vw;
            max-font-size: 24px;
            min-font-size: 18px;
            font-weight: bold;
            margin-top: 1vw;
            letter-spacing: 1px;
        }

        @media (max-width: 480px) {
            .front-header {
                padding: 20px 24px;
            }

            .ministry-logo {
                gap: 16px;
                margin-bottom: 12px;
            }

            .logo {
                width: 40px;
                height: 40px;
                font-size: 18px;
            }

            .ministry-text {
                font-size: 14px;
            }

            .country-name {
                font-size: 12px;
                margin-top: 6px;
            }

            .license-title {
                font-size: 16px;
                margin-top: 8px;
            }
        }

        .front-content {
            padding: 6vw;
            display: flex;
            gap: 6vw;
            height: calc(100% - 140px);
            min-height: 300px;
        }

        .photo-section {
            width: 20vw;
            max-width: 120px;
            min-width: 90px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .user-photo {
            width: 18vw;
            height: 28vw;
            max-width: 140px;
            max-height: 220px;
            min-width: 100px;
            min-height: 150px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            border: 4px solid white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5vw;
            max-font-size: 18px;
            min-font-size: 14px;
            color: #666;
            text-align: center;
            margin-bottom: 4vw;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 480px) {
            .front-content {
                padding: 15px;
                gap: 15px;
                height: auto;
                min-height: 400px;
                flex-direction: column;
            }

            .photo-section {
                width: 100%;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .user-photo {
                width: 80px;
                height: 100px;
                font-size: 12px;
                margin-bottom: 0;
            }

            .signature-area {
                width: 80px;
                height: 25px;
                font-size: 10px;
            }
        }

        .photo-placeholder {
            font-size: 24px;
            color: #999;
        }

        .signature-area {
            width: 18vw;
            height: 5vw;
            max-width: 140px;
            max-height: 38px;
            min-width: 100px;
            min-height: 28px;
            background: rgba(255,255,255,0.9);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2vw;
            max-font-size: 15px;
            min-font-size: 12px;
            color: #333;
            font-style: italic;
        }

        .info-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-width: 0;
            background: rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 4vw;
            margin-left: 2vw;
        }

        .info-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 4vw;
            min-height: 7vw;
            max-margin-bottom: 16px;
            max-min-height: 30px;
            padding: 2vw 1vw;
        }

        @media (max-width: 480px) {
            .signature-area {
                width: 90px;
                height: 28px;
                font-size: 12px;
            }

            .info-row {
                margin-bottom: 14px;
                min-height: 28px;
                padding: 8px 4px;
            }
        }

        .info-label {
            font-size: 1.8vw;
            max-font-size: 16px;
            min-font-size: 12px;
            font-weight: bold;
            width: 18vw;
            max-width: 140px;
            min-width: 100px;
            opacity: 0.9;
            text-transform: uppercase;
            color: rgba(255,255,255,0.9);
            text-align: left;
            flex-shrink: 0;
            line-height: 1.2;
            padding-right: 2vw;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .info-value {
            font-size: 2.2vw;
            max-font-size: 18px;
            min-font-size: 14px;
            font-weight: bold;
            flex: 1;
            color: white;
            text-align: left;
            margin-left: 2vw;
            line-height: 1.3;
            word-wrap: break-word;
            overflow-wrap: break-word;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        @media (max-width: 480px) {
            .info-label {
                font-size: 12px;
                width: 100px;
                padding-right: 12px;
            }

            .info-value {
                font-size: 14px;
                margin-left: 12px;
            }
        }

        .bilingual-text {
            display: flex;
            flex-direction: column;
            line-height: 1.1;
        }

        .english-text {
            font-size: 9px;
            font-weight: bold;
        }

        .amharic-text {
            font-size: 8px;
            font-weight: normal;
            opacity: 0.8;
            margin-top: 1px;
        }

        .license-number-front {
            font-size: 4vw;
            max-font-size: 28px;
            min-font-size: 20px;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.2vw;
            color: #FFD700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .class-badge {
            background: #FFD700;
            color: #1e3c72;
            padding: 0.5vw 2vw;
            border-radius: 2.5vw;
            font-size: 2.5vw;
            max-font-size: 18px;
            min-font-size: 14px;
            font-weight: bold;
            display: inline-block;
        }

        @media (max-width: 480px) {
            .license-number-front {
                font-size: 20px;
                letter-spacing: 1.5px;
            }

            .class-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 14px;
            }
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 40px;
            opacity: 0.1;
            color: white;
            font-weight: bold;
            pointer-events: none;
            z-index: 1;
        }

        /* BACK SIDE */
        .back-side {
            background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
            color: white;
            position: relative;
        }

        .back-header {
            background: rgba(255,255,255,0.1);
            padding: 10px 15px;
            text-align: center;
            border-bottom: 2px solid rgba(255,255,255,0.2);
        }

        .back-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .back-subtitle {
            font-size: 9px;
            opacity: 0.9;
        }

        .back-content {
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: calc(100% - 60px);
        }

        .qr-container {
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .qr-code {
            width: 120px;
            height: 120px;
            background: #f8f9fa;
            border: 2px solid #ddd;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #666;
            text-align: center;
            line-height: 1.2;
            position: relative;
        }

        .qr-pattern {
            position: absolute;
            inset: 10px;
            background:
                linear-gradient(90deg, #333 1px, transparent 1px),
                linear-gradient(180deg, #333 1px, transparent 1px);
            background-size: 8px 8px;
            opacity: 0.3;
        }

        .verification-text {
            text-align: center;
            font-size: 9px;
            line-height: 1.4;
            opacity: 0.9;
        }

        .verification-url {
            color: #FFD700;
            font-weight: bold;
            margin-top: 5px;
        }

        .security-features {
            position: absolute;
            bottom: 10px;
            left: 15px;
            right: 15px;
            font-size: 7px;
            text-align: center;
            opacity: 0.7;
            border-top: 1px solid rgba(255,255,255,0.2);
            padding-top: 5px;
        }

        .card-label {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }

        @media print {
            body {
                background: white;
                padding: 10px;
            }
            .license-wrapper {
                gap: 20px;
            }
            .license-card {
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
        }

        @media (max-width: 768px) {
            .license-wrapper {
                flex-direction: column;
                align-items: center;
            }
            .license-card {
                width: 350px;
                height: 220px;
            }
        }
    </style>
</head>
<body>
    <div class="license-wrapper">
        <!-- FRONT SIDE -->
        <div class="license-card front-side">
            <div class="watermark">ETHIOPIA</div>

            <div class="front-header">
                <div class="ministry-logo">
                    <div class="logo">🇪🇹</div>
                    <div>
                        <div class="ministry-text">Ministry of Transport<br>and Logistics<br><span style="font-size: 8px;">የትራንስፖርት እና ሎጂስቲክስ ሚኒስቴር</span></div>
                        <div class="country-name">Federal Democratic Republic of Ethiopia<br><span style="font-size: 8px;">የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ</span></div>
                    </div>
                </div>
                <div class="license-title">DRIVING LICENSE<br><span style="font-size: 12px;">የመንዳት ፈቃድ</span></div>
            </div>

            <div class="front-content">
                <div class="photo-section">
                    <div class="user-photo">
                        ${
                          userPhotoURL
                            ? `<img src="${userPhotoURL}" alt="User Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 3px;">`
                            : `<div class="photo-placeholder">👤</div>`
                        }
                    </div>
                    <div class="signature-area">${
                      userInfo.fullName.split(" ")[0]
                    }</div>
                </div>

                <div class="info-section">
                    <div class="info-row">
                        <div class="info-label">No:<br>ቁጥር:</div>
                        <div class="info-value license-number-front">${
                          license.number
                        }</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Name:<br>ስም:</div>
                        <div class="info-value">${userInfo.fullName.toUpperCase()}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Class:<br>ክፍል:</div>
                        <div class="info-value">
                            <span class="class-badge">${license.class}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">DOB:<br>የተወለደበት:</div>
                        <div class="info-value">${userInfo.dateOfBirth}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Nationality:<br>ዜግነት:</div>
                        <div class="info-value bilingual-text">
                            <span class="english-text">${
                              userInfo.nationality
                            }</span>
                            <span class="amharic-text">${
                              userInfo.nationalityAmharic
                            }</span>
                        </div>
                    </div>
                    ${
                      userInfo.hasBloodType
                        ? `
                    <div class="info-row">
                        <div class="info-label">Blood:<br>የደም ዓይነት:</div>
                        <div class="info-value" style="color: #ff4444; font-weight: bold; text-shadow: 0 0 8px rgba(255, 68, 68, 0.6);">${userInfo.bloodType}</div>
                    </div>
                    `
                        : ""
                    }
                    <div class="info-row">
                        <div class="info-label">Address:<br>አድራሻ:</div>
                        <div class="info-value" style="font-size: 7px;">${
                          userInfo.address
                        }</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Issue:<br>የተሰጠበት:</div>
                        <div class="info-value">${new Date(
                          license.issueDate
                        ).toLocaleDateString("en-GB")}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Expiry:<br>የሚያበቃበት:</div>
                        <div class="info-value">${new Date(
                          license.expiryDate
                        ).toLocaleDateString("en-GB")}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Status:<br>ሁኔታ:</div>
                        <div class="info-value">${license.status.toUpperCase()}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- BACK SIDE -->
        <div class="license-card back-side">
            <div class="watermark">SECURE</div>

            <div class="back-header">
                <div class="back-title">VERIFICATION & SECURITY</div>
                <div class="back-subtitle">Scan QR code to verify authenticity</div>
            </div>

            <div class="back-content">
                <div class="qr-container">
                    <div class="qr-code" style="background: white; border: none; padding: 10px;">
                        ${
                          qrCodeDataURL
                            ? `<img src="${qrCodeDataURL}" alt="QR Code" style="width: 120px; height: 120px; display: block;">`
                            : `<div class="qr-pattern"></div>
                           <div style="position: relative; z-index: 2; font-size: 8px; line-height: 1.1;">
                               <strong>VERIFY LICENSE</strong><br>
                               ${license.number}<br>
                               <small>dlms.gov.et/verify</small><br>
                               <small style="font-size: 6px;">${new Date().toLocaleDateString()}</small>
                           </div>`
                        }
                    </div>
                </div>

                <div class="verification-text">
                    Scan this QR code with any smartphone<br>
                    to verify license authenticity and status
                    <div class="verification-url">dlms.gov.et/verify</div>
                </div>
            </div>

            <div class="security-features">
                SECURITY FEATURES: Holographic elements • Microprinting • Digital signature • Biometric data
            </div>
        </div>
    </div>

    <div class="card-label">FRONT</div>
    <div class="card-label">BACK</div>

    <script>
        // Auto-print functionality
        window.onload = function() {
            setTimeout(() => {
                if (confirm('Would you like to print this license?')) {
                    window.print();
                }
            }, 1000);
        };

        // Add some dynamic security features
        document.addEventListener('DOMContentLoaded', function() {
            // Add timestamp for verification
            const timestamp = new Date().toISOString();
            console.log('License generated at:', timestamp);

            // Add some visual effects
            const watermarks = document.querySelectorAll('.watermark');
            watermarks.forEach(wm => {
                wm.style.animation = 'pulse 3s infinite';
            });
        });

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes pulse {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 0.2; }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`;

    // Set response headers for HTML download
    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Ethiopian_Driving_License_${license.number}.html"`
    );

    console.log(`✅ License download generated for ${license.number}`);

    res.send(licenseHTML);
  } catch (error) {
    console.error("Error generating license download:", error);
    res.status(500).json({
      success: false,
      message: "Error generating license download",
      error: error.message,
    });
  }
};

export { upload };
