import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";
import {
  generateOTP,
  getOTPExpiration,
  sendOTPEmail,
  sendPasswordResetOTP,
  sendLoginNotificationEmail,
  verifyOTP,
} from "../services/otpService.js";

const router = express.Router();

// Register endpoint - Step 1: Send OTP
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required",
        type: "validation_error",
      });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        message:
          "Email already registered and verified. Please try logging in.",
        type: "duplicate_error",
      });
    }

    // Generate OTP and expiration
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    if (existingUser && !existingUser.isEmailVerified) {
      // Update existing unverified user with new OTP
      existingUser.fullName = fullName;
      existingUser.full_name = fullName;
      existingUser.password = password; // Will be hashed by pre-save hook
      existingUser.user_password = password;
      existingUser.emailOTP = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();

      console.log(
        "✅ Updated existing unverified user with new OTP:",
        email.toLowerCase()
      );
    } else {
      // Create new unverified user
      const newUser = new User({
        fullName,
        full_name: fullName,
        email: email.toLowerCase(),
        user_email: email.toLowerCase(),
        password,
        user_password: password,
        isEmailVerified: false,
        emailOTP: otp,
        otpExpires: otpExpires,
      });

      await newUser.save();
      console.log("✅ Created new unverified user:", email.toLowerCase());
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(email.toLowerCase(), fullName, otp);

    if (!emailResult.success && !emailResult.simulated) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        type: "email_error",
      });
    }

    res.status(201).json({
      message:
        "Registration initiated! Please check your email for the verification code.",
      success: true,
      requiresOTP: true,
      email: email.toLowerCase(),
      simulated: emailResult.simulated || false,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      let message = "Registration failed due to duplicate data.";

      if (duplicateField === "email" || duplicateField === "user_email") {
        message =
          "This email address is already registered. Please use a different email or try logging in.";
      } else if (duplicateField === "user_name") {
        message =
          "This username is already taken. Please choose a different username.";
      } else if (duplicateField === "nic") {
        message =
          "This NIC number is already registered. Please check your NIC number or contact support if you believe this is an error.";
      }

      return res.status(409).json({
        message: message,
        field: duplicateField,
        type: "duplicate_error",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation failed: " + validationErrors.join(", "),
        type: "validation_error",
      });
    }

    // Generic server error
    res.status(500).json({
      message:
        "An unexpected error occurred during registration. Please try again.",
      type: "server_error",
    });
  }
});

// DUPLICATE ROUTE FOR FRONTEND COMPATIBILITY: /users/signup
router.post("/users/signup", async (req, res) => {
  try {
    const {
      full_name,
      user_email,
      user_name,
      user_password,
      gender,
      contact_no,
      nic,
      nationality,
      bloodType,
    } = req.body;

    console.log(
      "🔍 HITTING /users/signup WITH OTP - Received signup request for:",
      user_email
    );

    // Check if required fields are present
    if (!full_name || !user_email || !user_password) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: ["full_name", "user_email", "user_password"].filter(
          (field) => !req.body[field]
        ),
      });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({
      $or: [
        { user_email: user_email.toLowerCase() },
        { email: user_email.toLowerCase() },
      ],
    });

    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({
        message:
          "Email already registered and verified. Please try logging in.",
        type: "duplicate_error",
      });
    }

    // Generate OTP and expiration
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    if (existingUser && !existingUser.isEmailVerified) {
      // Update existing unverified user with new OTP
      existingUser.full_name = full_name;
      existingUser.fullName = full_name;
      existingUser.user_email = user_email.toLowerCase();
      existingUser.email = user_email.toLowerCase();
      existingUser.user_name = user_name;
      existingUser.user_password = user_password; // Will be hashed by pre-save hook
      existingUser.password = user_password;
      existingUser.gender = gender;
      existingUser.contact_no = contact_no;
      existingUser.nic = nic;
      existingUser.nationality = nationality || "Ethiopian";
      existingUser.bloodType = bloodType;
      existingUser.emailOTP = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();

      console.log(
        "✅ Updated existing unverified user with new OTP:",
        user_email.toLowerCase()
      );
    } else {
      // Create new unverified user
      const newUser = new User({
        full_name,
        fullName: full_name,
        user_email: user_email.toLowerCase(),
        email: user_email.toLowerCase(),
        user_name,
        user_password: user_password, // Will be hashed by pre-save hook
        password: user_password,
        gender,
        contact_no,
        nic,
        nationality: nationality || "Ethiopian",
        bloodType: bloodType,
        isEmailVerified: false,
        emailOTP: otp,
        otpExpires: otpExpires,
      });

      await newUser.save();
      console.log("✅ Created new unverified user:", user_email.toLowerCase());
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(
      user_email.toLowerCase(),
      full_name,
      otp
    );

    if (!emailResult.success && !emailResult.simulated) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        type: "email_error",
      });
    }

    console.log("🎉 RETURNING requiresOTP: true for /users/signup");
    res.status(201).json({
      message:
        "Registration initiated! Please check your email for the verification code.",
      success: true,
      requiresOTP: true,
      email: user_email.toLowerCase(),
      simulated: emailResult.simulated || false,
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      let message = "Registration failed due to duplicate data.";

      if (duplicateField === "user_email" || duplicateField === "email") {
        message =
          "This email address is already registered. Please use a different email or try logging in.";
      } else if (duplicateField === "user_name") {
        message =
          "This username is already taken. Please choose a different username.";
      } else if (duplicateField === "nic") {
        message =
          "This NIC number is already registered. Please check your NIC number or contact support if you believe this is an error.";
      }

      return res.status(409).json({
        message: message,
        field: duplicateField,
        type: "duplicate_error",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation failed: " + validationErrors.join(", "),
        type: "validation_error",
      });
    }

    // Generic server error
    res.status(500).json({
      message:
        "An unexpected error occurred during registration. Please try again.",
      type: "server_error",
      error: error.message,
    });
  }
});

