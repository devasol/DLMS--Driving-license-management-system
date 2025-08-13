import LicenseRenewal from "../models/LicenseRenewal.js";
import License from "../models/License.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Submit license renewal application
export const submitRenewalApplication = async (req, res) => {
  try {
    const { name, email, password, renewalReason } = req.body;

    console.log("📝 Submitting license renewal application:", {
      name,
      email,
      renewalReason,
      hasFile: !!req.file,
      bodyKeys: Object.keys(req.body),
      fileInfo: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype
      } : null
    });

    // Validate required fields
    if (!name || !email || !password || !renewalReason) {
      console.log("❌ Missing required fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
        renewalReason: !!renewalReason,
        nameValue: name,
        emailValue: email,
        passwordValue: password ? '[HIDDEN]' : password,
        renewalReasonValue: renewalReason
      });
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, and renewal reason",
        missingFields: {
          name: !name,
          email: !email,
          password: !password,
          renewalReason: !renewalReason
        }
      });
    }

    // Check if license document was uploaded
    // Since we're using uploadAny, files are in req.files array
    console.log("📁 File upload info:", {
      hasReqFile: !!req.file,
      hasReqFiles: !!req.files,
      filesLength: req.files ? req.files.length : 0,
      files: req.files ? req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, mimetype: f.mimetype })) : []
    });

    let uploadedFile = null;

    if (req.file) {
      // Single file upload
      uploadedFile = req.file;
    } else if (req.files && req.files.length > 0) {
      // Multiple files upload - get the first one (or find licenseDocument)
      uploadedFile = req.files.find(f => f.fieldname === 'licenseDocument') || req.files[0];
    }

    if (!uploadedFile) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "Please upload your current license document (image or PDF)",
      });
    }

    console.log("✅ File found:", {
      fieldname: uploadedFile.fieldname,
      originalname: uploadedFile.originalname,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size
    });

    // Validate file type (images and PDFs only)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain' // Allow for testing
    ];

    if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
      console.log("❌ Invalid file type:", uploadedFile.mimetype);
      return res.status(400).json({
        success: false,
        message: "Please upload a valid image (JPEG, PNG, GIF) or PDF file",
      });
    }

    // Find user by email
    console.log("🔍 Looking for user with email:", email);
    const user = await User.findOne({
      $or: [
        { email: email },
        { user_email: email }
      ]
    });

    if (!user) {
      console.log("❌ User not found with email:", email);
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    console.log("✅ User found:", {
      id: user._id,
      email: user.email || user.user_email,
      hasPassword: !!(user.password || user.user_password)
    });

    // Verify password
    const userPassword = user.password || user.user_password;

    if (!userPassword) {
      console.log("❌ User has no password set");
      return res.status(400).json({
        success: false,
        message: "User account has no password set. Please contact support.",
      });
    }

    if (!password) {
      console.log("❌ No password provided in request");
      return res.status(400).json({
        success: false,
        message: "Password is required for verification",
      });
    }

    console.log("🔐 Comparing passwords...", {
      providedPasswordLength: password ? password.length : 'undefined',
      storedPasswordLength: userPassword ? userPassword.length : 'undefined',
      providedPasswordType: typeof password,
      storedPasswordType: typeof userPassword
    });

    // Double-check before bcrypt.compare to prevent the "Illegal arguments" error
    if (typeof password !== 'string' || typeof userPassword !== 'string') {
      console.log("❌ Invalid password types for comparison:", {
        passwordType: typeof password,
        userPasswordType: typeof userPassword
      });
      return res.status(500).json({
        success: false,
        message: "Internal error: Invalid password data types",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, userPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Find current license
    const currentLicense = await License.findOne({ userId: user._id });

    if (!currentLicense) {
      return res.status(404).json({
        success: false,
        message: "No existing license found for this user",
      });
    }

    // Check if there's already a pending renewal application
    const existingRenewal = await LicenseRenewal.findOne({
      userId: user._id,
      status: { $in: ["pending", "under_review"] },
    });

    if (existingRenewal) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending renewal application",
      });
    }

    // Create renewal application
    const renewalApplication = new LicenseRenewal({
      userId: user._id,
      name,
      email,
      password: userPassword, // Store the hashed password for verification
      currentLicenseDocument: {
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        path: uploadedFile.path,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
      },
      renewalReason,
      status: "pending",
    });

    await renewalApplication.save();

    res.json({
      success: true,
      message: "License renewal application submitted successfully",
      renewalId: renewalApplication._id,
    });
  } catch (error) {
    console.error("Error submitting renewal application:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting renewal application",
      error: error.message,
    });
  }
};

