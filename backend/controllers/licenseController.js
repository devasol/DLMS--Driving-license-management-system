import mongoose from "mongoose";
import LicenseApplication from "../models/LicenseApplication.js";
import License from "../models/License.js";
import { createNotificationHelper } from "./notificationController.js";
import ActivityLogger from "../utils/activityLogger.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Submit a new application
export const submitApplication = async (req, res) => {
  try {
    const applicationData = req.body;
    console.log(
      "Processing license application for:",
      applicationData.firstName,
      applicationData.lastName
    );

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "nationality",
      "phoneNumber",
      "email",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
      "licenseType",
    ];

    const missingFields = [];
    requiredFields.forEach((field) => {
      if (!applicationData[field] || applicationData[field].trim() === "") {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: missingFields,
        errors: missingFields.map((field) => ({
          field,
          message: `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} is required`,
        })),
      });
    }

    // Validate required documents
    const requiredDocuments = [
      "drivingSchoolCertificate",
      "nationalId",
      "personalId",
    ];
    const missingDocuments = [];

    requiredDocuments.forEach((docType) => {
      const hasDocument =
        req.files &&
        req.files.some((file) => file.fieldname === `documents[${docType}]`);
      if (!hasDocument) {
        missingDocuments.push(docType);
      }
    });

    if (missingDocuments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required documents",
        missingDocuments: missingDocuments,
        errors: missingDocuments.map((doc) => ({
          field: doc,
          message: `${doc
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} is required`,
        })),
      });
    }

    // Process uploaded documents
    const documents = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Extract document type from fieldname
        const fieldName = file.fieldname;
        if (fieldName.startsWith("documents[") && fieldName.endsWith("]")) {
          const docType = fieldName.replace("documents[", "").replace("]", "");
          documents[docType] = {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
          };
        }
      });
    }

    // Add documents to application data
    applicationData.documents = documents;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicationData.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        errors: [
          { field: "email", message: "Please enter a valid email address" },
        ],
      });
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (
      !phoneRegex.test(applicationData.phoneNumber.replace(/[\s\-\(\)]/g, ""))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
        errors: [
          {
            field: "phoneNumber",
            message: "Please enter a valid phone number",
          },
        ],
      });
    }

    // Create a new application document
    const newApplication = new LicenseApplication(applicationData);
    await newApplication.save();

    console.log("Application saved successfully:", newApplication._id);

    // Log activity
    try {
      await ActivityLogger.logLicenseApplication(
        applicationData.userId,
        "submitted",
        newApplication._id,
        {
          licenseType: applicationData.licenseType,
          firstName: applicationData.firstName,
          lastName: applicationData.lastName,
        }
      );
    } catch (error) {
      console.error("Error logging license application activity:", error);
    }

    // Create notification for user
    try {
      await createNotificationHelper(
        applicationData.userId,
        "License Application Submitted",
        `Your license application has been submitted successfully. Application ID: ${newApplication._id}. We will review your application and notify you of the status.`,
        "success",
        "/dashboard/applications"
      );
      console.log("✅ Application submission notification created");
    } catch (notificationError) {
      console.error("❌ Error creating notification:", notificationError);
      // Don't fail the application submission if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: newApplication,
    });
  } catch (error) {
    console.error("Error submitting application:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry",
        error: "An application with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message,
    });
  }
};

