import UserActivity from "../models/UserActivity.js";
import User from "../models/User.js";
import License from "../models/License.js";
import LicenseApplication from "../models/LicenseApplication.js";
import ExamSchedule from "../models/examSchedule.js";
import ExamResult from "../models/ExamResult.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

// Get user activities with filtering and pagination
export const getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      activityType,
      startDate,
      endDate,
      tags,
      status,
    } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Parse activity types if provided
    let activityTypes = null;
    if (activityType) {
      activityTypes = Array.isArray(activityType)
        ? activityType
        : activityType.split(",");
    }

    // Parse tags if provided
    let tagArray = null;
    if (tags) {
      tagArray = Array.isArray(tags) ? tags : tags.split(",");
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      activityType: activityTypes,
      startDate,
      endDate,
      tags: tagArray,
      status,
    };

    const result = await UserActivity.getUserActivities(userId, options);

    res.json({
      success: true,
      data: result.activities,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activities",
      error: error.message,
    });
  }
};

// Get activity statistics for a user
export const getUserActivityStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get activity counts by type
    const activityStats = await UserActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isVisible: true,
        },
      },
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
          lastActivity: { $max: "$createdAt" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent activity count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivityCount = await UserActivity.countDocuments({
      userId,
      isVisible: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get total activity count
    const totalActivities = await UserActivity.countDocuments({
      userId,
      isVisible: true,
    });

    // Get activity by status
    const statusStats = await UserActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isVisible: true,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly activity trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await UserActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isVisible: true,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalActivities,
        recentActivityCount,
        activityByType: activityStats,
        activityByStatus: statusStats,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activity statistics",
      error: error.message,
    });
  }
};

// Create a new user activity (for manual logging)
export const createUserActivity = async (req, res) => {
  try {
    const {
      userId,
      activityType,
      action,
      description,
      details,
      relatedEntity,
      metadata,
      severity,
      status,
      tags,
    } = req.body;

    // Validate required fields
    if (!userId || !activityType || !action || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, activityType, action, description",
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const activityData = {
      userId,
      activityType,
      action,
      description,
      details: details || {},
      relatedEntity: relatedEntity || {},
      metadata: metadata || {},
      severity: severity || "low",
      status: status || "success",
      tags: tags || [],
    };

    const activity = await UserActivity.createActivity(activityData);

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (error) {
    console.error("Error creating user activity:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user activity",
      error: error.message,
    });
  }
};

// Generate real activities from existing data
const generateRealActivities = async (userId) => {
  const realActivities = [];

  try {
    // Get license applications
    const applications = await LicenseApplication.find({ userId }).sort({
      createdAt: -1,
    });
    for (const app of applications) {
      realActivities.push({
        _id: `app_${app._id}`,
        activityType: "license_application",
        action: "submitted",
        description: `License application submitted for ${app.licenseType} class`,
        status:
          app.status === "pending"
            ? "pending"
            : app.status === "approved"
            ? "success"
            : "failed",
        createdAt: app.applicationDate || app.createdAt,
        details: {
          applicationId: app._id,
          licenseType: app.licenseType,
          firstName: app.firstName,
          lastName: app.lastName,
        },
        relatedEntity: {
          entityType: "LicenseApplication",
          entityId: app._id,
        },
      });

      if (app.status !== "pending") {
        realActivities.push({
          _id: `app_status_${app._id}`,
          activityType: "status_change",
          action: app.status,
          description: `License application ${app.status}`,
          status: app.status === "approved" ? "success" : "failed",
          createdAt: app.lastUpdated || app.updatedAt,
          details: {
            applicationId: app._id,
            oldStatus: "pending",
            newStatus: app.status,
            statusMessage: app.statusMessage,
          },
        });
      }
    }

    // Get exam schedules
    const examSchedules = await ExamSchedule.find({ userId }).sort({
      createdAt: -1,
    });
    for (const exam of examSchedules) {
      realActivities.push({
        _id: `exam_${exam._id}`,
        activityType: "exam_schedule",
        action: "scheduled",
        description: `${
          exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)
        } exam scheduled`,
        status:
          exam.status === "approved"
            ? "success"
            : exam.status === "rejected"
            ? "failed"
            : "pending",
        createdAt: exam.createdAt,
        details: {
          examId: exam._id,
          examType: exam.examType,
          date: exam.date,
          time: exam.time,
          location: exam.location,
          instructor: exam.instructor,
        },
      });

      if (exam.status === "completed") {
        realActivities.push({
          _id: `exam_completed_${exam._id}`,
          activityType: "exam_completion",
          action: "completed",
          description: `${
            exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)
          } exam completed`,
          status:
            exam.result === "pass"
              ? "success"
              : exam.result === "fail"
              ? "failed"
              : "pending",
          createdAt: exam.examResult?.evaluatedAt || exam.updatedAt,
          details: {
            examId: exam._id,
            examType: exam.examType,
            result: exam.result,
            score: exam.examResult?.score,
            evaluatedBy: exam.examResult?.evaluatedBy,
          },
        });
      }
    }

    // Get exam results
    const examResults = await ExamResult.find({
      userId: userId.toString(),
    }).sort({ createdAt: -1 });
    for (const result of examResults) {
      realActivities.push({
        _id: `result_${result._id}`,
        activityType: "exam_result",
        action: "published",
        description: `${
          result.examType.charAt(0).toUpperCase() + result.examType.slice(1)
        } exam result published`,
        status: result.passed ? "success" : "failed",
        createdAt: result.dateTaken || result.createdAt,
        details: {
          resultId: result._id,
          examType: result.examType,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          passed: result.passed,
          language: result.language,
        },
      });
    }

    // Get payments
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    for (const payment of payments) {
      realActivities.push({
        _id: `payment_${payment._id}`,
        activityType: "payment_made",
        action: "submitted",
        description: `Payment submitted for license application`,
        status:
          payment.status === "verified"
            ? "success"
            : payment.status === "rejected"
            ? "failed"
            : "pending",
        createdAt: payment.paymentDate || payment.createdAt,
        details: {
          paymentId: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
        },
      });

      if (payment.status !== "pending") {
        realActivities.push({
          _id: `payment_status_${payment._id}`,
          activityType: "status_change",
          action: payment.status,
          description: `Payment ${payment.status}`,
          status: payment.status === "verified" ? "success" : "failed",
          createdAt: payment.reviewedAt || payment.updatedAt,
          details: {
            paymentId: payment._id,
            oldStatus: "pending",
            newStatus: payment.status,
            adminNotes: payment.adminNotes,
          },
        });
      }
    }

    // Get license information
    const license = await License.findOne({ userId });
    if (license) {
      realActivities.push({
        _id: `license_${license._id}`,
        activityType: "license_issued",
        action: "issued",
        description: "Driving license issued",
        status: "success",
        createdAt: license.issueDate || license.createdAt,
        details: {
          licenseId: license._id,
          licenseNumber: license.number,
          class: license.class,
          status: license.status,
          expiryDate: license.expiryDate,
        },
      });

      // Add violations as activities
      if (license.violations && license.violations.length > 0) {
        for (const violation of license.violations) {
          realActivities.push({
            _id: `violation_${violation._id}`,
            activityType: "violation_recorded",
            action: "recorded",
            description: `Traffic violation recorded: ${violation.type}`,
            status: "success",
            createdAt: violation.date,
            details: {
              violationId: violation._id,
              type: violation.type,
              points: violation.points,
              description: violation.description,
              location: violation.location,
            },
          });
        }
      }
    }

    // Get notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    for (const notification of notifications) {
      realActivities.push({
        _id: `notification_${notification._id}`,
        activityType: "system_notification",
        action: "received",
        description: `Notification: ${notification.title}`,
        status: "success",
        createdAt: notification.createdAt,
        details: {
          notificationId: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          seen: notification.seen,
        },
      });
    }

    // Sort activities by date (newest first)
    realActivities.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return realActivities;
  } catch (error) {
    console.error("Error generating real activities:", error);
    return [];
  }
};

