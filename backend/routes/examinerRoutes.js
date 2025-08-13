import express from "express";
import mongoose from "mongoose";
import ExamSchedule from "../models/examSchedule.js";
import User from "../models/User.js";
import {
  authenticateExaminer,
  authenticateAdminOrExaminer,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get examiner's assigned exams
router.get("/assigned", authenticateExaminer, async (req, res) => {
  try {
    const examinerId = req.userId;
    console.log("🔍 Fetching assigned exams for examiner:", examinerId);

    // Use direct MongoDB query to handle examiner field
    const examSchedulesCollection =
      mongoose.connection.db.collection("examschedules");
    const usersCollection = mongoose.connection.db.collection("users");

    // Find practical exams assigned to this specific examiner
    const assignedExams = await examSchedulesCollection
      .find({
        $and: [
          {
            $or: [
              { examiner: new mongoose.Types.ObjectId(examinerId) },
              { examiner: examinerId },
            ],
          },
          { examType: "practical" },
          { status: { $in: ["scheduled", "approved", "rejected", "pending"] } },
        ],
      })
      .sort({ date: 1, time: 1 })
      .toArray();

    console.log(`📋 Found ${assignedExams.length} assigned exams`);

    // Get user details for each exam
    const formattedExams = [];
    for (const exam of assignedExams) {
      const user = await usersCollection.findOne({ _id: exam.userId });

      formattedExams.push({
        _id: exam._id,
        fullName:
          exam.fullName || user?.fullName || user?.full_name || "Unknown User",
        userName:
          exam.fullName || user?.fullName || user?.full_name || "Unknown User",
        userEmail: user?.user_email || user?.email || "",
        date: exam.date,
        time: exam.time,
        location: exam.location,
        status: exam.status,
        examType: exam.examType,
        userId: exam.userId,
      });
    }

    res.status(200).json(formattedExams);
  } catch (error) {
    console.error("Error fetching assigned exams:", error);
    res.status(500).json({
      message: "Error fetching assigned exams",
      error: error.message,
    });
  }
});

// Get examiner's exam history
router.get("/history", authenticateExaminer, async (req, res) => {
  try {
    const examinerId = req.userId;
    console.log("🔍 Fetching exam history for examiner:", examinerId);

    // Use direct MongoDB query to handle examiner field
    const examSchedulesCollection =
      mongoose.connection.db.collection("examschedules");
    const usersCollection = mongoose.connection.db.collection("users");

    // Find completed exams by this examiner (check both ObjectId and string formats)
    const examHistory = await examSchedulesCollection
      .find({
        $and: [
          {
            $or: [
              { examiner: new mongoose.Types.ObjectId(examinerId) },
              { examiner: examinerId },
            ],
          },
          { examType: "practical" },
          { status: "completed" },
        ],
      })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    console.log(`📋 Found ${examHistory.length} completed exams`);

    // Get user details for each exam
    const formattedHistory = [];
    for (const exam of examHistory) {
      const user = await usersCollection.findOne({ _id: exam.userId });

      formattedHistory.push({
        _id: exam._id,
        userName:
          exam.fullName || user?.fullName || user?.full_name || "Unknown User",
        userEmail: user?.user_email || user?.email || "",
        date: exam.date,
        time: exam.time,
        location: exam.location,
        result: exam.result,
        score: exam.examResult?.score,
        completedAt: exam.updatedAt,
        examType: exam.examType,
        userId: exam.userId,
      });
    }

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Error fetching exam history:", error);
    res.status(500).json({
      message: "Error fetching exam history",
      error: error.message,
    });
  }
});

// Submit exam result (examiner version)
router.put("/submit-result/:examId", authenticateExaminer, async (req, res) => {
  try {
    const { examId } = req.params;
    const examinerId = req.userId;
    const examResultData = req.body;

    // Find the exam and verify it's assigned to this examiner
    const exam = await ExamSchedule.findOne({
      _id: examId,
      examiner: examinerId,
      examType: "practical",
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found or not assigned to you",
      });
    }

    // Update the exam with detailed result
    const updatedExam = await ExamSchedule.findByIdAndUpdate(
      examId,
      {
        status: "completed",
        result: examResultData.result,
        examResult: {
          score: examResultData.finalScore,
          evaluatedBy: examResultData.examinerName,
          evaluatedAt: new Date(),
          notes: examResultData.generalNotes,
          recommendations: examResultData.recommendations,

          // Detailed assessment data
          maneuvers: examResultData.maneuvers,
          trafficRules: examResultData.trafficRules,
          vehicleControl: examResultData.vehicleControl,

          // Exam details
          vehicleDetails: examResultData.vehicleDetails,
          routeDetails: examResultData.routeDetails,
          examDuration: examResultData.examDuration,
          startTime: examResultData.startTime,
          endTime: examResultData.endTime,

          // Performance assessment
          overallPerformance: examResultData.overallPerformance,
          criticalErrors: examResultData.criticalErrors || [],
          majorFaults: examResultData.majorFaults || [],
          minorFaults: examResultData.minorFaults || [],
        },
      },
      { new: true }
    );

    // Update examiner's last exam date
    await User.findByIdAndUpdate(examinerId, {
      "examinerDetails.lastExamDate": new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Exam result submitted successfully",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Error submitting exam result:", error);
    res.status(500).json({
      message: "Error submitting exam result",
      error: error.message,
    });
  }
});

// Get examiner profile
router.get("/profile", authenticateExaminer, async (req, res) => {
  try {
    const examinerId = req.userId;

    const examiner = await User.findById(examinerId).select(
      "-password -user_password -emailOTP -passwordResetOTP"
    );

    if (!examiner) {
      return res.status(404).json({ message: "Examiner not found" });
    }

    // Get some statistics
    const totalExams = await ExamSchedule.countDocuments({
      examiner: examinerId,
      examType: "practical",
      status: "completed",
    });

    const passedExams = await ExamSchedule.countDocuments({
      examiner: examinerId,
      examType: "practical",
      status: "completed",
      result: "pass",
    });

    const examinerProfile = {
      ...examiner.toObject(),
      statistics: {
        totalExams,
        passedExams,
        failedExams: totalExams - passedExams,
        passRate:
          totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0,
      },
    };

    res.status(200).json(examinerProfile);
  } catch (error) {
    console.error("Error fetching examiner profile:", error);
    res.status(500).json({
      message: "Error fetching examiner profile",
      error: error.message,
    });
  }
});

// Update examiner profile
router.put("/profile", authenticateExaminer, async (req, res) => {
  try {
    const examinerId = req.userId;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.user_password;
    delete updateData.role;
    delete updateData._id;

    const updatedExaminer = await User.findByIdAndUpdate(
      examinerId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -user_password -emailOTP -passwordResetOTP");

    if (!updatedExaminer) {
      return res.status(404).json({ message: "Examiner not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      examiner: updatedExaminer,
    });
  } catch (error) {
    console.error("Error updating examiner profile:", error);
    res.status(500).json({
      message: "Error updating examiner profile",
      error: error.message,
    });
  }
});

// Get available exams for assignment (admin/examiner can view)
router.get(
  "/available-for-assignment",
  authenticateAdminOrExaminer,
  async (req, res) => {
    try {
      // Find practical exams that don't have an examiner assigned yet
      const availableExams = await ExamSchedule.find({
        examType: "practical",
        status: { $in: ["scheduled", "approved"] },
        $or: [{ examiner: { $exists: false } }, { examiner: null }],
      })
        .populate("userId", "fullName full_name user_email email")
        .sort({ date: 1, time: 1 });

      const formattedExams = availableExams.map((exam) => ({
        _id: exam._id,
        fullName:
          exam.fullName || exam.userId?.fullName || exam.userId?.full_name,
        userEmail: exam.userId?.user_email || exam.userId?.email,
        date: exam.date,
        time: exam.time,
        location: exam.location,
        status: exam.status,
        userId: exam.userId?._id,
      }));

      res.status(200).json(formattedExams);
    } catch (error) {
      console.error("Error fetching available exams:", error);
      res.status(500).json({
        message: "Error fetching available exams",
        error: error.message,
      });
    }
  }
);

// Note: Automatic assignment is now handled during exam approval process
// No manual assignment routes needed

export default router;
