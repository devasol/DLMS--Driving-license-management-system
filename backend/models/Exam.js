import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examType: {
      type: String,
      required: true,
      enum: ["Written", "Practical", "Vision"],
    },
    licenseClass: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "E"],
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "completed", "failed", "cancelled"],
      default: "scheduled",
    },
    score: {
      type: Number,
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    examiner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: String,
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Create the model
const Exam = mongoose.model("Exam", examSchema);

// Export as default
export default Exam;
