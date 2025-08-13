import express from "express";
import {
  createTrialQuestion,
  getAllTrialQuestions,
  updateTrialQuestion,
  deleteTrialQuestion,
  getTrialQuestionsForExam,
  submitTrialResult,
  getUserTrialResults,
  getAllTrialResults,
  getTrialResultDetails,
} from "../controllers/trialQuestionController.js";

const router = express.Router();

// Admin routes for managing trial questions
router.post("/admin/questions", createTrialQuestion);
router.get("/admin/questions", getAllTrialQuestions);
router.put("/admin/questions/:id", updateTrialQuestion);
router.delete("/admin/questions/:id", deleteTrialQuestion);

// Admin routes for viewing trial results
router.get("/admin/results", getAllTrialResults);
router.get("/admin/results/:id", getTrialResultDetails);

// User routes for taking trial exams
router.get("/questions", getTrialQuestionsForExam);
router.post("/submit", submitTrialResult);
router.get("/results/:userId", getUserTrialResults);
router.get("/result/:id", getTrialResultDetails);

export default router;