// Get all applications (for admin)
export const getAllApplications = async (req, res) => {
  try {
    console.log("Fetching all license applications...");

    // Use direct MongoDB access to ensure we're getting data
    const db = mongoose.connection.db;
    const applications = await db
      .collection("licenseapplications")
      .find({})
      .sort({ applicationDate: -1 })
      .toArray();

    console.log(`Found ${applications.length} applications`);

    if (applications.length === 0) {
      console.log("No applications found in the database");
    } else {
      console.log(
        "First application:",
        JSON.stringify(applications[0]).substring(0, 200) + "..."
      );
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching all applications:", error);
    res.status(500).json({
      message: "Error fetching all applications",
      error: error.message,
    });
  }
};

// Get pending applications (for admin)
export const getPendingApplications = async (req, res) => {
  try {
    console.log("Fetching pending license applications...");

    // Use direct MongoDB access to ensure we're getting data
    const db = mongoose.connection.db;
    const applications = await db
      .collection("licenseapplications")
      .find({ status: { $in: ["pending", "under_review"] } })
      .sort({ applicationDate: -1 })
      .toArray();

    console.log(`Found ${applications.length} pending applications`);

    if (applications.length === 0) {
      console.log("No pending applications found in the database");
    } else {
      console.log(
        "First pending application:",
        JSON.stringify(applications[0]).substring(0, 200) + "..."
      );
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    res.status(500).json({
      message: "Error fetching pending applications",
      error: error.message,
    });
  }
};

// Get user applications
export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching applications for user:", userId);

    // First check if the collection exists and has any documents
    const totalCount = await LicenseApplication.countDocuments();
    console.log("Total applications in database:", totalCount);

    // Find applications for this specific user
    const applications = await LicenseApplication.find({ userId }).sort({
      applicationDate: -1,
    });

    console.log(`Found ${applications.length} applications for user ${userId}`);

    if (applications.length > 0) {
      console.log(
        "First application:",
        JSON.stringify(applications[0]).substring(0, 200) + "..."
      );
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    res.status(500).json({
      message: "Error fetching user applications",
      error: error.message,
    });
  }
};

// Get single application
export const getApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await LicenseApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      message: "Error fetching application",
      error: error.message,
    });
  }
};

// Get application details (for admin)
export const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await LicenseApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json({
      message: "Error fetching application details",
      error: error.message,
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, statusMessage, reviewNotes, adminId } = req.body;

    console.log(`Updating application ${applicationId} status to ${status}`);

    const updateData = {
      status,
      statusMessage: statusMessage || `Application ${status}`,
      lastUpdated: new Date(),
    };

    // Add review notes if provided
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }

    // Add admin info if provided
    if (adminId) {
      updateData.reviewedBy = adminId;
      updateData.reviewedAt = new Date();
    }

    const updatedApplication = await LicenseApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    console.log(`Application ${applicationId} status updated to ${status}`);

    // Create notification for user about status change
    try {
      let notificationTitle = "";
      let notificationMessage = "";
      let notificationType = "info";

      switch (status) {
        case "approved":
          notificationTitle = "License Application Approved";
          notificationMessage = `Great news! Your license application has been approved. ${
            statusMessage || "You can now proceed to the next steps."
          }`;
          notificationType = "success";
          break;
        case "rejected":
          notificationTitle = "License Application Rejected";
          notificationMessage = `Your license application has been rejected. ${
            statusMessage || "Please review the requirements and resubmit."
          }`;
          notificationType = "error";
          break;
        case "under_review":
          notificationTitle = "Application Under Review";
          notificationMessage = `Your license application is now under review. ${
            statusMessage || "We will notify you once the review is complete."
          }`;
          notificationType = "info";
          break;
        default:
          notificationTitle = "Application Status Updated";
          notificationMessage = `Your license application status has been updated to: ${status}. ${
            statusMessage || ""
          }`;
          notificationType = "info";
      }

      await createNotificationHelper(
        updatedApplication.userId,
        notificationTitle,
        notificationMessage,
        notificationType,
        "/dashboard/applications"
      );
      console.log("✅ Status update notification created");
    } catch (notificationError) {
      console.error(
        "❌ Error creating status notification:",
        notificationError
      );
      // Don't fail the status update if notification fails
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application status",
      error: error.message,
    });
  }
};

