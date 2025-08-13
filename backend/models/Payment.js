import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 500, // License fee in Ethiopian Birr
  },
  currency: {
    type: String,
    default: "ETB", // Ethiopian Birr
  },
  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "telebirr", "cbe_birr", "cash", "other"],
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  receiptImage: {
    type: String, // URL/path to uploaded receipt image
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  adminNotes: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: {
    type: Date,
  },
  theoryExamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamSchedule",
    required: true,
  },
  practicalExamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamSchedule",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