// Get user's renewal applications
export const getUserRenewalApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📋 Fetching renewal applications for user:", userId);

    const renewals = await LicenseRenewal.find({ userId })
      .populate("reviewedBy", "fullName full_name email user_email")
      .sort({ submissionDate: -1 });

    console.log("✅ Found", renewals.length, "renewal applications for user");

    res.json(renewals);
  } catch (error) {
    console.error("Error fetching user renewal applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching renewal applications",
      error: error.message,
    });
  }
};

// Get all renewal applications (Admin)
export const getAllRenewalApplications = async (req, res) => {
  try {
    console.log("📋 Fetching all renewal applications");

    const renewals = await LicenseRenewal.find()
      .populate("userId", "fullName full_name email user_email phone contact_no")
      .populate("reviewedBy", "fullName full_name email user_email")
      .sort({ submissionDate: -1 });

    res.json({
      success: true,
      renewals,
    });
  } catch (error) {
    console.error("Error fetching renewal applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching renewal applications",
      error: error.message,
    });
  }
};

// Get pending renewal applications (Admin)
export const getPendingRenewalApplications = async (req, res) => {
  try {
    console.log("📋 Fetching pending renewal applications");

    const renewals = await LicenseRenewal.find({ status: "pending" })
      .populate("userId", "fullName full_name email user_email phone contact_no")
      .sort({ submissionDate: -1 });

    res.json({
      success: true,
      renewals,
    });
  } catch (error) {
    console.error("Error fetching pending renewal applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending renewal applications",
      error: error.message,
    });
  }
};

// Update renewal application status (Admin)
export const updateRenewalStatus = async (req, res) => {
  try {
    const { renewalId } = req.params;
    const { status, adminNotes, adminId } = req.body;

    console.log(`🔄 Updating renewal ${renewalId} status to ${status}`);

    const renewal = await LicenseRenewal.findByIdAndUpdate(
      renewalId,
      {
        status,
        adminNotes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate("userId", "fullName full_name email user_email");

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal application not found",
      });
    }

    res.json({
      success: true,
      message: `Renewal application ${status} successfully`,
      renewal,
    });
  } catch (error) {
    console.error("Error updating renewal status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating renewal status",
      error: error.message,
    });
  }
};

// Issue renewed license (Admin)
export const issueRenewedLicense = async (req, res) => {
  try {
    const { renewalId } = req.params;
    const { adminId } = req.body;

    console.log(`🎫 Issuing renewed license for renewal ${renewalId}`);

    const renewal = await LicenseRenewal.findById(renewalId).populate("userId");

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal application not found",
      });
    }

    if (renewal.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Renewal must be approved before issuing license",
      });
    }

    // Find current license
    const currentLicense = await License.findOne({ userId: renewal.userId._id });

    if (!currentLicense) {
      return res.status(404).json({
        success: false,
        message: "Current license not found",
      });
    }

    // Generate new license number
    const year = new Date().getFullYear();
    const count = await License.countDocuments();
    const newLicenseNumber = `ETH-${year}-${String(count + 1).padStart(6, "0")}`;

    // Update license with new expiry date and number
    const newIssueDate = new Date();
    const newExpiryDate = new Date(newIssueDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000)); // 5 years

    await License.findByIdAndUpdate(currentLicense._id, {
      number: newLicenseNumber,
      issueDate: newIssueDate,
      expiryDate: newExpiryDate,
      status: "Valid",
      issuedBy: adminId,
    });

    // Update renewal record
    await LicenseRenewal.findByIdAndUpdate(renewalId, {
      newLicenseNumber,
      newLicenseIssued: true,
    });

    res.json({
      success: true,
      message: "Renewed license issued successfully",
      newLicenseNumber,
      newExpiryDate,
    });
  } catch (error) {
    console.error("Error issuing renewed license:", error);
    res.status(500).json({
      success: false,
      message: "Error issuing renewed license",
      error: error.message,
    });
  }
};