// Mark application as under review
export const markApplicationUnderReview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminId } = req.body;

    console.log(`Marking application ${applicationId} as under review`);

    const updatedApplication = await LicenseApplication.findByIdAndUpdate(
      applicationId,
      {
        status: "under_review",
        statusMessage: "Application is currently under review by admin",
        reviewedBy: adminId || "admin",
        reviewedAt: new Date(),
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    console.log(`Application ${applicationId} marked as under review`);

    res.status(200).json({
      success: true,
      message: "Application marked as under review",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error marking application under review:", error);
    res.status(500).json({
      success: false,
      message: "Error marking application under review",
      error: error.message,
    });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    console.log(`Deleting application ${applicationId}`);

    const deletedApplication = await LicenseApplication.findByIdAndDelete(
      applicationId
    );

    if (!deletedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    console.log(`Application ${applicationId} deleted successfully`);

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
      data: deletedApplication,
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting application",
      error: error.message,
    });
  }
};

// Update application
export const updateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const updateData = req.body;

    console.log(`Updating application ${applicationId}`);

    // Add lastUpdated timestamp
    updateData.lastUpdated = new Date();

    // Validate required fields if they're being updated
    const requiredFields = ["firstName", "lastName", "email", "phoneNumber"];
    for (const field of requiredFields) {
      if (
        updateData[field] !== undefined &&
        (!updateData[field] || updateData[field].trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
          error: `Invalid ${field}`,
        });
      }
    }

    const updatedApplication = await LicenseApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    console.log(`Application ${applicationId} updated successfully`);

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating application",
      error: error.message,
    });
  }
};

// Debug endpoint to list collections and document counts
export const listCollections = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    // Get document counts for each collection
    const collectionCounts = {};
    const relevantCollections = {};

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      collectionCounts[collection.name] = count;

      // Check if this is a relevant collection for our application
      if (
        collection.name.toLowerCase().includes("license") ||
        collection.name.toLowerCase().includes("application") ||
        collection.name.toLowerCase().includes("user")
      ) {
        relevantCollections[collection.name] = count;
      }
    }

    res.status(200).json({
      collections: collections.map((c) => c.name),
      counts: collectionCounts,
      relevantCollections,
    });
  } catch (error) {
    console.error("Error listing collections:", error);
    res.status(500).json({
      message: "Error listing collections",
      error: error.message,
    });
  }
};

