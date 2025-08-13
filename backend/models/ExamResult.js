import mongoose from "mongoose";

// Exam Result Schema
const examResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  examType: { type: String, enum: ["theory", "practical"], required: true },
  language: { type: String, enum: ["english", "amharic"], default: "english" },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExamQuestion" }],
  answers: [{ type: Number }],
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  dateTaken: { type: Date, default: Date.now },
  timeSpent: { type: Number }, // in minutes
  examScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "ExamSchedule" },
  cancelled: { type: Boolean, default: false },
  cancelledAt: { type: Date },
  totalQuestions: { type: Number, default: 50 },
  correctAnswers: { type: Number, required: true },
});

const ExamResult = mongoose.model("ExamResult", examResultSchema);

export default ExamResult;
