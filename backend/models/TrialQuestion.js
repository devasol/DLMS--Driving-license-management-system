import mongoose from "mongoose";

const trialQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (options) {
          return options.length >= 2 && options.length <= 6;
        },
        message: "Question must have between 2 and 6 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      validate: {
        validator: function (answer) {
          return answer >= 0 && answer < this.options.length;
        },
        message: "Correct answer index must be valid",
      },
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Traffic Rules",
        "Road Signs",
        "Safety",
        "Vehicle Knowledge",
        "Emergency Procedures",
        "General Knowledge",
      ],
      default: "General Knowledge",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    explanation: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
trialQuestionSchema.index({ category: 1, isActive: 1 });
trialQuestionSchema.index({ difficulty: 1, isActive: 1 });

const TrialQuestion = mongoose.model("TrialQuestion", trialQuestionSchema);

export default TrialQuestion;
