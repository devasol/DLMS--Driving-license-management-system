import UserActivity from "../models/UserActivity.js";

/**
 * Utility class for logging user activities
 */
class ActivityLogger {
  /**
   * Log a user activity
   * @param {Object} activityData - Activity data
   * @param {string} activityData.userId - User ID
   * @param {string} activityData.activityType - Type of activity
   * @param {string} activityData.action - Action performed
   * @param {string} activityData.description - Description of the activity
   * @param {Object} activityData.details - Additional details
   * @param {Object} activityData.relatedEntity - Related entity information
   * @param {Object} activityData.metadata - Metadata (IP, user agent, etc.)
   * @param {string} activityData.severity - Severity level
   * @param {string} activityData.status - Status of the activity
   * @param {Array} activityData.tags - Tags for categorization
   */
  static async logActivity(activityData) {
    try {
      const activity = await UserActivity.createActivity({
        userId: activityData.userId,
        activityType: activityData.activityType,
        action: activityData.action,
        description: activityData.description,
        details: activityData.details || {},
        relatedEntity: activityData.relatedEntity || {},
        metadata: activityData.metadata || {},
        severity: activityData.severity || "low",
        status: activityData.status || "success",
        tags: activityData.tags || [],
        isVisible: activityData.isVisible !== false, // Default to true
      });

      console.log(
        `Activity logged: ${activityData.activityType} for user ${activityData.userId}`
      );
      return activity;
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't throw error to avoid breaking main functionality
      return null;
    }
  }

  /**
   * Log license application activity
   */
  static async logLicenseApplication(
    userId,
    action,
    applicationId,
    details = {}
  ) {
    return this.logActivity({
      userId,
      activityType: "license_application",
      action,
      description: `License application ${action}`,
      details: { applicationId, ...details },
      relatedEntity: {
        entityType: "LicenseApplication",
        entityId: applicationId,
      },
      severity: action === "rejected" ? "medium" : "low",
      tags: ["license", "application"],
    });
  }

  /**
   * Log exam activity
   */
  static async logExamActivity(
    userId,
    activityType,
    action,
    examId,
    details = {}
  ) {
    const descriptions = {
      exam_schedule: `Exam ${action}`,
      exam_completion: `Exam ${action}`,
      exam_result: `Exam result ${action}`,
    };

    return this.logActivity({
      userId,
      activityType,
      action,
      description: descriptions[activityType] || `Exam ${action}`,
      details: { examId, ...details },
      relatedEntity: {
        entityType: "ExamSchedule",
        entityId: examId,
      },
      severity: details.passed === false ? "medium" : "low",
      tags: ["exam", action],
    });
  }

  /**
   * Log license issuance/renewal
   */
  static async logLicenseActivity(
    userId,
    activityType,
    action,
    licenseId,
    details = {}
  ) {
    const descriptions = {
      license_issued: "Driving license issued",
      license_renewal: "Driving license renewed",
    };

    return this.logActivity({
      userId,
      activityType,
      action,
      description: descriptions[activityType] || `License ${action}`,
      details: { licenseId, ...details },
      relatedEntity: {
        entityType: "License",
        entityId: licenseId,
      },
      severity: "low",
      tags: ["license", action],
    });
  }

  /**
   * Log violation activity
   */
  static async logViolation(
    userId,
    violationId,
    violationType,
    points,
    details = {}
  ) {
    return this.logActivity({
      userId,
      activityType: "violation_recorded",
      action: "recorded",
      description: `Traffic violation recorded: ${violationType}`,
      details: { violationId, violationType, points, ...details },
      relatedEntity: {
        entityType: "Violation",
        entityId: violationId,
      },
      severity: points >= 6 ? "high" : points >= 3 ? "medium" : "low",
      tags: [
        "violation",
        "traffic",
        violationType.toLowerCase().replace(/\s+/g, "_"),
      ],
    });
  }

  /**
   * Log payment activity
   */
  static async logPayment(userId, paymentId, amount, purpose, details = {}) {
    return this.logActivity({
      userId,
      activityType: "payment_made",
      action: "completed",
      description: `Payment made for ${purpose}`,
      details: { paymentId, amount, purpose, ...details },
      relatedEntity: {
        entityType: "Payment",
        entityId: paymentId,
      },
      severity: "low",
      tags: ["payment", purpose.toLowerCase().replace(/\s+/g, "_")],
    });
  }

