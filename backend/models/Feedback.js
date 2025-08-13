import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    feedback: { type: String, required: true }, // This will be the emoji rating description
    rating: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High'],
      required: true
    },
    writtenFeedback: { type: String }, // New field for written feedback
    userEmail: { type: String },
    userId: { type: String }, // Add userId for better tracking
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'addressed'],
      default: 'pending'
    },
    adminResponse: { type: String },
    category: {
      type: String,
      enum: ['service', 'system', 'staff', 'other'],
      default: 'other'
    }
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
