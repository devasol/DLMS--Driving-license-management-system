import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One license per user
    },
    number: {
      type: String,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
      enum: [
        "Category1", // Motorcycle License
        "Category2", // Three-Wheel Motorcycle License
        "Category3", // Automobile License
        "Category4-PublicI", // Public Transport - up to 20 seats
        "Category4-PublicII", // Public Transport - up to 45 seats
        "Category4-PublicIII", // Public Transport - beyond 45 seats
        "Category5-TruckI", // Truck - up to 3,500 kg
        "Category5-TruckII", // Truck without trailers or with crane
        "Category5-TruckIII", // Truck with/without trailers or cranes
        "Category6-FuelI", // Fuel tanker - up to 18,000 liters
        "Category6-FuelII", // Liquid-tank vehicles with/without trailer
        "Category7", // Machinery Operator License
      ],
      default: "Category3", // Standard automobile license
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["Valid", "Expired", "Suspended", "Revoked"],
      default: "Valid",
    },
    restrictions: {
      type: String,
      default: "None",
    },
    points: {
      type: Number,
      default: 0,
    },
    maxPoints: {
      type: Number,
      default: 12,
    },
    // New fields for payment and exam tracking
    theoryExamResult: {
      examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamSchedule",
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      dateTaken: {
        type: Date,
        required: true,
      },
    },
    practicalExamResult: {
      examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamSchedule",
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      dateTaken: {
        type: Date,
        required: true,
      },
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who issued the license
      required: true,
    },
    digitalSignature: {
      type: String, // Hash or signature for verification
    },
    qrCode: {
      type: String, // QR code for digital verification
    },
    violations: [
      {
        type: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          required: true,
        },
        description: String,
        location: String,
        date: {
          type: Date,
          default: Date.now,
        },
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate license number before saving
licenseSchema.pre("save", async function (next) {
  try {
    // Generate license number if not provided
    if (!this.number) {
      const year = new Date().getFullYear();
      const count = await mongoose.model("License").countDocuments();
      this.number = `ETH-${year}-${String(count + 1).padStart(6, "0")}`;
    }

    // Set expiry date (5 years from issue date) if not provided
    if (!this.expiryDate && this.issueDate) {
      this.expiryDate = new Date(
        this.issueDate.getTime() + 5 * 365 * 24 * 60 * 60 * 1000
      );
    }

    // Ensure required fields are set
    if (!this.number) {
      throw new Error("License number could not be generated");
    }
    if (!this.expiryDate) {
      throw new Error("License expiry date could not be set");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Index for faster queries
licenseSchema.index({ userId: 1 });
licenseSchema.index({ number: 1 });
licenseSchema.index({ status: 1 });

// Create the model
const License = mongoose.model("License", licenseSchema);

// Export as default
export default License;