  /**
   * Log profile update activity
   */
  static async logProfileUpdate(userId, updatedFields, details = {}) {
    return this.logActivity({
      userId,
      activityType: "profile_update",
      action: "updated",
      description: `Profile updated: ${updatedFields.join(", ")}`,
      details: { updatedFields, ...details },
      relatedEntity: {
        entityType: "User",
        entityId: userId,
      },
      severity: "low",
      tags: ["profile", "update"],
    });
  }

  /**
   * Log document upload activity
   */
  static async logDocumentUpload(userId, documentType, fileName, details = {}) {
    return this.logActivity({
      userId,
      activityType: "document_upload",
      action: "uploaded",
      description: `Document uploaded: ${documentType}`,
      details: { documentType, fileName, ...details },
      relatedEntity: {
        entityType: "User",
        entityId: userId,
      },
      severity: "low",
      tags: [
        "document",
        "upload",
        documentType.toLowerCase().replace(/\s+/g, "_"),
      ],
    });
  }

  /**
   * Log login activity
   */
  static async logLogin(userId, metadata = {}) {
    return this.logActivity({
      userId,
      activityType: "login",
      action: "logged_in",
      description: "User logged into the system",
      details: { loginTime: new Date() },
      metadata,
      severity: "low",
      tags: ["authentication", "login"],
    });
  }

  /**
   * Log admin action activity
   */
  static async logAdminAction(adminId, action, targetUserId, details = {}) {
    return this.logActivity({
      userId: adminId,
      activityType: "admin_action",
      action: action,
      description: `Admin performed ${action} action`,
      details: {
        targetUserId,
        adminAction: action,
        ...details,
      },
      relatedEntity: {
        entityType: "User",
        entityId: targetUserId,
      },
      severity: "medium",
      tags: ["admin", "action", action.toLowerCase().replace(/\s+/g, "_")],
    });
  }

  /**
   * Log system activity
   */
  static async logSystemActivity(action, description, details = {}) {
    return this.logActivity({
      userId: null, // System activities don't have a specific user
      activityType: "system_notification",
      action: action,
      description: description,
      details: {
        systemAction: action,
        timestamp: new Date(),
        ...details,
      },
      severity: "low",
      tags: ["system", action.toLowerCase().replace(/\s+/g, "_")],
      isVisible: true,
    });
  }

  /**
   * Log logout activity
   */
  static async logLogout(userId, metadata = {}) {
    return this.logActivity({
      userId,
      activityType: "logout",
      action: "logged_out",
      description: "User logged out of the system",
      details: { logoutTime: new Date() },
      metadata,
      severity: "low",
      tags: ["authentication", "logout"],
    });
  }

  /**
   * Log password change activity
   */
  static async logPasswordChange(userId, metadata = {}) {
    return this.logActivity({
      userId,
      activityType: "password_change",
      action: "changed",
      description: "User changed their password",
      details: { changeTime: new Date() },
      metadata,
      severity: "medium",
      tags: ["security", "password"],
    });
  }

  /**
   * Log system notification activity
   */
  static async logNotification(
    userId,
    notificationId,
    title,
    type,
    details = {}
  ) {
    return this.logActivity({
      userId,
      activityType: "system_notification",
      action: "received",
      description: `Notification received: ${title}`,
      details: { notificationId, title, type, ...details },
      relatedEntity: {
        entityType: "Notification",
        entityId: notificationId,
      },
      severity:
        type === "error" ? "high" : type === "warning" ? "medium" : "low",
      tags: ["notification", type],
    });
  }

  /**
   * Log status change activity
   */
  static async logStatusChange(
    userId,
    entityType,
    entityId,
    oldStatus,
    newStatus,
    details = {}
  ) {
    return this.logActivity({
      userId,
      activityType: "status_change",
      action: "changed",
      description: `${entityType} status changed from ${oldStatus} to ${newStatus}`,
      details: { entityType, oldStatus, newStatus, ...details },
      relatedEntity: {
        entityType,
        entityId,
      },
      severity:
        newStatus === "rejected" || newStatus === "failed" ? "medium" : "low",
      tags: ["status", "change", entityType.toLowerCase()],
    });
  }

  /**
   * Extract metadata from request object
   */
  static extractMetadata(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      timestamp: new Date(),
    };
  }
}

export default ActivityLogger;