// Get comprehensive user history (combines multiple data sources)
export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Try to get stored activities first
    let activitiesResult = await UserActivity.getUserActivities(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    // If no stored activities found, generate from real data
    if (activitiesResult.activities.length === 0) {
      console.log("No stored activities found, generating from real data...");
      const realActivities = await generateRealActivities(userId);

      // Paginate the real activities
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedActivities = realActivities.slice(startIndex, endIndex);

      activitiesResult = {
        activities: paginatedActivities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: realActivities.length,
          pages: Math.ceil(realActivities.length / parseInt(limit)),
          hasNext: endIndex < realActivities.length,
          hasPrev: parseInt(page) > 1,
        },
      };
    }

    // Get user's license information
    const license = await License.findOne({ userId }).populate(
      "violations.recordedBy",
      "fullName"
    );

    // Get activity statistics from real data
    const realActivities = await generateRealActivities(userId);
    const activityBreakdown = realActivities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {});

    const stats = Object.entries(activityBreakdown).map(([type, count]) => ({
      _id: type,
      count,
    }));

    // Format the response
    const history = {
      user: {
        id: user._id,
        fullName: user.fullName || user.full_name,
        email: user.email || user.user_email,
        joinDate: user.createdAt,
      },
      license: license
        ? {
            number: license.number,
            status: license.status,
            issueDate: license.issueDate,
            expiryDate: license.expiryDate,
            points: license.points,
            violationsCount: license.violations?.length || 0,
          }
        : null,
      activities: activitiesResult.activities,
      pagination: activitiesResult.pagination,
      statistics: {
        totalActivities: realActivities.length,
        activityBreakdown: stats,
      },
    };

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user history",
      error: error.message,
    });
  }
};

// Helper function to log user activity (to be used by other controllers)
export const logUserActivity = async (activityData) => {
  try {
    return await UserActivity.createActivity(activityData);
  } catch (error) {
    console.error("Error logging user activity:", error);
    // Don't throw error to avoid breaking main functionality
    return null;
  }
};
