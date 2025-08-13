import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import {
  generateOTP,
  getOTPExpiration,
  sendOTPEmail,
  sendLoginNotificationEmail,
  verifyOTP,
} from "../services/otpService.js";

const router = express.Router();

// Debug route to test if auth routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working" });
});

// Signup route - Step 1: Send OTP
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
    } = req.body;

    console.log("Received signup request for:", user_email);

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
router.post("/users/verify-otp", async (req, res) => {
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
router.post("/users/resend-otp", async (req, res) => {
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

// Login route
router.post("/users/login", async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    console.log(
      `Received ${isAdmin ? "admin" : "user"} login request for:`,
      email
    );

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (isAdmin) {
      // Admin login flow
      console.log("Processing admin login");

      try {
        // Try both "admin" and "admins" collections
        const db = mongoose.connection.db;
        let admin = null;

        // First try "admins" collection
        try {
          admin = await db.collection("admins").findOne({ admin_email: email });
        } catch (err) {
          console.log("Error querying 'admins' collection:", err.message);
        }

        // If not found, try "admin" collection
        if (!admin) {
          try {
            admin = await db
              .collection("admin")
              .findOne({ admin_email: email });
          } catch (err) {
            console.log("Error querying 'admin' collection:", err.message);
          }
        }

        if (!admin) {
          console.log("Admin not found for email:", email);
          return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("Admin found:", admin.admin_name || admin.admin_username);

        // Check if admin_password exists
        if (!admin.admin_password) {
          console.error("Admin password field is undefined");
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.admin_password);
        if (!isMatch) {
          console.log("Password doesn't match for admin");
          return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("Admin password verified");

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
            admin.admin_name || admin.admin_username,
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

        // Return success with admin info
        return res.status(200).json({
          message: "Login successful",
          user: {
            _id: admin._id.toString(),
            admin_name: admin.admin_name || admin.admin_username,
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
        // Find user by email - check both possible field names
        const user = await User.findOne({
          $or: [
            { user_email: email.toLowerCase() },
            { email: email.toLowerCase() },
          ],
        });

        if (!user) {
          console.log("User not found for email:", email);
          return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("User found:", user.full_name || user.fullName);

        // Email verification check removed - users can login without verification

        // Check if user_password exists - handle both possible field names
        const passwordField = user.user_password || user.password;
        if (!passwordField) {
          console.error("User password field is undefined");
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, passwordField);
        if (!isMatch) {
          console.log("Password doesn't match for user");
          return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("User password verified");

        // Send login notification email for user
        try {
          const loginDetails = {
            ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
            userAgent: req.get("User-Agent") || "Unknown",
          };

          const userEmail = user.user_email || user.email;
          const userName = user.full_name || user.fullName;

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

        // Return success with user info
        return res.status(200).json({
          message: "Login successful",
          user: {
            _id: user._id.toString(),
            full_name: user.full_name || user.fullName,
            user_email: user.user_email || user.email,
            type: "user", // Explicitly set type to "user"
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

// Add admin login route
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Processing admin login for:", email);

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Try both "admin" and "admins" collections
    const db = mongoose.connection.db;
    let admin = null;

    // First try "admins" collection
    try {
      admin = await db.collection("admins").findOne({ admin_email: email });
    } catch (err) {
      console.log("Error querying 'admins' collection:", err.message);
    }

    // If not found, try "admin" collection
    if (!admin) {
      try {
        admin = await db.collection("admin").findOne({ admin_email: email });
      } catch (err) {
        console.log("Error querying 'admin' collection:", err.message);
      }
    }

    // If still not found, try users collection with admin role
    if (!admin) {
      try {
        admin = await User.findOne({
          $or: [
            { email: email, role: "admin" },
            { user_email: email, role: "admin" },
            { email: email, isAdmin: true },
            { user_email: email, isAdmin: true },
          ],
        });
      } catch (err) {
        console.log("Error querying users with admin role:", err.message);
      }
    }

    if (!admin) {
      console.log("Admin not found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(
      "Admin found:",
      admin.admin_name ||
        admin.admin_username ||
        admin.fullName ||
        admin.full_name
    );

    // Check password field - handle different field names
    const passwordField =
      admin.admin_password || admin.password || admin.user_password;
    if (!passwordField) {
      console.error("Admin password field is undefined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, passwordField);
    if (!isMatch) {
      console.log("Password doesn't match for admin");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Admin password verified");

    // Send login notification email for admin
    try {
      const loginDetails = {
        ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
        userAgent: req.get("User-Agent") || "Unknown",
      };

      const adminEmail = admin.admin_email || admin.email || admin.user_email;
      const adminName =
        admin.admin_name ||
        admin.admin_username ||
        admin.fullName ||
        admin.full_name;

      console.log("📧 Sending login notification email to admin:", adminEmail);
      const emailResult = await sendLoginNotificationEmail(
        adminEmail,
        adminName,
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

    // Return success with admin info
    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: admin._id.toString(),
        admin_name:
          admin.admin_name ||
          admin.admin_username ||
          admin.fullName ||
          admin.full_name,
        admin_email: admin.admin_email || admin.email || admin.user_email,
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
});

// Traffic Police login route
router.post("/traffic-police/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Processing traffic police login for:", email);

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find traffic police user
    const trafficPolice = await User.findOne({
      $or: [
        { user_email: email.toLowerCase() },
        { email: email.toLowerCase() },
      ],
      role: "traffic_police",
    });

    if (!trafficPolice) {
      console.log("Traffic police not found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(
      "Traffic police found:",
      trafficPolice.full_name || trafficPolice.fullName
    );

    // Check password
    const passwordField = trafficPolice.user_password || trafficPolice.password;
    if (!passwordField) {
      console.error("Traffic police password field is undefined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const isPasswordValid = await bcrypt.compare(password, passwordField);
    if (!isPasswordValid) {
      console.log("Invalid password for traffic police:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if traffic police is active
    if (
      trafficPolice.trafficPoliceDetails &&
      !trafficPolice.trafficPoliceDetails.isActive
    ) {
      return res
        .status(401)
        .json({
          message: "Account is deactivated. Please contact your supervisor.",
        });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: trafficPolice._id,
        role: "traffic_police",
        badgeNumber: trafficPolice.trafficPoliceDetails?.badgeNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("✅ Traffic police login successful");

    // Return success response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: trafficPolice._id,
        fullName: trafficPolice.full_name || trafficPolice.fullName,
        email: trafficPolice.user_email || trafficPolice.email,
        role: trafficPolice.role,
        badgeNumber: trafficPolice.trafficPoliceDetails?.badgeNumber,
        department: trafficPolice.trafficPoliceDetails?.department,
        rank: trafficPolice.trafficPoliceDetails?.rank,
        jurisdiction: trafficPolice.trafficPoliceDetails?.jurisdiction,
      },
    });
  } catch (error) {
    console.error("Traffic police login error:", error);
    res.status(500).json({
      message: "Error during login. Please try again.",
      error: error.message,
    });
  }
});

export default router;
