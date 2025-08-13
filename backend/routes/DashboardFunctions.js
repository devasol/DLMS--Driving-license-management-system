// DashboardFunctions.js
export const dashboardFunctions = {
  // License Application Status Checker
  checkApplicationStatus: async (userId) => {
    try {
      const response = await fetch(`/api/users/status/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch status");
      return await response.json();
    } catch (error) {
      console.error("Status check error:", error);
      return { status: "unknown", lastUpdated: new Date().toISOString() };
    }
  },

  // Exam Scheduling
  scheduleExam: async (examData) => {
    try {
      const response = await fetch("/api/exams/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });
      return await response.json();
    } catch (error) {
      console.error("Exam scheduling error:", error);
      return { success: false, message: "Failed to schedule exam" };
    }
  },

  // License Renewal
  renewLicense: async (licenseData) => {
    try {
      const response = await fetch("/api/license/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(licenseData),
      });
      return await response.json();
    } catch (error) {
      console.error("License renewal error:", error);
      return { success: false, message: "Failed to renew license" };
    }
  },

  // Violation Payment
  payViolation: async (violationId) => {
    try {
      const response = await fetch(`/api/violations/pay/${violationId}`, {
        method: "POST",
      });
      return await response.json();
    } catch (error) {
      console.error("Payment error:", error);
      return { success: false, message: "Failed to process payment" };
    }
  },
};
