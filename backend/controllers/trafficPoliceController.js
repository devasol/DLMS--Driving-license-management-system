import License from "../models/License.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

// Get license information by license number
export const getLicenseByNumber = async (req, res) => {
  try {
    const { licenseNumber } = req.params;

    if (!licenseNumber) {
      return res.status(400).json({ message: "License number is required" });
    }

    // Find license by number and populate user information
    const license = await License.findOne({ number: licenseNumber })
      .populate(
        "userId",
        "fullName full_name email user_email phone contact_no address gender nationality bloodType dateOfBirth dob"
      )
      .populate(
        "violations.recordedBy",
        "fullName full_name email user_email trafficPoliceDetails"
      )
      .lean();

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    // Format the response
    const response = {
      _id: license._id,
      userId: license.userId._id,
      number: license.number,
      userName: license.userName,
      userEmail: license.userEmail,
      class: license.class,
      issueDate: license.issueDate,
      expiryDate: license.expiryDate,
      status: license.status,
      restrictions: license.restrictions,
      points: license.points,
      maxPoints: license.maxPoints,
      userDetails: {
        fullName: license.userId.fullName || license.userId.full_name,
        email: license.userId.email || license.userId.user_email,
        phone: license.userId.phone || license.userId.contact_no,
        address: license.userId.address,
        gender: license.userId.gender,
        nationality: license.userId.nationality,
        bloodType: license.userId.bloodType,
        dateOfBirth: license.userId.dateOfBirth || license.userId.dob,
      },
      violations: license.violations.map((violation) => ({
        _id: violation._id,
        type: violation.type,
        points: violation.points,
        description: violation.description,
        location: violation.location,
        date: violation.date,
        recordedBy: violation.recordedBy
          ? {
              fullName:
                violation.recordedBy.fullName || violation.recordedBy.full_name,
              email:
                violation.recordedBy.email || violation.recordedBy.user_email,
              badgeNumber:
                violation.recordedBy.trafficPoliceDetails?.badgeNumber,
              department: violation.recordedBy.trafficPoliceDetails?.department,
            }
          : null,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching license:", error);
    res.status(500).json({ message: "Error fetching license information" });
  }
};

// Record a new violation
export const recordViolation = async (req, res) => {
  try {
    const {
      userId,
      licenseNumber,
      violationType,
      points,
      description,
      date,
      location,
    } = req.body;

    // Validate required fields
    if (!userId && !licenseNumber) {
      return res.status(400).json({
        message: "Either userId or licenseNumber is required",
      });
    }

    if (!violationType || points === undefined) {
      return res.status(400).json({
        message: "Violation type and points are required",
      });
    }

    // Find the license
    let license;
    if (licenseNumber) {
      license = await License.findOne({ number: licenseNumber });
    } else {
      license = await License.findOne({ userId });
    }

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    // Get the user information
    const user = await User.findById(license.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update points (ensure it doesn't exceed maximum)
    const newPoints = Math.min(license.points + points, license.maxPoints);

    // Add violation to license
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

    // Update traffic police statistics
    await User.findByIdAndUpdate(req.userId, {
      $set: {
        "trafficPoliceDetails.lastViolationRecorded": new Date(),
      },
      $inc: {
        "trafficPoliceDetails.totalViolationsRecorded": 1,
      },
    });

    // Create notification for the user
    await Notification.create({
      userId: license.userId,
      title: "Traffic Violation Recorded",
      message: `A ${violationType} violation has been recorded against your license (${license.number}). ${points} demerit points added.`,
      type: "warning",
      seen: false,
    });

    // Check if license should be suspended (if points reach maximum)
    if (newPoints >= license.maxPoints) {
      await License.findByIdAndUpdate(license._id, {
        $set: { status: "Suspended" },
      });

      // Send suspension notification
      await Notification.create({
        userId: license.userId,
        title: "License Suspended",
        message: `Your driving license (${license.number}) has been suspended due to reaching the maximum demerit points (${license.maxPoints}). Please contact the licensing authority.`,
        type: "error",
        seen: false,
      });
    }

    res.json({
      message: "Violation recorded successfully",
      license: updatedLicense,
      newPoints,
      suspended: newPoints >= license.maxPoints,
    });
  } catch (error) {
    console.error("Error recording violation:", error);
    res.status(500).json({ message: "Error recording violation" });
  }
};

// Get violations recorded by the current traffic police officer
export const getMyViolationRecords = async (req, res) => {
  try {
    // Find all licenses that have violations recorded by this traffic police officer
    const licenses = await License.find({
      "violations.recordedBy": req.userId,
    })
      .populate("userId", "fullName full_name email user_email")
      .select("userId number violations")
      .lean();

    const myViolations = [];

    licenses.forEach((license) => {
      // Filter violations recorded by this officer
      const officerViolations = license.violations.filter(
        (violation) =>
          violation.recordedBy &&
          violation.recordedBy.toString() === req.userId.toString()
      );

      officerViolations.forEach((violation) => {
        myViolations.push({
          _id: violation._id,
          licenseNumber: license.number,
          userId: license.userId,
          type: violation.type,
          points: violation.points,
          description: violation.description,
          location: violation.location,
          date: violation.date,
        });
      });
    });

    // Sort by date (most recent first)
    myViolations.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(myViolations);
  } catch (error) {
    console.error("Error fetching violation records:", error);
    res.status(500).json({ message: "Error fetching violation records" });
  }
};

// Get traffic police dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all violations recorded by this officer
    const licenses = await License.find({
      "violations.recordedBy": req.userId,
    })
      .select("violations")
      .lean();

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let totalCount = 0;

    licenses.forEach((license) => {
      license.violations.forEach((violation) => {
        if (
          violation.recordedBy &&
          violation.recordedBy.toString() === req.userId.toString()
        ) {
          totalCount++;
          const violationDate = new Date(violation.date);

          if (violationDate >= startOfDay) {
            todayCount++;
          }
          if (violationDate >= startOfWeek) {
            weekCount++;
          }
          if (violationDate >= startOfMonth) {
            monthCount++;
          }
        }
      });
    });

    res.json({
      todayViolations: todayCount,
      weekViolations: weekCount,
      monthViolations: monthCount,
      totalViolations: totalCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// Search licenses by various criteria
export const searchLicenses = async (req, res) => {
  try {
    const { query, searchType = "number" } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    let searchCriteria = {};

    switch (searchType) {
      case "number":
        searchCriteria = { number: { $regex: query, $options: "i" } };
        break;
      case "name":
        searchCriteria = { userName: { $regex: query, $options: "i" } };
        break;
      case "email":
        searchCriteria = { userEmail: { $regex: query, $options: "i" } };
        break;
      default:
        searchCriteria = {
          $or: [
            { number: { $regex: query, $options: "i" } },
            { userName: { $regex: query, $options: "i" } },
            { userEmail: { $regex: query, $options: "i" } },
          ],
        };
    }

    const licenses = await License.find(searchCriteria)
      .populate("userId", "fullName full_name email user_email")
      .select(
        "number userName userEmail class status points maxPoints issueDate expiryDate"
      )
      .limit(20)
      .lean();

    res.json(licenses);
  } catch (error) {
    console.error("Error searching licenses:", error);
    res.status(500).json({ message: "Error searching licenses" });
  }
};
