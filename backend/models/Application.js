import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    licenseType: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "E"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "processing"],
      default: "pending",
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    documents: {
      idProof: String,
      photo: String,
      medicalCertificate: String,
      addressProof: String,
    },
    restrictions: {
      type: String,
      default: "None",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Create the model
const Application = mongoose.model("Application", applicationSchema);

// Export as default
export default Application;