// Get license status for a user
export const getLicenseStatus = async (req, res) => {
  try {
    const { userId, userEmail } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        hasLicense: false,
      });
    }

    console.log(`🔍 [FIXED] Fetching license status for user: ${userId}`);

    // Try multiple ways to find the license to ensure we don't miss it
    let license = null;

    console.log(
      `🔍 [FIXED] Starting license search for userId: ${userId} (type: ${typeof userId})`
    );
    if (userEmail) {
      console.log(`📧 [FIXED] Also searching by email: ${userEmail}`);
    }

    // Method 1: Direct search with original userId
    try {
      license = await License.findOne({ userId: userId });
      console.log(
        `🔍 Method 1 (Direct): ${
          license ? `Found ${license.number}` : "Not found"
        }`
      );
    } catch (error) {
      console.log(`🔍 Method 1 error: ${error.message}`);
    }

    // Method 2: ObjectId conversion if valid and not found
    if (!license && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        license = await License.findOne({
          userId: new mongoose.Types.ObjectId(userId),
        });
        console.log(
          `🔍 Method 2 (ObjectId): ${
            license ? `Found ${license.number}` : "Not found"
          }`
        );
      } catch (error) {
        console.log(`🔍 Method 2 error: ${error.message}`);
      }
    }

    // Method 3: String conversion
    if (!license) {
      try {
        license = await License.findOne({ userId: userId.toString() });
        console.log(
          `🔍 Method 3 (String): ${
            license ? `Found ${license.number}` : "Not found"
          }`
        );
      } catch (error) {
        console.log(`🔍 Method 3 error: ${error.message}`);
      }
    }

    // Method 4: Search by user email
    if (!license && userEmail) {
      try {
        license = await License.findOne({ userEmail: userEmail });
        console.log(
          `🔍 Method 4 (Email): ${
            license ? `Found ${license.number}` : "Not found"
          }`
        );
      } catch (error) {
        console.log(`🔍 Method 4 error: ${error.message}`);
      }
    }

    // Method 5: Manual search through all licenses (last resort)
    if (!license) {
      try {
        console.log(`🔍 Method 5: Manual search through all licenses...`);
        const allLicenses = await License.find({}).select(
          "userId userName userEmail number"
        );
        console.log(
          `📊 Found ${allLicenses.length} total licenses in database`
        );

        for (const lic of allLicenses) {
          const licUserIdStr = lic.userId.toString();
          const searchUserIdStr = userId.toString();

          if (licUserIdStr === searchUserIdStr) {
            license = lic;
            console.log(
              `🔍 Method 5 (Manual match): Found ${license.number} by string comparison`
            );
            break;
          }

          // Also try email match
          if (userEmail && lic.userEmail === userEmail) {
            license = lic;
            console.log(
              `🔍 Method 5 (Email match): Found ${license.number} by email`
            );
            break;
          }
        }

        if (!license) {
          console.log(
            `🔍 Method 5: No matches found in ${allLicenses.length} licenses`
          );
          // Log first few licenses for debugging
          allLicenses.slice(0, 3).forEach((lic, index) => {
            console.log(
              `   ${index + 1}. License ${lic.number}: userId=${
                lic.userId
              }, email=${lic.userEmail}`
            );
          });
        }
      } catch (error) {
        console.log(`🔍 Method 5 error: ${error.message}`);
      }
    }

    if (!license) {
      console.log(`❌ No license found for user ${userId} using any method`);
      return res.status(404).json({
        success: false,
        message: "No license found for this user",
        hasLicense: false,
      });
    }

    console.log(
      `✅ License found: ${license.number} for user ${license.userName}`
    );

    // Populate additional data if needed
    if (!license.userId || !license.issuedBy) {
      license = await License.findById(license._id)
        .populate(
          "userId",
          "fullName full_name email user_email nationality bloodType dateOfBirth dob address gender"
        )
        .populate("issuedBy", "fullName full_name email user_email");
    }

    // Check if license is expired
    const currentDate = new Date();
    const expiryDate = new Date(license.expiryDate);
    let status = license.status;

    // Auto-update status if expired
    if (expiryDate < currentDate && status === "Valid") {
      status = "Expired";
      await License.findByIdAndUpdate(license._id, { status: "Expired" });
    }

    // Format dates for display
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    };

    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil(
      (expiryDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    const licenseData = {
      success: true,
      hasLicense: true,
      number: license.number,
      userName: license.userName,
      userEmail: license.userEmail,
      class: license.class,
      issueDate: formatDate(license.issueDate),
      expiryDate: formatDate(license.expiryDate),
      status: status,
      restrictions: license.restrictions || "None",
      points: license.points || 0,
      maxPoints: license.maxPoints || 12,
      daysUntilExpiry: daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 90 && daysUntilExpiry > 0, // Expiring within 90 days
      isExpired: daysUntilExpiry <= 0,
      theoryExamScore: license.theoryExamResult?.score,
      practicalExamScore: license.practicalExamResult?.score,
      issuedBy: license.issuedBy?.fullName || license.issuedBy?.full_name,
      // Additional personal information for license ID card
      nationality: license.userId?.nationality || "Ethiopian",
      bloodType: license.userId?.bloodType,
      dateOfBirth: license.userId?.dateOfBirth || license.userId?.dob,
      address: license.userId?.address,
      gender: license.userId?.gender,
    };

    console.log(
      `✅ [FIXED] License found: ${license.number} - Status: ${status}`
    );
    console.log(
      `✅ [FIXED] Sending response:`,
      JSON.stringify(licenseData, null, 2)
    );
    res.json(licenseData);
  } catch (error) {
    console.error("Error fetching license status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching license status",
      error: error.message,
    });
  }
};

export const getApplicationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching application status for user:", userId);

    // Find the most recent application for this user
    const application = await LicenseApplication.findOne({ userId }).sort({
      applicationDate: -1,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found for this user",
      });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching application status",
      error: error.message,
    });
  }
};

