import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Assessment,
  FileDownload,
  Visibility,
  Close,
  ArrowBack,
} from "@mui/icons-material";
import { adminAPI } from "../../../config/api";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: "none",
  fontWeight: 600,
  padding: "12px 24px",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
  },
}));

// Helper function to generate detailed reports for different types
const generateDetailedReport = (doc, reportType, data, startY) => {
  let yPosition = startY;

  // Add section header
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text(`${reportType.toUpperCase()} DETAILS`, 20, yPosition);
  yPosition += 15;

  switch (reportType) {
    case "users":
      return generateUsersReport(doc, data, yPosition);
    case "applications":
      return generateApplicationsReport(doc, data, yPosition);
    case "exams":
      return generateExamsReport(doc, data, yPosition);
    case "payments":
      return generatePaymentsReport(doc, data, yPosition);
    case "violations":
      return generateViolationsReport(doc, data, yPosition);
    default:
      return generateGenericReport(doc, data, yPosition, reportType);
  }
};

// Users Report Generator
const generateUsersReport = (doc, data, startY) => {
  let yPosition = startY;

  // Statistics section
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("USER STATISTICS:", 20, yPosition);
  yPosition += 10;

  const verifiedUsers = data.filter((user) => user.isEmailVerified).length;
  const pendingUsers = data.length - verifiedUsers;

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`• Total Users: ${data.length}`, 25, yPosition);
  yPosition += 8;
  doc.text(`• Verified Users: ${verifiedUsers}`, 25, yPosition);
  yPosition += 8;
  doc.text(`• Pending Verification: ${pendingUsers}`, 25, yPosition);
  yPosition += 15;

  // Detailed user list
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("DETAILED USER LIST:", 20, yPosition);
  yPosition += 10;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  data.slice(0, 15).forEach((user, index) => {
    // Limit to 15 for detailed view
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(`${index + 1}. ${user.fullName || "N/A"}`, 20, yPosition);
    yPosition += 8;

    doc.setFont(undefined, "normal");
    doc.text(`   Email: ${user.email || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   Phone: ${user.phoneNumber || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(
      `   Status: ${
        user.isEmailVerified ? "Verified" : "Pending Verification"
      }`,
      25,
      yPosition
    );
    yPosition += 6;
    doc.text(`   Role: ${user.role || "User"}`, 25, yPosition);
    yPosition += 6;
    doc.text(
      `   Joined: ${
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"
      }`,
      25,
      yPosition
    );
    yPosition += 12;
  });

  if (data.length > 15) {
    doc.text(`... and ${data.length - 15} more users`, 20, yPosition);
    yPosition += 10;
  }

  return yPosition;
};

// Applications Report Generator
const generateApplicationsReport = (doc, data, startY) => {
  let yPosition = startY;

  // Statistics section
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("APPLICATION STATISTICS:", 20, yPosition);
  yPosition += 10;

  const statusCounts = data.reduce((acc, app) => {
    acc[app.status || "Unknown"] = (acc[app.status || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  const licenseTypeCounts = data.reduce((acc, app) => {
    acc[app.licenseType || "Unknown"] =
      (acc[app.licenseType || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`• Total Applications: ${data.length}`, 25, yPosition);
  yPosition += 8;

  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`• ${status}: ${count}`, 25, yPosition);
    yPosition += 8;
  });
  yPosition += 5;

  doc.setFont(undefined, "bold");
  doc.text("License Types:", 25, yPosition);
  yPosition += 8;
  doc.setFont(undefined, "normal");

  Object.entries(licenseTypeCounts).forEach(([type, count]) => {
    doc.text(`• ${type}: ${count}`, 30, yPosition);
    yPosition += 8;
  });
  yPosition += 10;

  // Detailed applications list
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("DETAILED APPLICATIONS:", 20, yPosition);
  yPosition += 10;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  data.slice(0, 12).forEach((app, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(`${index + 1}. ${app.fullName || "N/A"}`, 20, yPosition);
    yPosition += 8;

    doc.setFont(undefined, "normal");
    doc.text(`   Email: ${app.email || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   License Type: ${app.licenseType || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   Status: ${app.status || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(
      `   Applied: ${
        app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"
      }`,
      25,
      yPosition
    );
    yPosition += 6;
    if (app.dateOfBirth) {
      doc.text(
        `   Date of Birth: ${new Date(app.dateOfBirth).toLocaleDateString()}`,
        25,
        yPosition
      );
      yPosition += 6;
    }
    if (app.address) {
      doc.text(
        `   Address: ${app.address.substring(0, 50)}${
          app.address.length > 50 ? "..." : ""
        }`,
        25,
        yPosition
      );
      yPosition += 6;
    }
    yPosition += 8;
  });

  if (data.length > 12) {
    doc.text(`... and ${data.length - 12} more applications`, 20, yPosition);
    yPosition += 10;
  }

  return yPosition;
};

// Exams Report Generator
const generateExamsReport = (doc, data, startY) => {
  let yPosition = startY;

  // Statistics section
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("EXAM STATISTICS:", 20, yPosition);
  yPosition += 10;

  const statusCounts = data.reduce((acc, exam) => {
    acc[exam.status || "Unknown"] = (acc[exam.status || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  const resultCounts = data.reduce((acc, exam) => {
    acc[exam.result || "Pending"] = (acc[exam.result || "Pending"] || 0) + 1;
    return acc;
  }, {});

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`• Total Exams: ${data.length}`, 25, yPosition);
  yPosition += 8;

  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`• ${status}: ${count}`, 25, yPosition);
    yPosition += 8;
  });
  yPosition += 5;

  doc.setFont(undefined, "bold");
  doc.text("Results:", 25, yPosition);
  yPosition += 8;
  doc.setFont(undefined, "normal");

  Object.entries(resultCounts).forEach(([result, count]) => {
    doc.text(`• ${result}: ${count}`, 30, yPosition);
    yPosition += 8;
  });
  yPosition += 10;

  // Detailed exams list
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("DETAILED EXAM RECORDS:", 20, yPosition);
  yPosition += 10;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  data.slice(0, 15).forEach((exam, index) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(
      `${index + 1}. ${exam.fullName || exam.userName || "N/A"}`,
      20,
      yPosition
    );
    yPosition += 8;

    doc.setFont(undefined, "normal");
    doc.text(`   Exam Type: ${exam.examType || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(
      `   Date: ${
        exam.date || exam.examDate
          ? new Date(exam.date || exam.examDate).toLocaleDateString()
          : "N/A"
      }`,
      25,
      yPosition
    );
    yPosition += 6;
    doc.text(`   Status: ${exam.status || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   Result: ${exam.result || "Pending"}`, 25, yPosition);
    yPosition += 6;
    if (exam.score !== undefined) {
      doc.text(`   Score: ${exam.score}`, 25, yPosition);
      yPosition += 6;
    }
    yPosition += 8;
  });

  if (data.length > 15) {
    doc.text(`... and ${data.length - 15} more exam records`, 20, yPosition);
    yPosition += 10;
  }

  return yPosition;
};

// Payments Report Generator
const generatePaymentsReport = (doc, data, startY) => {
  let yPosition = startY;

  // Statistics section
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("PAYMENT STATISTICS:", 20, yPosition);
  yPosition += 10;

  const totalAmount = data.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );
  const statusCounts = data.reduce((acc, payment) => {
    acc[payment.status || "Unknown"] =
      (acc[payment.status || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  const methodCounts = data.reduce((acc, payment) => {
    acc[payment.paymentMethod || "Unknown"] =
      (acc[payment.paymentMethod || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`• Total Payments: ${data.length}`, 25, yPosition);
  yPosition += 8;
  doc.text(`• Total Amount: $${totalAmount.toFixed(2)}`, 25, yPosition);
  yPosition += 8;
  doc.text(
    `• Average Amount: $${(totalAmount / data.length || 0).toFixed(2)}`,
    25,
    yPosition
  );
  yPosition += 10;

  doc.setFont(undefined, "bold");
  doc.text("Payment Status:", 25, yPosition);
  yPosition += 8;
  doc.setFont(undefined, "normal");

  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`• ${status}: ${count}`, 30, yPosition);
    yPosition += 8;
  });
  yPosition += 5;

  doc.setFont(undefined, "bold");
  doc.text("Payment Methods:", 25, yPosition);
  yPosition += 8;
  doc.setFont(undefined, "normal");

  Object.entries(methodCounts).forEach(([method, count]) => {
    doc.text(`• ${method}: ${count}`, 30, yPosition);
    yPosition += 8;
  });
  yPosition += 10;

  // Detailed payments list
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("DETAILED PAYMENT RECORDS:", 20, yPosition);
  yPosition += 10;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  data.slice(0, 15).forEach((payment, index) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(
      `${index + 1}. ${payment.userName || payment.fullName || "N/A"}`,
      20,
      yPosition
    );
    yPosition += 8;

    doc.setFont(undefined, "normal");
    doc.text(`   Amount: $${payment.amount || 0}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   Method: ${payment.paymentMethod || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   Status: ${payment.status || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(
      `   Date: ${
        payment.createdAt || payment.paymentDate
          ? new Date(
              payment.createdAt || payment.paymentDate
            ).toLocaleDateString()
          : "N/A"
      }`,
      25,
      yPosition
    );
    yPosition += 6;
    if (payment.transactionId) {
      doc.text(`   Transaction ID: ${payment.transactionId}`, 25, yPosition);
      yPosition += 6;
    }
    yPosition += 8;
  });

  if (data.length > 15) {
    doc.text(`... and ${data.length - 15} more payment records`, 20, yPosition);
    yPosition += 10;
  }

  return yPosition;
};

// Violations Report Generator
const generateViolationsReport = (doc, data, startY) => {
  let yPosition = startY;

  // Statistics section
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("VIOLATION STATISTICS:", 20, yPosition);
  yPosition += 10;

  const totalFines = data.reduce(
    (sum, violation) => sum + (violation.fine || 0),
    0
  );
  const statusCounts = data.reduce((acc, violation) => {
    acc[violation.status || "Unknown"] =
      (acc[violation.status || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = data.reduce((acc, violation) => {
    acc[violation.type || "Unknown"] =
      (acc[violation.type || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`• Total Violations: ${data.length}`, 25, yPosition);
  yPosition += 8;
  doc.text(`• Total Fines: $${totalFines.toFixed(2)}`, 25, yPosition);
  yPosition += 8;
  doc.text(
    `• Average Fine: $${(totalFines / data.length || 0).toFixed(2)}`,
    25,
    yPosition
  );
  yPosition += 10;

  doc.setFont(undefined, "bold");
  doc.text("Violation Status:", 25, yPosition);
  yPosition += 8;
  doc.setFont(undefined, "normal");

  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`• ${status}: ${count}`, 30, yPosition);
    yPosition += 8;
  });
  yPosition += 5;

  doc.setFont(undefined, "bold");
  doc.text("Violation Types:", 25, yPosition);
  yPosition += 8;
  doc.setFont(undefined, "normal");

  Object.entries(typeCounts).forEach(([type, count]) => {
    doc.text(`• ${type}: ${count}`, 30, yPosition);
    yPosition += 8;
  });
  yPosition += 10;

  // Detailed violations list
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("DETAILED VIOLATION RECORDS:", 20, yPosition);
  yPosition += 10;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  data.slice(0, 15).forEach((violation, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(
      `${index + 1}. ${violation.userName || violation.fullName || "N/A"}`,
      20,
      yPosition
    );
    yPosition += 8;

    doc.setFont(undefined, "normal");
    doc.text(`   Type: ${violation.type || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   Fine: $${violation.fine || 0}`, 25, yPosition);
    yPosition += 6;
    doc.text(`   Status: ${violation.status || "N/A"}`, 25, yPosition);
    yPosition += 6;
    doc.text(
      `   Date: ${
        violation.date || violation.createdAt
          ? new Date(violation.date || violation.createdAt).toLocaleDateString()
          : "N/A"
      }`,
      25,
      yPosition
    );
    yPosition += 6;
    if (violation.description) {
      doc.text(
        `   Description: ${violation.description.substring(0, 60)}${
          violation.description.length > 60 ? "..." : ""
        }`,
        25,
        yPosition
      );
      yPosition += 6;
    }
    if (violation.location) {
      doc.text(`   Location: ${violation.location}`, 25, yPosition);
      yPosition += 6;
    }
    yPosition += 8;
  });

  if (data.length > 15) {
    doc.text(
      `... and ${data.length - 15} more violation records`,
      20,
      yPosition
    );
    yPosition += 10;
  }

  return yPosition;
};

// Generic Report Generator (fallback)
const generateGenericReport = (doc, data, startY, reportType) => {
  let yPosition = startY;

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`${reportType.toUpperCase()} RECORDS:`, 20, yPosition);
  yPosition += 15;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  data.slice(0, 20).forEach((item, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(
      `${index + 1}. Record ${
        item._id ? String(item._id).slice(-8) : index + 1
      }`,
      20,
      yPosition
    );
    yPosition += 8;

    doc.setFont(undefined, "normal");
    // Display key fields
    Object.entries(item)
      .slice(0, 5)
      .forEach(([key, value]) => {
        if (key !== "_id" && key !== "__v") {
          const displayValue =
            typeof value === "object" && value instanceof Date
              ? value.toLocaleDateString()
              : String(value).substring(0, 50);
          doc.text(`   ${key}: ${displayValue}`, 25, yPosition);
          yPosition += 6;
        }
      });
    yPosition += 8;
  });

  if (data.length > 20) {
    doc.text(`... and ${data.length - 20} more records`, 20, yPosition);
    yPosition += 10;
  }

  return yPosition;
};

const GenerateReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    reportType: "",
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportTypes = [
    { value: "applications", label: "License Applications Report" },
    { value: "exams", label: "Exam Results Report" },
    { value: "violations", label: "Traffic Violations Report" },
    { value: "licenses", label: "License Status Report" },
    { value: "users", label: "User Activity Report" },
  ];

  const handleInputChange = (field, value) => {
    setReportData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!reportData.reportType) {
      setError("Please select a report type");
      return false;
    }
    if (!reportData.startDate) {
      setError("Please select a start date");
      return false;
    }
    if (!reportData.endDate) {
      setError("Please select an end date");
      return false;
    }
    if (reportData.startDate > reportData.endDate) {
      setError("Start date cannot be after end date");
      return false;
    }
    return true;
  };

  const handleGenerateReport = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔄 Generating report with params:", {
        reportType: reportData.reportType,
        startDate: reportData.startDate.toISOString(),
        endDate: reportData.endDate.toISOString(),
      });

      const response = await adminAPI.generateReport({
        reportType: reportData.reportType,
        startDate: reportData.startDate.toISOString(),
        endDate: reportData.endDate.toISOString(),
      });

      console.log("✅ Report generated successfully:", response.data);
      setGeneratedReport(response.data);
      setSuccess(
        "Report generated successfully! Redirecting to View Reports..."
      );

      // Navigate to View Reports page after a short delay to show success message
      setTimeout(() => {
        navigate("/admin/view-report");
      }, 2000);
    } catch (error) {
      console.error("❌ Error generating report:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate report. Please check if you're logged in as admin.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const [showReportData, setShowReportData] = useState(false);

  const handleViewReport = () => {
    if (generatedReport) {
      setShowReportData(true);
    }
  };

  const handleDownloadReport = async () => {
    if (!generatedReport || !generatedReport.data) {
      setError("No report data available to download");
      return;
    }

    try {
      console.log("🔍 Starting PDF generation...");

      // Create a simple PDF first to test basic functionality
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text(`${reportData.reportType.toUpperCase()} REPORT`, 20, 20);

      // Add date range
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
      if (reportData.startDate && reportData.endDate) {
        doc.text(
          `Period: ${new Date(
            reportData.startDate
          ).toLocaleDateString()} - ${new Date(
            reportData.endDate
          ).toLocaleDateString()}`,
          20,
          45
        );
      }

      // Add summary
      const recordCount = generatedReport.data?.length || 0;
      doc.text(`Total Records: ${recordCount}`, 20, 55);

      // Generate detailed report based on type
      let yPosition = 70;

      if (recordCount === 0) {
        doc.setFontSize(12);
        doc.text(
          "No data available for the selected date range",
          20,
          yPosition
        );
      } else {
        yPosition = generateDetailedReport(
          doc,
          reportData.reportType,
          generatedReport.data,
          yPosition
        );
      }

      // Save the PDF
      const fileName = `${reportData.reportType}_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      console.log("📄 Saving PDF:", fileName);
      doc.save(fileName);

      setError(""); // Clear any previous errors
      console.log("✅ PDF downloaded successfully:", fileName);
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      setError(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin/dashboard")}
            sx={{ mr: 2 }}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "text.primary" }}
          >
            Generate Report
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Report Generation Form */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Assessment sx={{ mr: 2, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Report Configuration
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportData.reportType}
                      label="Report Type"
                      onChange={(e) =>
                        handleInputChange("reportType", e.target.value)
                      }
                    >
                      {reportTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <DatePicker
                    label="Start Date"
                    value={reportData.startDate}
                    onChange={(date) => handleInputChange("startDate", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />

                  <DatePicker
                    label="End Date"
                    value={reportData.endDate}
                    onChange={(date) => handleInputChange("endDate", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      {success}
                    </Alert>
                  )}

                  <StyledButton
                    variant="contained"
                    onClick={handleGenerateReport}
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Assessment />
                    }
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      },
                    }}
                  >
                    {loading ? "Generating..." : "Generate Report"}
                  </StyledButton>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Report Preview/Actions */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Report Actions
                </Typography>

                {generatedReport ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Report generated successfully for{" "}
                      <strong>
                        {
                          reportTypes.find(
                            (t) => t.value === reportData.reportType
                          )?.label
                        }
                      </strong>
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Period: {reportData.startDate?.toLocaleDateString()} -{" "}
                      {reportData.endDate?.toLocaleDateString()}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{ display: "flex", gap: 2, flexDirection: "column" }}
                    >
                      <StyledButton
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={handleViewReport}
                        fullWidth
                      >
                        View Report
                      </StyledButton>

                      <StyledButton
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={handleDownloadReport}
                        fullWidth
                      >
                        Download Report
                      </StyledButton>
                    </Box>

                    <Box
                      sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Report Summary: {generatedReport.data?.length || 0}{" "}
                        records found
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Assessment
                      sx={{ fontSize: 64, color: "grey.300", mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      Configure and generate a report to see actions here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Report Display Dialog */}
        <Dialog
          open={showReportData}
          onClose={() => setShowReportData(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                {reportData.reportType?.toUpperCase()} Report Data
              </Typography>
              <Button
                onClick={() => setShowReportData(false)}
                sx={{ minWidth: "auto", p: 1 }}
              >
                <Close />
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            {generatedReport && generatedReport.data && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`${generatedReport.data.length} Records Found`}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Generated: ${new Date().toLocaleDateString()}`}
                    variant="outlined"
                  />
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {reportData.reportType === "applications" && (
                          <>
                            <TableCell>
                              <strong>Name</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Email</strong>
                            </TableCell>
                            <TableCell>
                              <strong>License Type</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Date</strong>
                            </TableCell>
                          </>
                        )}
                        {reportData.reportType === "exams" && (
                          <>
                            <TableCell>
                              <strong>Name</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Exam Type</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Date</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Result</strong>
                            </TableCell>
                          </>
                        )}
                        {reportData.reportType === "payments" && (
                          <>
                            <TableCell>
                              <strong>User</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Amount</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Method</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Date</strong>
                            </TableCell>
                          </>
                        )}
                        {reportData.reportType === "users" && (
                          <>
                            <TableCell>
                              <strong>Name</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Email</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Role</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Joined Date</strong>
                            </TableCell>
                          </>
                        )}
                        {![
                          "applications",
                          "exams",
                          "payments",
                          "users",
                        ].includes(reportData.reportType) && (
                          <>
                            <TableCell>
                              <strong>ID</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Type</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Date</strong>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generatedReport.data.map((item, index) => (
                        <TableRow key={index} hover>
                          {reportData.reportType === "applications" && (
                            <>
                              <TableCell>{item.fullName || "N/A"}</TableCell>
                              <TableCell>{item.email || "N/A"}</TableCell>
                              <TableCell>{item.licenseType || "N/A"}</TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status || "N/A"}
                                  size="small"
                                  color={
                                    item.status === "approved"
                                      ? "success"
                                      : item.status === "rejected"
                                      ? "error"
                                      : "default"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  item.createdAt || item.applicationDate
                                ).toLocaleDateString()}
                              </TableCell>
                            </>
                          )}
                          {reportData.reportType === "exams" && (
                            <>
                              <TableCell>{item.fullName || "N/A"}</TableCell>
                              <TableCell>{item.examType || "N/A"}</TableCell>
                              <TableCell>
                                {new Date(
                                  item.date || item.examDate
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status || "N/A"}
                                  size="small"
                                  color={
                                    item.status === "completed"
                                      ? "success"
                                      : item.status === "cancelled"
                                      ? "error"
                                      : "default"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.result || "Pending"}
                                  size="small"
                                  color={
                                    item.result === "pass"
                                      ? "success"
                                      : item.result === "fail"
                                      ? "error"
                                      : "default"
                                  }
                                />
                              </TableCell>
                            </>
                          )}
                          {reportData.reportType === "payments" && (
                            <>
                              <TableCell>
                                {item.userName || item.fullName || "N/A"}
                              </TableCell>
                              <TableCell>${item.amount || 0}</TableCell>
                              <TableCell>
                                {item.paymentMethod || "N/A"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status || "N/A"}
                                  size="small"
                                  color={
                                    item.status === "completed"
                                      ? "success"
                                      : item.status === "failed"
                                      ? "error"
                                      : "default"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  item.createdAt || item.paymentDate
                                ).toLocaleDateString()}
                              </TableCell>
                            </>
                          )}
                          {reportData.reportType === "users" && (
                            <>
                              <TableCell>{item.fullName || "N/A"}</TableCell>
                              <TableCell>{item.email || "N/A"}</TableCell>
                              <TableCell>
                                <Chip
                                  label={item.role || "user"}
                                  size="small"
                                  color={
                                    item.role === "admin"
                                      ? "primary"
                                      : "default"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    item.status ||
                                    (item.isEmailVerified
                                      ? "verified"
                                      : "pending")
                                  }
                                  size="small"
                                  color={
                                    item.status === "verified" ||
                                    item.isEmailVerified
                                      ? "success"
                                      : "warning"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {item.createdAt
                                  ? new Date(
                                      item.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                            </>
                          )}
                          {![
                            "applications",
                            "exams",
                            "payments",
                            "users",
                          ].includes(reportData.reportType) && (
                            <>
                              <TableCell>
                                {item._id ? String(item._id).slice(-8) : "N/A"}
                              </TableCell>
                              <TableCell>
                                {item.type || reportData.reportType}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status || "N/A"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  item.createdAt || item.updatedAt || Date.now()
                                ).toLocaleDateString()}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowReportData(false)}>Close</Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleDownloadReport}
            >
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default GenerateReport;
