import mongoose from "mongoose";
import User from "../models/User.js";
import License from "../models/License.js";
import Notification from "../models/Notification.js";
import Application from "../models/Application.js";
import LicenseApplication from "../models/LicenseApplication.js";
import ExamResult from "../models/ExamResult.js";
import Exam from "../models/Exam.js";
import UserActivity from "../models/UserActivity.js";
import ExamSchedule from "../models/examSchedule.js";
import Report from "../models/Report.js";

// Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Initialize counters
    let totalUsers = 0;
    let totalApplications = 0;
    let pendingApplications = 0;
    let approvedApplications = 0;
    let rejectedApplications = 0;

    try {
      // Count all users from the User model
      const modelUserCount = await User.countDocuments();
      console.log(`User model count: ${modelUserCount}`);

      // Also try direct collection access to count all users
      const db = mongoose.connection.db;
      const collectionUserCount = await db.collection("users").countDocuments();
      console.log(`Direct collection count: ${collectionUserCount}`);

      // Use the higher count (in case there are users in the collection not captured by the model)
      totalUsers = Math.max(modelUserCount, collectionUserCount);

      // Count license applications
      if (await db.listCollections({ name: "licenseapplications" }).hasNext()) {
        totalApplications = await db
          .collection("licenseapplications")
          .countDocuments();
        pendingApplications = await db
          .collection("licenseapplications")
          .countDocuments({
            status: { $in: ["pending", "under_review"] },
          });
        approvedApplications = await db
          .collection("licenseapplications")
          .countDocuments({
            status: "approved",
          });
        rejectedApplications = await db
          .collection("licenseapplications")
          .countDocuments({
            status: "rejected",
          });
      }
    } catch (error) {
      console.error("Error counting documents:", error);
    }

    // Return dashboard stats
    res.json({
      totalUsers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      message: "Error getting dashboard statistics",
      error: error.message,
    });
  }
};

