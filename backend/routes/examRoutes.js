import express from "express";
import {
  scheduleExam,
  getExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
  approveExamSchedule,
  rejectExamSchedule,
  addExamQuestion,
  getExamQuestions,
  updateExamQuestion,
  deleteExamQuestion,
  submitExamResult,
  getExamResults,
  updateExamResult,
  deleteExamResult,
  getUserExamSchedule,
  getAllUserExamSchedules,
  getUserPracticalExamResults,
  getUserAvailableExams,
  getExamById,
  completeExam,
  completeExamWithFinalResult,
  approveExamResult,
  rejectExamResult,
  getPendingApprovalExams,
  createInstantTheoryExam,
} from "../controllers/examController.js";

const router = express.Router();

// Exam Scheduling Routes
router.post("/schedule", scheduleExam);
router.post("/instant-theory", createInstantTheoryExam);
router.get("/schedules", getExamSchedules);
router.get("/schedules/pending-approval", getPendingApprovalExams); // Move this before :id routes
router.get("/schedules/user/:userId", getUserExamSchedule);
router.get("/user-schedules/:userId", getAllUserExamSchedules); // Alias for user schedules
router.get("/schedules/:id", getExamScheduleById);
router.get("/practical-results/:userId", getUserPracticalExamResults);
router.get("/available/:userId", getUserAvailableExams);
router.put("/schedules/:id", updateExamSchedule);
router.put("/schedules/:id/approve", approveExamSchedule);
router.put("/schedules/:id/reject", rejectExamSchedule);
router.delete("/schedules/:id", deleteExamSchedule);

// Exam Questions Routes
router.post("/questions", addExamQuestion);
router.get("/questions", getExamQuestions);
router.get("/questions/random/:count", getExamQuestions); // Get random questions for exam
router.put("/questions/:id", updateExamQuestion);
router.delete("/questions/:id", deleteExamQuestion);

// Exam Results Routes - specific routes first to avoid conflicts
router.get("/results", getExamResults);
router.get("/results/user/:userId", getExamResults);
router.put("/results/:id", updateExamResult); // Update exam result
router.delete("/results/:id", deleteExamResult); // Delete exam result

// Exam Taking Routes
router.get("/take/:examId", getExamById);
router.post("/take/:examId/submit", submitExamResult);

// Practical exam specific routes
router.put("/schedules/:id/complete", completeExam);
router.put("/schedules/:id/complete-final", completeExamWithFinalResult);
router.put("/schedules/:id/complete-examiner", completeExamWithFinalResult); // Alias for examiner use
router.put("/schedules/:id/approve-result", approveExamResult);
router.put("/schedules/:id/reject-result", rejectExamResult);

export default router;
