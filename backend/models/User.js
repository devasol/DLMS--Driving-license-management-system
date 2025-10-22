import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Support both naming conventions
    fullName: { type: String },
    full_name: { type: String },

    email: { type: String },
    user_email: { type: String },

    password: { type: String },
    user_password: { type: String },

    user_name: { type: String },

    role: {
      type: String,
      enum: ["user", "admin", "examiner", "traffic_police"],
      default: "user",
    },

    phone: { type: String },
    contact_no: { type: String },

    address: { type: String },

    gender: { type: String },

    dateOfBirth: { type: Date },
    dob: { type: Date },

    nic: { type: String },

    // Additional personal information for license ID card
    nationality: {
      type: String,
      default: "Ethiopian",
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    profilePicture: { type: String }, // Store the filename/path of the profile picture

    isAdmin: { type: Boolean, default: false },

    // Examiner-specific fields
    examinerDetails: {
      employeeId: { type: String },
      certification: { type: String },
      specialization: {
        type: [String],
        enum: ["practical", "theory", "vision", "motorcycle", "heavy_vehicle"],
        default: [],
      },
      licenseToExamine: {
        type: [String],
        enum: ["A", "B", "C", "D", "E"],
        default: [],
      },
      isActive: { type: Boolean, default: true },
      hireDate: { type: Date },
      lastExamDate: { type: Date },
    },

    // Traffic Police-specific fields
    trafficPoliceDetails: {
      badgeNumber: { type: String },
      department: { type: String },
      rank: {
        type: String,
        enum: ["Officer", "Sergeant", "Lieutenant", "Captain", "Inspector"],
        default: "Officer",
      },
      jurisdiction: { type: String }, // Area of operation
      isActive: { type: Boolean, default: true },
      hireDate: { type: Date },
      lastViolationRecorded: { type: Date },
      totalViolationsRecorded: { type: Number, default: 0 },
    },

    // Email verification fields
    isEmailVerified: { type: Boolean, default: false },
    emailOTP: { type: String },
    otpExpires: { type: Date },

    // Password reset fields
    passwordResetOTP: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure we have consistent field names
userSchema.pre("save", function (next) {
  // Ensure fullName is set
  if (!this.fullName && this.full_name) {
    this.fullName = this.full_name;
  } else if (!this.full_name && this.fullName) {
    this.full_name = this.fullName;
  }

  // Ensure email is set
  if (!this.email && this.user_email) {
    this.email = this.user_email;
  } else if (!this.user_email && this.email) {
    this.user_email = this.email;
  }

  // Ensure password is set
  if (!this.password && this.user_password) {
    this.password = this.user_password;
  } else if (!this.user_password && this.password) {
    this.user_password = this.password;
  }

  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Try comparing with password field
    if (this.password) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    // Try comparing with user_password field
    if (this.user_password) {
      return await bcrypt.compare(candidatePassword, this.user_password);
    }

    return false;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

// Pre-save hook to ensure password is always hashed
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isModified("user_password")) {
    const password = this.password || this.user_password;

    // Only hash if the password doesn't look like it's already hashed
    if (
      password &&
      !password.startsWith("$2a$") &&
      !password.startsWith("$2b$")
    ) {
      console.log("Hashing password in pre-save hook");
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update both password fields
      this.password = hashedPassword;
      this.user_password = hashedPassword;
    } else {
      console.log("Password already hashed, skipping hash in pre-save hook");
    }
  }
  next();
});

// Create the model
const User = mongoose.model("User", userSchema);

// Export as default
export default User;