// User management
export const getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users from database");

    // Initialize users array
    let users = [];
    let errorMessages = [];

    // Try to use the User model first
    try {
      const modelUsers = await User.find({})
        .select("-password -user_password") // Exclude password fields
        .sort({ createdAt: -1 });

      console.log(`Found ${modelUsers.length} users using User model`);
      users = modelUsers;
    } catch (modelError) {
      console.error("Error using User model:", modelError);
      errorMessages.push(`Model error: ${modelError.message}`);
    }

    // If model approach returns no users, try direct collection access
    if (users.length === 0) {
      try {
        const db = mongoose.connection.db;

        // Check if the users collection exists
        const collections = await db
          .listCollections({ name: "users" })
          .toArray();
        if (collections.length > 0) {
          const collectionUsers = await db
            .collection("users")
            .find({})
            .toArray();
          console.log(
            `Found ${collectionUsers.length} users using direct collection access`
          );
          users = collectionUsers;
        } else {
          console.log("Users collection does not exist");
          errorMessages.push("Users collection does not exist");
        }
      } catch (collectionError) {
        console.error("Error using direct collection access:", collectionError);
        errorMessages.push(`Collection error: ${collectionError.message}`);
      }
    }

    // If still no users, try to check if there's a different collection name
    if (users.length === 0) {
      try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log(
          "Available collections:",
          collections.map((c) => c.name)
        );

        // Look for collections that might contain user data
        const userCollections = collections.filter(
          (c) =>
            c.name.toLowerCase().includes("user") ||
            c.name.toLowerCase().includes("admin") ||
            c.name.toLowerCase().includes("account")
        );

        console.log(
          "Potential user collections:",
          userCollections.map((c) => c.name)
        );

        // Try each potential user collection
        for (const collection of userCollections) {
          try {
            const collUsers = await db
              .collection(collection.name)
              .find({})
              .toArray();
            console.log(
              `Found ${collUsers.length} documents in ${collection.name}`
            );

            if (collUsers.length > 0) {
              users = collUsers;
              console.log(`Using ${collection.name} collection for users`);
              break;
            }
          } catch (err) {
            console.error(`Error accessing ${collection.name}:`, err);
          }
        }
      } catch (err) {
        console.error("Error listing collections:", err);
        errorMessages.push(`Collection listing error: ${err.message}`);
      }
    }

    // If we still have no users, try to seed some test data
    if (users.length === 0) {
      console.log("No users found in any collection. Creating test users...");

      try {
        // Create test users directly in the database
        const db = mongoose.connection.db;

        // Check if users collection exists, create it if not
        const collections = await db
          .listCollections({ name: "users" })
          .toArray();
        if (collections.length === 0) {
          console.log("Creating users collection");
          await db.createCollection("users");
        }

        // Insert test users
        const testUsers = [
          {
            fullName: "Test Admin",
            email: "admin@example.com",
            role: "admin",
            phone: "1234567890",
            address: "123 Admin St",
            createdAt: new Date(),
          },
          {
            fullName: "Test User",
            email: "user@example.com",
            role: "user",
            phone: "0987654321",
            address: "456 User Ave",
            createdAt: new Date(),
          },
        ];

        const result = await db.collection("users").insertMany(testUsers);
        console.log(`Created ${result.insertedCount} test users`);

        // Retrieve the newly created users
        users = await db.collection("users").find({}).toArray();
      } catch (seedError) {
        console.error("Error seeding test users:", seedError);
        errorMessages.push(`Seeding error: ${seedError.message}`);
      }
    }

    // Map the response to a consistent format
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      fullName:
        user.fullName ||
        user.full_name ||
        user.user_name ||
        user.admin_name ||
        "Unknown",
      email: user.email || user.user_email || user.admin_email || "No Email",
      role: user.role || (user.isAdmin ? "admin" : "user"),
      phone: user.phone || user.contact_no || "No Phone",
      address: user.address || "No Address",
      dateOfBirth: user.dateOfBirth || user.dob || null,
      createdAt: user.createdAt || user.created_at || new Date(),
    }));

    console.log(`Returning ${formattedUsers.length} formatted users`);

    // Include debug info in development environment
    const response = {
      users: formattedUsers,
      debug: {
        totalFound: users.length,
        errors: errorMessages,
        collections: await mongoose.connection.db
          .listCollections()
          .toArray()
          .then((cols) => cols.map((c) => c.name)),
        connectionState: mongoose.connection.readyState,
      },
    };

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    console.log(`Fetching user with ID: ${req.params.id}`);

    let user;
    try {
      // For admin viewing, include password information
      user = await User.findById(req.params.id);
    } catch (modelError) {
      console.error("Error using User model:", modelError);

      // If model approach fails, try direct collection access
      try {
        const db = mongoose.connection.db;
        user = await db.collection("users").findOne({
          _id: new mongoose.Types.ObjectId(req.params.id),
        });
      } catch (collectionError) {
        console.error("Error using direct collection access:", collectionError);
      }
    }

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    // Format user data (including password for admin viewing)
    const formattedUser = {
      _id: user._id,
      fullName: user.fullName || user.full_name || user.user_name,
      email: user.email || user.user_email,
      role: user.role || (user.isAdmin ? "admin" : "user"),
      phone: user.phone || user.contact_no,
      address: user.address,
      dateOfBirth: user.dateOfBirth || user.dob,
      password: user.user_password || user.password || "No password set",
      createdAt: user.createdAt || user.created_at,
    };

    res.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    console.log(`Updating user with ID: ${req.params.id}`);
    console.log("Update data:", req.body);

    const { id } = req.params;
    const updates = req.body;

    // Handle password update separately if provided
    let passwordUpdate = {};
    if (updates.password && updates.password.trim() !== "") {
      // Validate password length
      if (updates.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      // Store password in the correct field name used by the database
      passwordUpdate.user_password = updates.password;
    }

    // Remove password from main updates object
    delete updates.password;
    delete updates.user_password;

    // Combine updates with password update if provided
    const finalUpdates = { ...updates, ...passwordUpdate };

    let updatedUser;
    try {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: finalUpdates },
        { new: true, runValidators: true }
      ).select("-password -user_password");
    } catch (modelError) {
      console.error("Error using User model for update:", modelError);

      // If model approach fails, try direct collection access
      try {
        const db = mongoose.connection.db;
        await db
          .collection("users")
          .updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: finalUpdates }
          );

        // Fetch the updated user
        updatedUser = await db.collection("users").findOne({
          _id: new mongoose.Types.ObjectId(id),
        });
      } catch (collectionError) {
        console.error(
          "Error using direct collection access for update:",
          collectionError
        );
        return res.status(500).json({
          message: "Error updating user",
          error: collectionError.message,
        });
      }
    }

    if (!updatedUser) {
      console.log("User not found for update");
      return res.status(404).json({ message: "User not found" });
    }

    // Format the response
    const formattedUser = {
      _id: updatedUser._id,
      fullName:
        updatedUser.fullName || updatedUser.full_name || updatedUser.user_name,
      email: updatedUser.email || updatedUser.user_email,
      role: updatedUser.role || (updatedUser.isAdmin ? "admin" : "user"),
      phone: updatedUser.phone || updatedUser.contact_no,
      address: updatedUser.address,
      dateOfBirth: updatedUser.dateOfBirth || updatedUser.dob,
      createdAt: updatedUser.createdAt || updatedUser.created_at,
    };

    console.log("User updated successfully");
    res.json(formattedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    console.log(`Deleting user with ID: ${req.params.id}`);

    let result;
    try {
      result = await User.findByIdAndDelete(req.params.id);
    } catch (modelError) {
      console.error("Error using User model for deletion:", modelError);

      // If model approach fails, try direct collection access
      try {
        const db = mongoose.connection.db;
        result = await db.collection("users").deleteOne({
          _id: new mongoose.Types.ObjectId(req.params.id),
        });
      } catch (collectionError) {
        console.error(
          "Error using direct collection access for deletion:",
          collectionError
        );
        return res.status(500).json({
          message: "Error deleting user",
          error: collectionError.message,
        });
      }
    }

    if (!result) {
      console.log("User not found for deletion");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User deleted successfully");
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Application management
export const getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: "pending" })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    res.status(500).json({ message: "Error fetching pending applications" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, statusMessage } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: {
          status,
          statusMessage,
          reviewedBy: req.userId,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    ).populate("userId", "fullName email");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Create notification for the user
    await Notification.create({
      userId: application.userId._id,
      title: `License Application ${
        status.charAt(0).toUpperCase() + status.slice(1)
      }`,
      message: statusMessage || `Your license application has been ${status}.`,
      type:
        status === "approved"
          ? "success"
          : status === "rejected"
          ? "error"
          : "info",
      seen: false,
    });

    // If approved, create or update license
    if (status === "approved") {
      const licenseData = {
        userId: application.userId._id,
        number: `DL-${Date.now().toString().slice(-8)}`,
        class: application.licenseType,
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
        status: "Valid",
        restrictions: application.restrictions || "None",
        points: 0,
        maxPoints: 12,
      };

      await License.findOneAndUpdate(
        { userId: application.userId._id },
        { $set: licenseData },
        { upsert: true, new: true }
      );
    }

    res.json(application);
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Error updating application status" });
  }
};

