import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      required: true,
      enum: ["theory", "practical"],
    },
    title: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      default: "To be assigned",
    },
    examiner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "approved",
        "rejected",
        "completed",
        "pending_approval",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
    },
    result: {
      type: String,
      enum: ["pass", "fail", "pending"],
      default: "pending",
    },
    examResult: {
      score: Number,
      notes: String,
      evaluatedBy: String,
      evaluatedAt: Date,
      maneuvers: {
        parallelParking: { type: String, enum: ["pass", "fail", ""] },
        threePointTurn: { type: String, enum: ["pass", "fail", ""] },
        hillStart: { type: String, enum: ["pass", "fail", ""] },
        reversing: { type: String, enum: ["pass", "fail", ""] },
        emergencyStop: { type: String, enum: ["pass", "fail", ""] },
      },
      trafficRules: {
        signalUsage: { type: String, enum: ["pass", "fail", ""] },
        speedControl: { type: String, enum: ["pass", "fail", ""] },
        laneChanging: { type: String, enum: ["pass", "fail", ""] },
        intersectionHandling: { type: String, enum: ["pass", "fail", ""] },
        pedestrianAwareness: { type: String, enum: ["pass", "fail", ""] },
      },
      overallPerformance: {
        type: String,
        enum: ["excellent", "good", "satisfactory", "needs_improvement", ""],
      },
    },
    adminMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Handle model compilation to avoid "Cannot overwrite model once compiled" error
// Delete existing model if it exists and recreate it
if (mongoose.models.ExamSchedule) {
  delete mongoose.models.ExamSchedule;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.ExamSchedule) {
  delete mongoose.modelSchemas.ExamSchedule;
}

const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);

export default ExamSchedule;
