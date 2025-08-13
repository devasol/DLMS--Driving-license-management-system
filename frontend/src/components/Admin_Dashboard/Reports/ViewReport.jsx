import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FileDownload,
  Delete,
  Refresh,
  Assessment,
  DateRange,
  Person,
  ArrowBack,
} from "@mui/icons-material";
import api from "../../../config/api";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
  transition: "all 0.3s ease",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 16px",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
  },
}));

const ReportCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
  },
}));

const ViewReport = () => {
  const navigate = useNavigate();
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    reportType: "all",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalReports: 0,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    reportId: null,
    reportTitle: "",
  });

  const reportTypes = [
    { value: "all", label: "All Reports" },
    { value: "users", label: "Users Reports" },
    { value: "applications", label: "Applications Reports" },
    { value: "exams", label: "Exams Reports" },
    { value: "payments", label: "Payments Reports" },
    { value: "violations", label: "Violations Reports" },
  ];

  // Fetch saved reports
  const fetchSavedReports = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        reportType:
          filters.reportType === "all" ? undefined : filters.reportType,
      };

      const response = await api.get("/admin/saved-reports", {
        params,
      });

      setSavedReports(response.data.reports || []);
      setPagination({
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1,
        totalReports: response.data.totalReports || 0,
      });
    } catch (error) {
      console.error("Error fetching saved reports:", error);
      setError(
        error.response?.data?.message || "Failed to fetch saved reports"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load reports on component mount and filter changes
  useEffect(() => {
    fetchSavedReports();
  }, [filters.reportType, filters.page]);

  // Refresh reports when component becomes visible (e.g., navigated to)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSavedReports();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also refresh when component mounts
    fetchSavedReports();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "reportType" ? 1 : prev.page, // Reset page when changing report type
    }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Download report as PDF
  const handleDownloadReport = async (reportId, reportTitle) => {
    try {
      setLoading(true);

      const response = await api.get(`/admin/saved-reports/${reportId}`);
      const reportData = response.data;

      // Create PDF with proper configuration
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set up page margins
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");

        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.35) + 5;

        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Add header
      addText(reportData.title || "Report", 20, true);
      yPosition += 5;

      // Add metadata
      addText(
        `Generated: ${new Date(reportData.createdAt).toLocaleDateString()}`,
        12
      );
      addText(
        `Report Type: ${reportData.reportType?.toUpperCase() || "N/A"}`,
        12
      );
      addText(
        `Period: ${new Date(
          reportData.startDate
        ).toLocaleDateString()} - ${new Date(
          reportData.endDate
        ).toLocaleDateString()}`,
        12
      );
      addText(`Total Records: ${reportData.totalRecords || 0}`, 12);
      addText(`Downloads: ${reportData.downloadCount || 0}`, 12);

      yPosition += 10;

      // Add description if available
      if (reportData.description) {
        addText("Description:", 14, true);
        addText(reportData.description, 12);
        yPosition += 5;
      }

      // Add statistics if available
      if (reportData.metadata?.statistics) {
        addText("Statistics:", 14, true);
        Object.entries(reportData.metadata.statistics).forEach(
          ([key, value]) => {
            addText(`• ${key}: ${value}`, 11);
          }
        );
        yPosition += 5;
      }

      // Add data summary
      if (reportData.data && reportData.data.length > 0) {
        addText("Data Summary:", 14, true);
        addText(
          `This report contains ${reportData.data.length} record(s) of ${reportData.reportType} data.`,
          12
        );

        // Add sample data (first few records)
        const sampleSize = Math.min(5, reportData.data.length);
        if (sampleSize > 0) {
          yPosition += 5;
          addText(
            `Sample Records (showing first ${sampleSize} of ${reportData.data.length}):`,
            12,
            true
          );

          reportData.data.slice(0, sampleSize).forEach((record, index) => {
            addText(`Record ${index + 1}:`, 11, true);

            // Display key fields of the record
            const displayFields = [
              "name",
              "email",
              "fullName",
              "licenseNumber",
              "status",
              "type",
              "createdAt",
            ];
            displayFields.forEach((field) => {
              if (record[field]) {
                let value = record[field];
                if (field === "createdAt" && value) {
                  value = new Date(value).toLocaleDateString();
                }
                addText(`  ${field}: ${value}`, 10);
              }
            });
            yPosition += 3;
          });
        }
      }

      // Add footer
      yPosition = pageHeight - margin;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        margin,
        yPosition
      );
      doc.text(
        `Page 1 of ${doc.internal.getNumberOfPages()}`,
        pageWidth - margin - 30,
        yPosition
      );

      // Generate filename
      const fileName = `${
        reportData.title?.replace(/[^a-zA-Z0-9]/g, "_") || "Report"
      }_${new Date().toISOString().split("T")[0]}.pdf`;

      // Save the PDF
      doc.save(fileName);

      setSuccess("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      setError("Failed to download report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId) => {
    try {
      setLoading(true);

      await api.delete(`/admin/saved-reports/${reportId}`);

      setSuccess("Report deleted successfully!");
      setDeleteDialog({ open: false, reportId: null, reportTitle: "" });
      fetchSavedReports(); // Refresh the list
    } catch (error) {
      console.error("Error deleting report:", error);
      setError("Failed to delete report");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (reportId, reportTitle) => {
    setDeleteDialog({
      open: true,
      reportId,
      reportTitle,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, reportId: null, reportTitle: "" });
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      users: <Person />,
      applications: <Assessment />,
      exams: <Assessment />,
      payments: <Assessment />,
      violations: <Assessment />,
    };
    return icons[type] || <Assessment />;
  };

  const getReportTypeColor = (type) => {
    const colors = {
      users: "primary",
      applications: "secondary",
      exams: "success",
      payments: "warning",
      violations: "error",
    };
    return colors[type] || "default";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
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
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            flex: 1,
          }}
        >
          📊 Saved Reports
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchSavedReports}
          disabled={loading}
          variant="outlined"
          sx={{ ml: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Filters and Actions */}
      <StyledCard sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Report Management
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Tooltip title="Refresh Reports">
                <IconButton onClick={fetchSavedReports} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Report Type</InputLabel>
                <Select
                  value={filters.reportType}
                  label="Filter by Report Type"
                  onChange={(e) =>
                    handleFilterChange("reportType", e.target.value)
                  }
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary">
                Total Reports: {pagination.totalReports} | Page{" "}
                {pagination.currentPage} of {pagination.totalPages}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Reports Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : savedReports.length === 0 ? (
        <StyledCard>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Assessment sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Reports Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filters.reportType === "all"
                ? "No reports have been generated yet."
                : `No ${filters.reportType} reports found.`}
            </Typography>
          </CardContent>
        </StyledCard>
      ) : (
        <>
          <Grid container spacing={3}>
            {savedReports.map((report) => (
              <Grid item xs={12} md={6} lg={4} key={report._id}>
                <ReportCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getReportTypeIcon(report.reportType)}
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {report.title}
                        </Typography>
                        <Chip
                          label={report.reportType.toUpperCase()}
                          size="small"
                          color={getReportTypeColor(report.reportType)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <DateRange sx={{ fontSize: 16, mr: 1 }} />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Records: {report.totalRecords} | Downloads:{" "}
                        {report.downloadCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {report.formattedFileSize || "N/A"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Tooltip title="Download PDF">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleDownloadReport(report._id, report.title)
                          }
                          disabled={loading}
                        >
                          <FileDownload />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Report">
                        <IconButton
                          color="error"
                          onClick={() =>
                            openDeleteDialog(report._id, report.title)
                          }
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </ReportCard>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the report "
            {deleteDialog.reportTitle}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDeleteDialog} disabled={loading}>
            Cancel
          </Button>
          <StyledButton
            onClick={() => handleDeleteReport(deleteDialog.reportId)}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
          >
            {loading ? "Deleting..." : "Delete"}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewReport;