// Verify OTP endpoint - Step 2: Complete registration
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        type: "validation_error",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
        type: "user_not_found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified. Please try logging in.",
        type: "already_verified",
      });
    }

    // Verify OTP
    const otpVerification = verifyOTP(otp, user.emailOTP, user.otpExpires);

    if (!otpVerification.valid) {
      return res.status(400).json({
        message: otpVerification.reason,
        type: "invalid_otp",
      });
    }

    // Mark user as verified and clear OTP fields
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log("✅ User email verified successfully:", email.toLowerCase());

    res.status(200).json({
      message:
        "Email verified successfully! You can now log in with your credentials.",
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: "An error occurred during verification. Please try again.",
      type: "server_error",
    });
  }
});

// Resend OTP endpoint
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        type: "validation_error",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
        type: "user_not_found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified. Please try logging in.",
        type: "already_verified",
      });
    }

    // Generate new OTP and expiration
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    // Update user with new OTP
    user.emailOTP = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send new OTP email
    const emailResult = await sendOTPEmail(
      email.toLowerCase(),
      user.fullName || user.full_name,
      otp
    );

    if (!emailResult.success && !emailResult.simulated) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        type: "email_error",
      });
    }

    console.log("✅ New OTP sent to:", email.toLowerCase());

    res.status(200).json({
      message: "New verification code sent! Please check your email.",
      success: true,
      simulated: emailResult.simulated || false,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      message: "An error occurred while resending the code. Please try again.",
      type: "server_error",
    });
  }
});

// DUPLICATE ROUTES FOR FRONTEND COMPATIBILITY: /users/verify-otp and /users/resend-otp
router.post("/users/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("🔍 HITTING /users/verify-otp - Verifying OTP for:", email);

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        type: "validation_error",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
        type: "user_not_found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified. Please try logging in.",
        type: "already_verified",
      });
    }

    // Verify OTP
    const otpVerification = verifyOTP(otp, user.emailOTP, user.otpExpires);

    if (!otpVerification.valid) {
      return res.status(400).json({
        message: otpVerification.reason,
        type: "invalid_otp",
      });
    }

    // Mark user as verified and clear OTP fields
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log("✅ User email verified successfully:", email.toLowerCase());

    res.status(200).json({
      message:
        "Email verified successfully! You can now log in with your credentials.",
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: "An error occurred during verification. Please try again.",
      type: "server_error",
    });
  }
});