// Exam management
export const getAllExams = async (req, res) => {
  try {
    console.log("Fetching all exams from database");

    // Make sure you're using the correct model name here
    // This should match your MongoDB collection name
    const exams = await Exam.find()
      .populate("userId", "fullName email")
      .sort({ date: 1, time: 1 });

    console.log(`Found ${exams.length} exams`);

    // If no exams are found, return an empty array instead of an error
    res.json(exams || []);
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({
      message: "Error fetching exams",
      error: error.message,
    });
  }
};

export const scheduleExam = async (req, res) => {
  try {
    const { userId, examType, date, time, location, instructor } = req.body;

    if (!userId || !examType || !date || !time || !location) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: [
          "userId",
          "examType",
          "date",
          "time",
          "location",
        ].filter((field) => !req.body[field]),
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exam = await Exam.create({
      userId,
      examType,
      date,
      time,
      location,
      instructor: instructor || "To be assigned",
      status: "scheduled",
    });

    // Create notification for the user
    await Notification.create({
      userId,
      title: `${
        examType.charAt(0).toUpperCase() + examType.slice(1)
      } Exam Scheduled`,
      message: `Your ${examType} exam has been scheduled for ${date} at ${time}, ${location}.`,
      type: "info",
      seen: false,
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error("Error scheduling exam:", error);
    res.status(500).json({ message: "Error scheduling exam" });
  }
};

export const updateExamStatus = async (req, res) => {
  try {
    const { examId } = req.params;
    const { status, result, notes } = req.body;

    if (!["scheduled", "completed", "cancelled", "no-show"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const exam = await Exam.findByIdAndUpdate(
      examId,
      {
        $set: {
          status,
          result,
          notes,
          updatedBy: req.userId,
        },
      },
      { new: true }
    ).populate("userId", "fullName email");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Create notification for the user
    let notificationMessage = "";
    let notificationType = "info";

    if (status === "completed") {
      notificationMessage = `Your ${exam.examType} exam is complete. ${
        result === "pass"
          ? "Congratulations, you passed!"
          : "Unfortunately, you did not pass."
      }`;
      notificationType = result === "pass" ? "success" : "error";
    } else if (status === "cancelled") {
      notificationMessage = `Your ${exam.examType} exam scheduled for ${exam.date} has been cancelled.`;
      notificationType = "warning";
    } else if (status === "no-show") {
      notificationMessage = `You missed your ${exam.examType} exam scheduled for ${exam.date}.`;
      notificationType = "error";
    }

    if (notificationMessage) {
      await Notification.create({
        userId: exam.userId._id,
        title: `Exam ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: notificationMessage,
        type: notificationType,
        seen: false,
      });
    }

    res.json(exam);
  } catch (error) {
    console.error("Error updating exam status:", error);
    res.status(500).json({ message: "Error updating exam status" });
  }
};

// Violations management
export const recordViolation = async (req, res) => {
  try {
    const { userId, violationType, points, description, date, location } =
      req.body;

    if (!userId || !violationType || points === undefined) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: ["userId", "violationType", "points"].filter(
          (field) => req.body[field] === undefined
        ),
      });
    }

    // Find the user's license or create a default one
    let license = await License.findOne({ userId });
    if (!license) {
      // Create a default license for the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a license number
      const licenseCount = await License.countDocuments();
      const licenseNumber = `DL${String(licenseCount + 1).padStart(6, "0")}`;

      license = new License({
        userId,
        number: licenseNumber,
        userName: user.fullName || user.email,
        userEmail: user.email,
        class: "B", // Default to Class B
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
        status: "Valid",
        points: 0,
        maxPoints: 12,
        // Required fields - using dummy data for violations system
        theoryExamResult: {
          examId: new mongoose.Types.ObjectId(), // Dummy exam ID
          score: 85,
          dateTaken: new Date(),
        },
        practicalExamResult: {
          examId: new mongoose.Types.ObjectId(), // Dummy exam ID
          score: 90,
          dateTaken: new Date(),
        },
        paymentId: new mongoose.Types.ObjectId(), // Dummy payment ID
        issuedBy: req.userId, // Admin who is adding the violation
        violations: [],
      });

      await license.save();
      console.log(
        `Created default license ${licenseNumber} for user ${
          user.fullName || user.email
        }`
      );
    }

    // Update points
    const newPoints = Math.min(license.points + points, license.maxPoints);
    const updatedLicense = await License.findByIdAndUpdate(
      license._id,
      {
        $set: { points: newPoints },
        $push: {
          violations: {
            type: violationType,
            points,
            description,
            location,
            date: date || new Date(),
            recordedBy: req.userId,
          },
        },
      },
      { new: true }
    );

    // Create notification for the user
    await Notification.create({
      userId: license.userId,
      title: "Traffic Violation Recorded",
      message: `A ${violationType} violation has been recorded against your license. ${points} demerit points added.`,
      type: "warning",
      seen: false,
    });

    res.json(updatedLicense);
  } catch (error) {
    console.error("Error recording violation:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Error recording violation",
      error: error.message,
    });
  }
};

// Get all violations
export const getAllViolations = async (req, res) => {
  try {
    const licenses = await License.find({
      violations: { $exists: true, $ne: [] },
    })
      .populate("userId", "fullName email userName")
      .populate("violations.recordedBy", "fullName email")
      .select("userId number violations");

    const allViolations = [];
    licenses.forEach((license) => {
      license.violations.forEach((violation) => {
        allViolations.push({
          _id: violation._id,
          licenseNumber: license.number,
          userId: license.userId,
          type: violation.type,
          points: violation.points,
          description: violation.description,
          location: violation.location,
          date: violation.date,
          recordedBy: violation.recordedBy,
        });
      });
    });

    // Sort by date (newest first)
    allViolations.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allViolations);
  } catch (error) {
    console.error("Error getting all violations:", error);
    res.status(500).json({ message: "Error getting violations" });
  }
};

// Get violations for a specific user
export const getUserViolations = async (req, res) => {
  try {
    const { userId } = req.params;

    const license = await License.findOne({ userId })
      .populate("violations.recordedBy", "fullName email")
      .select("violations");

    if (!license) {
      return res
        .status(404)
        .json({ message: "License not found for this user" });
    }

    res.json(license.violations || []);
  } catch (error) {
    console.error("Error getting user violations:", error);
    res.status(500).json({ message: "Error getting user violations" });
  }
};

// Update a violation
export const updateViolation = async (req, res) => {
  try {
    const { violationId } = req.params;
    const { violationType, points, description, location, date } = req.body;

    const license = await License.findOne({ "violations._id": violationId });
    if (!license) {
      return res.status(404).json({ message: "Violation not found" });
    }

    const violation = license.violations.id(violationId);
    const oldPoints = violation.points;

    // Update violation details
    violation.type = violationType || violation.type;
    violation.points = points !== undefined ? points : violation.points;
    violation.description = description || violation.description;
    violation.location = location || violation.location;
    violation.date = date || violation.date;

    // Update license points
    const pointsDifference = violation.points - oldPoints;
    license.points = Math.max(
      0,
      Math.min(license.points + pointsDifference, license.maxPoints)
    );

    await license.save();

    res.json(license);
  } catch (error) {
    console.error("Error updating violation:", error);
    res.status(500).json({ message: "Error updating violation" });
  }
};

// Delete a violation
export const deleteViolation = async (req, res) => {
  try {
    const { violationId } = req.params;

    const license = await License.findOne({ "violations._id": violationId });
    if (!license) {
      return res.status(404).json({ message: "Violation not found" });
    }

    const violation = license.violations.id(violationId);
    const violationPoints = violation.points;

    // Remove violation and update points
    license.violations.pull(violationId);
    license.points = Math.max(0, license.points - violationPoints);

    await license.save();

    res.json({ message: "Violation deleted successfully" });
  } catch (error) {
    console.error("Error deleting violation:", error);
    res.status(500).json({ message: "Error deleting violation" });
  }
};

// Reports
export const getReports = async (req, res) => {
  try {
    console.log("📊 Report request received:", req.query);
    console.log("🔥 UPDATED VERSION - DEBUG ENABLED");
    const { reportType, startDate, endDate } = req.query;

    let report = [];
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    console.log("📅 Date range:", { start, end, reportType });

    // Validate report type
    if (!reportType) {
      return res.status(400).json({ message: "Report type is required" });
    }

    switch (reportType) {
      case "applications":
        // Try LicenseApplication first, then Application model
        try {
          const licenseAppCount = await LicenseApplication.countDocuments();
          if (licenseAppCount > 0) {
            report = await LicenseApplication.aggregate([
              {
                $match: {
                  applicationDate: { $gte: start, $lte: end },
                },
              },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ]);
          } else {
            throw new Error("No LicenseApplication documents found");
          }
        } catch (error) {
          console.log("Using Application model instead");
          report = await Application.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
              },
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ]);
        }
        break;

      case "exams":
        // Try Exam first, then ExamResult
        try {
          const examCount = await Exam.countDocuments();
          if (examCount > 0) {
            report = await Exam.aggregate([
              {
                $match: {
                  date: { $gte: start, $lte: end },
                },
              },
              {
                $group: {
                  _id: {
                    status: "$status",
                    type: "$examType",
                  },
                  count: { $sum: 1 },
                },
              },
            ]);
          } else {
            throw new Error("No Exam documents found");
          }
        } catch (error) {
          console.log("Using ExamResult model instead");
          report = await ExamResult.aggregate([
            {
              $match: {
                dateTaken: { $gte: start, $lte: end },
              },
            },
            {
              $group: {
                _id: {
                  type: "$examType",
                  passed: "$passed",
                },
                count: { $sum: 1 },
                averageScore: { $avg: "$score" },
              },
            },
          ]);
        }
        break;

      case "violations":
        report = await License.aggregate([
          {
            $unwind: "$violations",
          },
          {
            $match: {
              "violations.date": { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: "$violations.type",
              count: { $sum: 1 },
              totalPoints: { $sum: "$violations.points" },
            },
          },
        ]);
        break;

      case "licenses":
        report = await License.aggregate([
          {
            $match: {
              issueDate: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                status: "$status",
                class: "$class",
              },
              count: { $sum: 1 },
            },
          },
        ]);
        break;

      case "users":
        console.log("🔍 Processing users report case");
        try {
          console.log("📊 Executing users aggregation...");
          report = await User.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
              },
            },
            {
              $project: {
                _id: 1,
                fullName: {
                  $cond: {
                    if: "$fullName",
                    then: "$fullName",
                    else: "$full_name",
                  },
                },
                email: {
                  $cond: {
                    if: "$email",
                    then: "$email",
                    else: "$user_email",
                  },
                },
                role: 1,
                isEmailVerified: 1,
                createdAt: 1,
                status: {
                  $cond: {
                    if: "$isEmailVerified",
                    then: "verified",
                    else: "pending",
                  },
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
          ]);
          console.log(
            "✅ Users aggregation completed, result count:",
            report.length
          );
          console.log("📋 Sample result:", report.slice(0, 1));
        } catch (error) {
          console.error("❌ Error in users aggregation:", error);
          // Fallback to simple grouping if individual records fail
          console.log("🔄 Falling back to simple user count aggregation");
          report = await User.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ]);
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    console.log("✅ Report generated successfully:", {
      reportType,
      recordCount: report.length,
      sampleData: report.slice(0, 2),
    });

    // Save the report to database
    try {
      const reportTitle = `${
        reportType.charAt(0).toUpperCase() + reportType.slice(1)
      } Report`;
      const reportDescription = `Generated report for ${reportType} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;

      // Calculate basic statistics
      const statistics = calculateReportStatistics(reportType, report);

      const savedReport = new Report({
        reportType,
        title: reportTitle,
        description: reportDescription,
        startDate: start,
        endDate: end,
        generatedBy: req.userId,
        generatedByName: req.userEmail,
        data: report,
        totalRecords: report.length,
        fileSize: JSON.stringify(report).length, // Approximate size
        metadata: {
          statistics,
          filters: { startDate, endDate },
          summary: `${report.length} records found`,
        },
      });

      await savedReport.save();
      console.log("💾 Report saved to database:", savedReport._id);
    } catch (saveError) {
      console.error("⚠️ Error saving report to database:", saveError);
      // Continue with response even if save fails
    }

    res.json({
      reportType,
      startDate: start,
      endDate: end,
      data: report,
      totalRecords: report.length,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("❌ Error generating report:", error);
    res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
};

// Helper function to calculate report statistics
const calculateReportStatistics = (reportType, data) => {
  const stats = {
    totalRecords: data.length,
    reportType,
  };

  switch (reportType) {
    case "users":
      const verifiedUsers = data.filter((user) => user.isVerified).length;
      stats.verifiedUsers = verifiedUsers;
      stats.pendingUsers = data.length - verifiedUsers;
      break;

    case "applications":
      const statusCounts = data.reduce((acc, app) => {
        acc[app.status || "Unknown"] = (acc[app.status || "Unknown"] || 0) + 1;
        return acc;
      }, {});
      stats.statusBreakdown = statusCounts;
      break;

    case "exams":
      const passedExams = data.filter(
        (exam) => exam.passed || exam.result === "Pass"
      ).length;
      stats.passedExams = passedExams;
      stats.failedExams = data.length - passedExams;
      break;

    case "payments":
      const totalAmount = data.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );
      stats.totalAmount = totalAmount;
      stats.averageAmount = data.length > 0 ? totalAmount / data.length : 0;
      break;

    case "violations":
      const totalFines = data.reduce(
        (sum, violation) => sum + (violation.fine || 0),
        0
      );
      stats.totalFines = totalFines;
      stats.averageFine = data.length > 0 ? totalFines / data.length : 0;
      break;
  }

  return stats;
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Get all saved reports
export const getSavedReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      reportType,
      status = "generated",
    } = req.query;

    const filter = { status };
    if (reportType && reportType !== "all") {
      filter.reportType = reportType;
    }

    const reports = await Report.find(filter)
      .select("-data") // Exclude large data field for list view
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add formatted file size to each report
    const reportsWithFormattedSize = reports.map((report) => ({
      ...report.toObject(),
      formattedFileSize: formatFileSize(report.fileSize),
    }));

    const total = await Report.countDocuments(filter);

    res.json({
      reports: reportsWithFormattedSize,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalReports: total,
    });
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    res.status(500).json({ message: "Error fetching saved reports" });
  }
};

// Get a specific saved report with data
export const getSavedReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update download count and last downloaded
    report.downloadCount += 1;
    report.lastDownloaded = new Date();
    await report.save();

    res.json(report);
  } catch (error) {
    console.error("Error fetching saved report:", error);
    res.status(500).json({ message: "Error fetching saved report" });
  }
};

// Delete a saved report
export const deleteSavedReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if admin owns the report or is super admin
    if (
      report.generatedBy.toString() !== req.userId.toString() &&
      req.userRole !== "super_admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this report" });
    }

    await Report.findByIdAndDelete(id);

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting saved report:", error);
    res.status(500).json({ message: "Error deleting saved report" });
  }
};