// Serve document files
export const serveDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    console.log("Serving document:", filename);

    // Construct the file path
    const documentsDir = path.join(process.cwd(), "uploads/documents");
    const filePath = path.join(documentsDir, filename);

    console.log("Documents directory:", documentsDir);
    console.log("Full file path:", filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log("File not found at path:", filePath);

      // List files in the directory for debugging
      try {
        const files = fs.readdirSync(documentsDir);
        console.log("Available files in documents directory:", files);
      } catch (dirError) {
        console.log("Could not read documents directory:", dirError.message);
      }

      return res.status(404).json({
        success: false,
        message: "Document not found",
        requestedFile: filename,
        searchPath: filePath,
      });
    }

    // Get file stats for content length
    const stats = fs.statSync(filePath);
    console.log("File stats:", { size: stats.size, isFile: stats.isFile() });

    // Set appropriate headers based on file type
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
    }

    console.log("Content type:", contentType);

    // Set headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    // Stream the file
    const fileStream = fs.createReadStream(filePath);

    fileStream.on("error", (streamError) => {
      console.error("Error reading file stream:", streamError);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error reading file",
          error: streamError.message,
        });
      }
    });

    fileStream.on("open", () => {
      console.log("File stream opened successfully");
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving document:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error serving document",
        error: error.message,
      });
    }
  }
};

// Debug endpoint to check user license data
export const debugUserLicense = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("🔍 Debug: Checking license for user ID:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Try to find license by userId
    let license = await License.findOne({ userId: userId });

    if (!license && mongoose.Types.ObjectId.isValid(userId)) {
      // Try with ObjectId conversion
      license = await License.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    if (!license) {
      // Try string conversion
      license = await License.findOne({ userId: userId.toString() });
    }

    const response = {
      success: true,
      userId: userId,
      licenseExists: !!license,
      licenseNumber: license ? license.number : null,
      licenseStatus: license ? license.status : null,
      licenseClass: license ? license.class : null,
      userName: license ? license.userName : null,
      userEmail: license ? license.userEmail : null,
      issueDate: license ? license.issueDate : null,
      expiryDate: license ? license.expiryDate : null,
      debugInfo: {
        searchMethods: {
          directSearch: !!(await License.findOne({ userId: userId })),
          objectIdSearch: mongoose.Types.ObjectId.isValid(userId)
            ? !!(await License.findOne({
                userId: new mongoose.Types.ObjectId(userId),
              }))
            : false,
          stringSearch: !!(await License.findOne({
            userId: userId.toString(),
          })),
        },
        totalLicenses: await License.countDocuments(),
        allLicenseUserIds: (await License.find({}).select("userId number")).map(
          (l) => ({ userId: l.userId, number: l.number })
        ),
      },
    };

    console.log("🔍 Debug response:", response);

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    return res.status(500).json({
      success: false,
      message: "Debug endpoint error",
      error: error.message,
    });
  }
};

