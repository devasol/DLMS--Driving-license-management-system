import mongoose from "mongoose";

const trialResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TrialQuestion",
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        options: [String],
        correctAnswer: {
          type: Number,
          required: true,
        },
        userAnswer: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        timeSpent: {
          type: Number, // in seconds
          default: 0,
        },
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    wrongAnswers: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      default: 70, // 70% passing score
    },
    result: {
      type: String,
      enum: ["Pass", "Fail"],
      required: true,
    },
    timeStarted: {
      type: Date,
      required: true,
    },
    timeCompleted: {
      type: Date,
      required: true,
    },
    totalTimeSpent: {
      type: Number, // in seconds
      required: true,
    },
    category: {
      type: String,
      default: "General Trial",
    },
    attempt: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
trialResultSchema.index({ userId: 1, createdAt: -1 });
trialResultSchema.index({ result: 1, createdAt: -1 });

const TrialResult = mongoose.model("TrialResult", trialResultSchema);

export default TrialResult;
