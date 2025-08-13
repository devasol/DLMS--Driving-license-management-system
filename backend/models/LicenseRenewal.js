import mongoose from "mongoose";

const licenseRenewalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    nationalId: {
      type: String,
      required: false,
    },
    currentLicenseDocument: {
      filename: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      mimetype: {
        type: String,
        required: true,
      },
    },
    renewalReason: {
      type: String,
      required: true,
      enum: ["expiring", "expired", "damaged", "lost"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "under_review", "approved", "rejected"],
      default: "pending",
    },
    submissionDate: {
      type: Date,
      default: Date.now,
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
    newLicenseNumber: {
      type: String,
    },
    newLicenseIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
licenseRenewalSchema.index({ userId: 1 });
licenseRenewalSchema.index({ status: 1 });
licenseRenewalSchema.index({ submissionDate: -1 });

const LicenseRenewal = mongoose.model("LicenseRenewal", licenseRenewalSchema);

export default LicenseRenewal;