router.post("/users/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("🔍 HITTING /users/resend-otp - Resending OTP for:", email);

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        type: "validation_error",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
        type: "user_not_found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified. Please try logging in.",
        type: "already_verified",
      });
    }

    // Generate new OTP and expiration
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    // Update user with new OTP
    user.emailOTP = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send new OTP email
    const emailResult = await sendOTPEmail(
      email.toLowerCase(),
      user.fullName || user.full_name,
      otp
    );

    if (!emailResult.success && !emailResult.simulated) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        type: "email_error",
      });
    }

    console.log("✅ New OTP sent to:", email.toLowerCase());

    res.status(200).json({
      message: "New verification code sent! Please check your email.",
      success: true,
      simulated: emailResult.simulated || false,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      message: "An error occurred while resending the code. Please try again.",
      type: "server_error",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (isAdmin) {
      // Admin login flow
      try {
        const adminCollection = mongoose.connection.db.collection("admins");
        const admin = await adminCollection.findOne({ admin_email: email });

        if (!admin) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, admin.admin_password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token for admin
        const token = jwt.sign(
          {
            userId: admin._id.toString(),
            role: "admin",
            email: admin.admin_email,
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        );

        // Send login notification email for admin
        try {
          const loginDetails = {
            ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
            userAgent: req.get("User-Agent") || "Unknown",
          };

          console.log(
            "📧 Sending login notification email to admin:",
            admin.admin_email
          );
          const emailResult = await sendLoginNotificationEmail(
            admin.admin_email,
            admin.admin_name,
            loginDetails
          );

          if (emailResult.success) {
            console.log("✅ Admin login notification email sent successfully");
            if (emailResult.messageId) {
              console.log("📧 Email Message ID:", emailResult.messageId);
            }
          } else {
            console.error(
              "❌ Admin login notification email failed:",
              emailResult.error
            );
          }
        } catch (emailError) {
          console.error(
            "⚠️ Failed to send admin login notification email:",
            emailError.message || emailError
          );
          // Don't fail the login if email fails
        }

        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user: {
            _id: admin._id.toString(),
            admin_name: admin.admin_name,
            admin_email: admin.admin_email,
            type: "admin",
          },
        });
      } catch (adminError) {
        console.error("Admin login error:", adminError);
        return res.status(500).json({
          message: "Error during admin login. Please try again.",
          error: adminError.message,
        });
      }
    } else {
      // Regular user login flow
      try {
        // Check both possible field names for email
        const user = await User.findOne({
          $or: [
            { email: email.toLowerCase() },
            { user_email: email.toLowerCase() },
          ],
        });

        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Email verification check removed - users can login without verification

        // Check both possible field names for password
        const passwordField = user.password || user.user_password;
        if (!passwordField) {
          console.error("Password field not found in user document");
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        const isMatch = await bcrypt.compare(password, passwordField);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token for user (including examiner role)
        const userRole = user.role || "user";
        const token = jwt.sign(
          {
            userId: user._id.toString(),
            role: userRole,
            email: user.email || user.user_email,
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        );

        // Send login notification email for user
        try {
          const loginDetails = {
            ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
            userAgent: req.get("User-Agent") || "Unknown",
          };

          const userEmail = user.email || user.user_email;
          const userName = user.fullName || user.full_name;

          console.log(
            "📧 Sending login notification email to user:",
            userEmail
          );
          const emailResult = await sendLoginNotificationEmail(
            userEmail,
            userName,
            loginDetails
          );

          if (emailResult.success) {
            console.log("✅ User login notification email sent successfully");
            if (emailResult.messageId) {
              console.log("📧 Email Message ID:", emailResult.messageId);
            }
          } else {
            console.error(
              "❌ User login notification email failed:",
              emailResult.error
            );
          }
        } catch (emailError) {
          console.error(
            "⚠️ Failed to send user login notification email:",
            emailError.message || emailError
          );
          // Don't fail the login if email fails
        }

        // Use consistent field names in response
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user: {
            _id: user._id.toString(),
            full_name: user.fullName || user.full_name,
            user_email: user.email || user.user_email,
            type: userRole,
            examinerDetails:
              userRole === "examiner" ? user.examinerDetails : undefined,
            trafficPoliceDetails:
              userRole === "traffic_police"
                ? user.trafficPoliceDetails
                : undefined,
            // Additional fields for traffic police
            badgeNumber:
              userRole === "traffic_police"
                ? user.trafficPoliceDetails?.badgeNumber
                : undefined,
            department:
              userRole === "traffic_police"
                ? user.trafficPoliceDetails?.department
                : undefined,
            rank:
              userRole === "traffic_police"
                ? user.trafficPoliceDetails?.rank
                : undefined,
            jurisdiction:
              userRole === "traffic_police"
                ? user.trafficPoliceDetails?.jurisdiction
                : undefined,
          },
        });
      } catch (userError) {
        console.error("User login error:", userError);
        return res.status(500).json({
          message: "Error during user login. Please try again.",
          error: userError.message,
        });
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login. Please try again.",
      error: error.message,
    });
  }
});

