import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        "license_application",
        "exam_schedule",
        "exam_completion",
        "exam_result",
        "license_issued",
        "license_renewal",
        "violation_recorded",
        "payment_made",
        "profile_update",
        "document_upload",
        "login",
        "logout",
        "password_change",
        "system_notification",
        "status_change",
      ],
      index: true,
    },
    action: {
      type: String,
      required: true,
      // Examples: "submitted", "approved", "rejected", "completed", "scheduled", etc.
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      // Flexible object to store activity-specific data
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    relatedEntity: {
      // Reference to related document (application, exam, license, etc.)
      entityType: {
        type: String,
        enum: [
          "LicenseApplication",
          "ExamSchedule",
          "ExamResult",
          "License",
          "Payment",
          "Violation",
          "User",
          "Notification",
        ],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    metadata: {
      // Additional metadata
      ipAddress: String,
      userAgent: String,
      location: String,
      deviceInfo: String,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed", "cancelled"],
      default: "success",
    },
    isVisible: {
      // Whether this activity should be visible to the user
      type: Boolean,
      default: true,
    },
    tags: [String], // For categorization and filtering
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ activityType: 1, createdAt: -1 });
userActivitySchema.index({ userId: 1, activityType: 1, createdAt: -1 });
userActivitySchema.index({ "relatedEntity.entityType": 1, "relatedEntity.entityId": 1 });
userActivitySchema.index({ tags: 1 });
userActivitySchema.index({ isVisible: 1, createdAt: -1 });

// Virtual for formatted date
userActivitySchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Method to get activity icon based on type
userActivitySchema.methods.getActivityIcon = function () {
  const iconMap = {
    license_application: "📄",
    exam_schedule: "📅",
    exam_completion: "✅",
    exam_result: "📊",
    license_issued: "🆔",
    license_renewal: "🔄",
    violation_recorded: "⚠️",
    payment_made: "💳",
    profile_update: "👤",
    document_upload: "📎",
    login: "🔐",
    logout: "🚪",
    password_change: "🔑",
    system_notification: "🔔",
    status_change: "📝",
  };
  return iconMap[this.activityType] || "📋";
};

// Method to get activity color based on type and status
userActivitySchema.methods.getActivityColor = function () {
  if (this.status === "failed") return "#f44336"; // red
  if (this.status === "pending") return "#ff9800"; // orange
  if (this.status === "cancelled") return "#9e9e9e"; // grey

  const colorMap = {
    license_application: "#2196f3", // blue
    exam_schedule: "#9c27b0", // purple
    exam_completion: "#4caf50", // green
    exam_result: "#ff5722", // deep orange
    license_issued: "#4caf50", // green
    license_renewal: "#00bcd4", // cyan
    violation_recorded: "#f44336", // red
    payment_made: "#4caf50", // green
    profile_update: "#607d8b", // blue grey
    document_upload: "#795548", // brown
    login: "#3f51b5", // indigo
    logout: "#9e9e9e", // grey
    password_change: "#e91e63", // pink
    system_notification: "#ff9800", // orange
    status_change: "#673ab7", // deep purple
  };
  return colorMap[this.activityType] || "#2196f3";
};

// Static method to create activity
userActivitySchema.statics.createActivity = async function (activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error("Error creating user activity:", error);
    throw error;
  }
};

// Static method to get user activities with pagination
userActivitySchema.statics.getUserActivities = async function (
  userId,
  options = {}
) {
  const {
    page = 1,
    limit = 20,
    activityType,
    startDate,
    endDate,
    tags,
    status,
  } = options;

  const query = { userId, isVisible: true };

  if (activityType) {
    if (Array.isArray(activityType)) {
      query.activityType = { $in: activityType };
    } else {
      query.activityType = activityType;
    }
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("relatedEntity.entityId")
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

export default UserActivity;