// Get Admin Activity
export const getAdminActivity = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const activities = [];

    // Models are now imported at the top of the file

    try {
      // Get recent user activities
      const recentActivities = await UserActivity.find({ isVisible: true })
        .populate("userId", "fullName full_name email user_email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      // Transform activities to match frontend format
      for (const activity of recentActivities) {
        if (activity.userId) {
          const userName =
            activity.userId.fullName ||
            activity.userId.full_name ||
            "Unknown User";
          const userEmail =
            activity.userId.email || activity.userId.user_email || "";

          activities.push({
            id: activity._id,
            type: activity.activityType,
            action: activity.action,
            user: userName,
            userEmail: userEmail,
            timestamp: activity.createdAt,
            description: activity.description,
            details: activity.details,
            severity: activity.severity,
            status: activity.status,
          });
        }
      }

      // If no activities from database, get recent registrations
      if (activities.length === 0) {
        const recentUsers = await User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("fullName full_name email user_email createdAt")
          .lean();

        for (const user of recentUsers) {
          const userName = user.fullName || user.full_name || "Unknown User";
          const userEmail = user.email || user.user_email || "";

          activities.push({
            id: `user_${user._id}`,
            type: "user",
            action: "registered",
            user: userName,
            userEmail: userEmail,
            timestamp: user.createdAt,
            description: "New user registration",
            details: { registrationDate: user.createdAt },
            severity: "low",
            status: "success",
          });
        }
      }

      // Get recent license applications
      try {
        const recentApplications = await LicenseApplication.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        for (const app of recentApplications) {
          // Use the name from the application itself, not from populated user
          const userName = `${app.firstName} ${app.lastName}`;
          const userEmail = app.email;

          activities.push({
            id: `app_${app._id}`,
            type: "application",
            action: app.status || "submitted",
            user: userName,
            userEmail: userEmail,
            timestamp: app.updatedAt || app.createdAt,
            description: `License application ${app.status || "submitted"}`,
            details: {
              licenseType: app.licenseType,
              applicationId: app._id,
              status: app.status,
            },
            severity: app.status === "rejected" ? "medium" : "low",
            status: app.status === "approved" ? "success" : "pending",
          });
        }
      } catch (err) {
        console.log("Error fetching license applications:", err.message);
      }

      // Get recent exam schedules
      try {
        const recentExams = await ExamSchedule.find()
          .populate("userId", "fullName full_name email user_email")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        for (const exam of recentExams) {
          // Use fullName from the exam schedule itself, or from populated user data
          const userName =
            exam.fullName ||
            (exam.userId
              ? exam.userId.fullName || exam.userId.full_name
              : null) ||
            "Unknown User";
          const userEmail = exam.userId
            ? exam.userId.email || exam.userId.user_email
            : "";

          activities.push({
            id: `exam_${exam._id}`,
            type: "exam",
            action: "scheduled",
            user: userName,
            userEmail: userEmail,
            timestamp: exam.createdAt,
            description: `${exam.examType} exam scheduled`,
            details: {
              examType: exam.examType,
              examDate: exam.date, // Use 'date' instead of 'examDate'
              location: exam.location,
              examId: exam._id,
            },
            severity: "low",
            status: "pending",
          });
        }
      } catch (err) {
        console.log("Error fetching exam schedules:", err.message);
      }
    } catch (dbError) {
      console.log(
        "Database connection issue, using fallback data:",
        dbError.message
      );
    }

    // Fallback mock data if no real data available
    if (activities.length === 0) {
      const mockActivities = [
        {
          id: "mock_1",
          type: "application",
          action: "submitted",
          user: "John Doe",
          userEmail: "john.doe@example.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          description: "License application submitted",
          details: { licenseType: "Class B" },
          severity: "low",
          status: "pending",
        },
        {
          id: "mock_2",
          type: "license",
          action: "approved",
          user: "Jane Smith",
          userEmail: "jane.smith@example.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          description: "License application approved",
          details: { licenseType: "Class A" },
          severity: "low",
          status: "success",
        },
        {
          id: "mock_3",
          type: "exam",
          action: "scheduled",
          user: "Mike Johnson",
          userEmail: "mike.johnson@example.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 240),
          description: "Theory exam scheduled",
          details: { examType: "Theory", location: "Test Center A" },
          severity: "low",
          status: "pending",
        },
        {
          id: "mock_4",
          type: "application",
          action: "rejected",
          user: "Sarah Williams",
          userEmail: "sarah.williams@example.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 360),
          description: "License application rejected",
          details: { licenseType: "Class C", reason: "Incomplete documents" },
          severity: "medium",
          status: "failed",
        },
        {
          id: "mock_5",
          type: "user",
          action: "registered",
          user: "Alex Brown",
          userEmail: "alex.brown@example.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 480),
          description: "New user registration",
          details: { registrationDate: new Date(Date.now() - 1000 * 60 * 480) },
          severity: "low",
          status: "success",
        },
      ];
      activities.push(...mockActivities);
    }

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json({
      success: true,
      activities: limitedActivities,
      total: activities.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin activity",
      error: error.message,
    });
  }
};

// Delete Admin Activity
export const deleteAdminActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    // UserActivity model is imported at the top of the file

    // Find and delete the activity
    const deletedActivity = await UserActivity.findByIdAndDelete(activityId);

    if (!deletedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    console.log(`Activity deleted: ${activityId}`);

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      deletedActivity: {
        id: deletedActivity._id,
        type: deletedActivity.activityType,
        action: deletedActivity.action,
      },
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting activity",
      error: error.message,
    });
  }
};