// Email verification routes removed - no longer needed

// Logout endpoint
router.post("/logout", (req, res) => {
  // Since we're using localStorage for auth, just return success
  res.status(200).json({ message: "Logged out successfully" });
});

// Forgot Password - Step 1: Send OTP to email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("🔍 Forgot password request for:", email);

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        type: "validation_error",
      });
    }

    // Find user by email
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
        type: "user_not_found",
      });
    }

    // Check if user is verified and has completed registration
    if (!user.isEmailVerified) {
      return res.status(400).json({
        message:
          "Please verify your email first before resetting password. If you haven't signed up yet, please create an account first.",
        type: "email_not_verified",
      });
    }

    // Check if user has a password set (indicating they've completed registration)
    if (!user.password) {
      return res.status(400).json({
        message:
          "Account setup incomplete. Please complete your registration first.",
        type: "registration_incomplete",
      });
    }

    // Additional check: ensure user has basic profile information
    if (!user.fullName && !user.full_name) {
      return res.status(400).json({
        message:
          "Account profile incomplete. Please complete your registration first.",
        type: "profile_incomplete",
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    // Update user with password reset OTP
    user.passwordResetOTP = otp;
    user.passwordResetExpires = otpExpires;
    await user.save();

    // Send password reset OTP email
    const emailResult = await sendPasswordResetOTP(
      email.toLowerCase(),
      user.fullName || user.full_name,
      otp
    );

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again.",
        type: "email_error",
      });
    }

    console.log("✅ Password reset OTP sent to:", email.toLowerCase());

    res.status(200).json({
      message: "Password reset code sent to your email!",
      success: true,
      simulated: emailResult.simulated || false,
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
      type: "server_error",
    });
  }
});

// Forgot Password - Step 2: Verify OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("🔍 Verifying password reset OTP for:", email);

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        type: "validation_error",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        type: "user_not_found",
      });
    }

    // Check if OTP exists and is not expired
    if (!user.passwordResetOTP || !user.passwordResetExpires) {
      return res.status(400).json({
        message: "No password reset request found. Please request a new one.",
        type: "no_reset_request",
      });
    }

    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        message: "Password reset code has expired. Please request a new one.",
        type: "otp_expired",
      });
    }

    // Verify OTP
    if (user.passwordResetOTP !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid password reset code",
        type: "invalid_otp",
      });
    }

    console.log("✅ Password reset OTP verified for:", email.toLowerCase());

    res.status(200).json({
      message: "Password reset code verified successfully!",
      success: true,
    });
  } catch (error) {
    console.error("❌ Verify reset OTP error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
      type: "server_error",
    });
  }
});

// Forgot Password - Step 3: Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    console.log("🔍 Resetting password for:", email);

    // Validate required fields
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
        type: "validation_error",
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        type: "password_mismatch",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        type: "weak_password",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { user_email: email.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        type: "user_not_found",
      });
    }

    // Verify OTP one more time
    if (!user.passwordResetOTP || !user.passwordResetExpires) {
      return res.status(400).json({
        message: "No password reset request found. Please request a new one.",
        type: "no_reset_request",
      });
    }

    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        message: "Password reset code has expired. Please request a new one.",
        type: "otp_expired",
      });
    }

    if (user.passwordResetOTP !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid password reset code",
        type: "invalid_otp",
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.user_password = hashedPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log("✅ Password reset successfully for:", email.toLowerCase());

    res.status(200).json({
      message:
        "Password reset successfully! You can now login with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
      type: "server_error",
    });
  }
});

export default router;