// License verification for QR code scanning
export const verifyLicense = async (req, res) => {
  try {
    const { licenseNumber } = req.params;

    console.log(`🔍 Verifying license: ${licenseNumber}`);

    // Find the license by number
    const license = await License.findOne({ number: licenseNumber }).populate(
      "userId",
      "fullName email profilePicture dateOfBirth address phone nationality bloodType"
    );

    if (!license) {
      console.log(`❌ License not found: ${licenseNumber}`);
      return res.status(404).json({
        success: false,
        message: "License not found",
        valid: false,
      });
    }

    console.log(`✅ License found: ${license.number} for ${license.userName}`);

    // Check if license is expired
    const currentDate = new Date();
    const expiryDate = new Date(license.expiryDate);
    const isExpired = currentDate > expiryDate;
    const daysUntilExpiry = Math.ceil(
      (expiryDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    // Get user photo as base64 for display
    let userPhotoURL = "";
    if (license.userId.profilePicture) {
      try {
        // Handle different profile picture path formats
        let photoPath;
        if (license.userId.profilePicture.startsWith("/uploads/")) {
          photoPath = path.join(
            process.cwd(),
            license.userId.profilePicture.substring(1)
          );
        } else if (license.userId.profilePicture.startsWith("uploads/")) {
          photoPath = path.join(process.cwd(), license.userId.profilePicture);
        } else {
          photoPath = path.join(
            process.cwd(),
            "uploads",
            "profile-pictures",
            license.userId.profilePicture
          );
        }

        if (fs.existsSync(photoPath)) {
          const photoData = fs.readFileSync(photoPath);
          const photoExt = path
            .extname(license.userId.profilePicture)
            .toLowerCase();
          let mimeType = "image/jpeg";
          if (photoExt === ".png") mimeType = "image/png";
          if (photoExt === ".gif") mimeType = "image/gif";
          if (photoExt === ".webp") mimeType = "image/webp";

          userPhotoURL = `data:${mimeType};base64,${photoData.toString(
            "base64"
          )}`;
          console.log("✅ User photo loaded for verification");
        }
      } catch (photoError) {
        console.error(
          "❌ Error loading user photo for verification:",
          photoError
        );
      }
    }

    // Format the verification response
    const verificationData = {
      success: true,
      valid: true,
      license: {
        number: license.number,
        class: license.class,
        status: license.status,
        issueDate: new Date(license.issueDate).toLocaleDateString("en-GB"),
        expiryDate: new Date(license.expiryDate).toLocaleDateString("en-GB"),
        isExpired: isExpired,
        daysUntilExpiry: daysUntilExpiry,
        restrictions: license.restrictions || "None",
        points: license.points || 0,
      },
      holder: {
        name: license.userName,
        email: license.userEmail,
        dateOfBirth: license.userId.dateOfBirth
          ? new Date(license.userId.dateOfBirth).toLocaleDateString("en-GB")
          : "N/A",
        address: license.userId.address || "N/A",
        phone: license.userId.phone || "N/A",
        photo: userPhotoURL || null,
        hasPhoto: !!userPhotoURL,
      },
      verification: {
        verifiedAt: new Date().toISOString(),
        verificationMethod: "QR Code Scan",
        authentic: true,
        securityLevel: "High",
      },
    };

    console.log(`✅ License verification successful for ${license.number}`);
    res.json(verificationData);
  } catch (error) {
    console.error("❌ License verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying license",
      valid: false,
      error: error.message,
    });
  }
};

// Get violations for a specific user (for user dashboard)
export const getUserViolations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    console.log(`🔍 Fetching violations for user: ${userId}`);

    // Find the user's license
    const license = await License.findOne({ userId })
      .populate("violations.recordedBy", "fullName email")
      .select("violations points maxPoints");

    if (!license) {
      console.log(`❌ No license found for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: "License not found for this user",
        violations: [],
        totalPoints: 0,
      });
    }

    console.log(
      `✅ Found license with ${license.violations?.length || 0} violations`
    );

    // Format violations data
    const violations = license.violations || [];
    const totalPoints = violations.reduce(
      (sum, violation) => sum + (violation.points || 0),
      0
    );

    // Format the response
    const formattedViolations = violations.map((violation) => ({
      _id: violation._id,
      type: violation.type,
      points: violation.points,
      description: violation.description || "",
      location: violation.location || "",
      date: violation.date,
      recordedBy: violation.recordedBy
        ? {
            fullName: violation.recordedBy.fullName || "Unknown",
            email: violation.recordedBy.email || "",
          }
        : null,
    }));

    res.json({
      success: true,
      violations: formattedViolations,
      totalPoints: totalPoints,
      maxPoints: license.maxPoints || 12,
      remainingPoints: Math.max(0, (license.maxPoints || 12) - totalPoints),
    });
  } catch (error) {
    console.error("❌ Error getting user violations:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user violations",
      violations: [],
      totalPoints: 0,
      error: error.message,
    });
  }
};

// All functions are already exported individually with 'export const'
