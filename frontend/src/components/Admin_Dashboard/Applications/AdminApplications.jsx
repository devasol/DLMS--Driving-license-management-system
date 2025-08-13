import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
  Assignment,
  Description,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import AdminSidebar from "../Sidebar/AdminSidebar";

// API base URL
const API_BASE_URL = "http://localhost:5004/api";

const AdminApplications = () => {
  const [open, setOpen] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // Document dialog removed - we open documents directly in new tabs
  const [editedApplication, setEditedApplication] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "approved",
    statusMessage: "",
    reviewNotes: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching license applications from API...");

      // Try to fetch real data from the API
      try {
        const response = await axios.get(
          `${API_BASE_URL}/license/admin/applications`
        );
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setApplications(response.data);
          setFilteredApplications(response.data);
          console.log(
            `Successfully fetched ${response.data.length} applications`
          );
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (apiError) {
        console.error("Error fetching from API:", apiError);
        setError(`Failed to fetch applications: ${apiError.message}`);

        // Fallback to mock data if API fails
        console.log("Using mock data as fallback");
        const mockApplications = [
          {
            _id: "app1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "123-456-7890",
            licenseType: "learner",
            applicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            status: "pending",
            documents: [
              { name: "ID Proof", url: "#" },
              { name: "Address Proof", url: "#" },
            ],
          },
          {
            _id: "app2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            phone: "987-654-3210",
            licenseType: "permanent",
            applicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            status: "approved",
            documents: [
              { name: "ID Proof", url: "#" },
              { name: "Address Proof", url: "#" },
            ],
          },
          {
            _id: "app3",
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice@example.com",
            phone: "555-123-4567",
            licenseType: "commercial",
            applicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
            status: "rejected",
            documents: [
              { name: "ID Proof", url: "#" },
              { name: "Address Proof", url: "#" },
            ],
          },
        ];

        setApplications(mockApplications);
        setFilteredApplications(mockApplications);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in fetchApplications:", error);
      setError(`An unexpected error occurred: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    const filtered = applications.filter(
      (app) =>
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.licenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApplications(filtered);
  };

  const handleViewApplication = async (applicationId) => {
    try {
      // First try to find the application in the already loaded data
      const existingApplication = applications.find(
        (app) => app._id === applicationId
      );

      if (existingApplication) {
        console.log("Using existing application data:", existingApplication);
        setSelectedApplication(existingApplication);
        setOpenViewDialog(true);
        return;
      }

      // If not found in existing data, try to fetch from API
      setLoading(true);
      console.log(
        "Fetching application details from API for ID:",
        applicationId
      );

      try {
        const response = await axios.get(
          `${API_BASE_URL}/license/admin/applications/${applicationId}`
        );

        if (response.data) {
          console.log("Fetched application details:", response.data);
          setSelectedApplication(response.data);
          setOpenViewDialog(true);
        } else {
          throw new Error("Application not found");
        }
      } catch (apiError) {
        console.error("API fetch failed, using fallback:", apiError);

        // Fallback: create a basic view with available data
        const fallbackApplication = applications.find(
          (app) => app._id === applicationId
        ) || {
          _id: applicationId,
          firstName: "Unknown",
          lastName: "User",
          email: "N/A",
          status: "pending",
          applicationDate: new Date(),
          licenseType: "learner",
        };

        setSelectedApplication(fallbackApplication);
        setOpenViewDialog(true);
      }
    } catch (error) {
      console.error("Error in handleViewApplication:", error);
      setSnackbar({
        open: true,
        message: `Error viewing application: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditApplication = (application) => {
    setEditedApplication({ ...application });
    setOpenEditDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedApplication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateApplication = async () => {
    try {
      setLoading(true);
      console.log("Updating application:", editedApplication);

      // Validate required fields
      const requiredFields = ["firstName", "lastName", "email", "phoneNumber"];
      const missingFields = requiredFields.filter(
        (field) =>
          !editedApplication[field] || editedApplication[field].trim() === ""
      );

      if (missingFields.length > 0) {
        setSnackbar({
          open: true,
          message: `Please fill in required fields: ${missingFields.join(
            ", "
          )}`,
          severity: "error",
        });
        setLoading(false);
        return;
      }

      // Send the update to the API
      const response = await axios.put(
        `${API_BASE_URL}/license/admin/applications/${editedApplication._id}`,
        editedApplication
      );

      if (response.data && response.data.success) {
        // Update the application in the local state
        const updatedApplications = applications.map((app) =>
          app._id === editedApplication._id ? response.data.data : app
        );

        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);
        setOpenEditDialog(false);

        // Show success message
        setSnackbar({
          open: true,
          message: response.data.message || "Application updated successfully",
          severity: "success",
        });
      } else {
        throw new Error(
          response.data?.message || "Failed to update application"
        );
      }
    } catch (error) {
      console.error("Error updating application:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update application";

      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err) => err.message)
          .join(", ");
        setSnackbar({
          open: true,
          message: `Validation errors: ${validationErrors}`,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusDialog = (application, status) => {
    setSelectedApplication(application);
    setStatusUpdate({
      status,
      statusMessage: "",
      reviewNotes: "",
    });
    setOpenStatusDialog(true);
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      console.log("Updating status:", selectedApplication._id, statusUpdate);

      // Validate required fields
      if (!statusUpdate.statusMessage.trim()) {
        setSnackbar({
          open: true,
          message: "Status message is required",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      try {
        // Try to send the status update to the API
        const response = await axios.patch(
          `${API_BASE_URL}/license/admin/applications/${selectedApplication._id}/status`,
          {
            status: statusUpdate.status,
            statusMessage: statusUpdate.statusMessage,
            reviewNotes: statusUpdate.reviewNotes,
            adminId:
              localStorage.getItem("userId") ||
              localStorage.getItem("adminId") ||
              "admin",
          }
        );

        if (response.data && response.data.success) {
          // Update the application status in the local state
          const updatedApplications = applications.map((app) =>
            app._id === selectedApplication._id
              ? {
                  ...app,
                  status: statusUpdate.status,
                  statusMessage: statusUpdate.statusMessage,
                  reviewNotes: statusUpdate.reviewNotes,
                  lastUpdated: new Date().toISOString(),
                }
              : app
          );

          setApplications(updatedApplications);
          setFilteredApplications(updatedApplications);
          setOpenStatusDialog(false);

          // Show success message
          setSnackbar({
            open: true,
            message:
              response.data.message ||
              `Application ${statusUpdate.status} successfully`,
            severity: "success",
          });
        } else {
          throw new Error(
            response.data?.message || "Failed to update application status"
          );
        }
      } catch (apiError) {
        console.error("API update failed, updating locally:", apiError);

        // Fallback: Update locally even if API fails
        const updatedApplications = applications.map((app) =>
          app._id === selectedApplication._id
            ? {
                ...app,
                status: statusUpdate.status,
                statusMessage: statusUpdate.statusMessage,
                reviewNotes: statusUpdate.reviewNotes,
                lastUpdated: new Date().toISOString(),
              }
            : app
        );

        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);
        setOpenStatusDialog(false);

        // Show success message (local update)
        setSnackbar({
          open: true,
          message: `Application ${statusUpdate.status} successfully (local update)`,
          severity: "warning",
        });
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update application status";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (application) => {
    setSelectedApplication(application);
    setOpenDeleteDialog(true);
  };

  const handleDeleteApplication = async () => {
    try {
      setLoading(true);
      console.log("Deleting application:", selectedApplication._id);

      // Send the delete request to the API
      const response = await axios.delete(
        `${API_BASE_URL}/license/admin/applications/${selectedApplication._id}`
      );

      if (response.data && response.data.success) {
        // Remove the application from the local state
        const updatedApplications = applications.filter(
          (app) => app._id !== selectedApplication._id
        );

        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);
        setOpenDeleteDialog(false);

        // Show success message
        setSnackbar({
          open: true,
          message: response.data.message || "Application deleted successfully",
          severity: "success",
        });
      } else {
        throw new Error(
          response.data?.message || "Failed to delete application"
        );
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete application";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUnderReview = async (applicationId) => {
    try {
      setLoading(true);
      console.log("Marking application under review:", applicationId);

      try {
        // Try to send the review request to the API
        const response = await axios.patch(
          `${API_BASE_URL}/license/admin/applications/${applicationId}/review`,
          {
            adminId:
              localStorage.getItem("userId") ||
              localStorage.getItem("adminId") ||
              "admin",
          }
        );

        if (response.data && response.data.success) {
          // Update the application status in the local state
          const updatedApplications = applications.map((app) =>
            app._id === applicationId
              ? {
                  ...app,
                  status: "under_review",
                  statusMessage:
                    "Application is currently under review by admin",
                  lastUpdated: new Date().toISOString(),
                }
              : app
          );

          setApplications(updatedApplications);
          setFilteredApplications(updatedApplications);

          // Show success message
          setSnackbar({
            open: true,
            message:
              response.data.message || "Application marked as under review",
            severity: "success",
          });
        } else {
          throw new Error(
            response.data?.message ||
              "Failed to mark application as under review"
          );
        }
      } catch (apiError) {
        console.error("API review failed, updating locally:", apiError);

        // Fallback: Update locally even if API fails
        const updatedApplications = applications.map((app) =>
          app._id === applicationId
            ? {
                ...app,
                status: "under_review",
                statusMessage: "Application is currently under review by admin",
                lastUpdated: new Date().toISOString(),
              }
            : app
        );

        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);

        // Show success message (local update)
        setSnackbar({
          open: true,
          message: "Application marked as under review (local update)",
          severity: "warning",
        });
      }
    } catch (error) {
      console.error("Error marking application under review:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update application status";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleViewDocument = async (documentType, documentInfo) => {
    console.log("Viewing document:", documentType, documentInfo);

    // Handle both object and string formats
    const documentData =
      typeof documentInfo === "object"
        ? documentInfo
        : { filename: documentInfo, originalName: documentInfo };

    console.log("Document data:", documentData);

    if (documentData.filename) {
      try {
        // First check if the document exists by making a HEAD request
        const documentUrl = `${API_BASE_URL}/license/documents/${documentData.filename}`;
        console.log("Checking document URL:", documentUrl);

        const response = await fetch(documentUrl, { method: "HEAD" });

        if (response.ok) {
          // Document exists, open in new tab
          console.log("Document found, opening in new tab");
          window.open(documentUrl, "_blank");
          setSnackbar({
            open: true,
            message: `Opening ${documentType} document`,
            severity: "success",
          });
        } else {
          console.error("Document not found on server:", response.status);
          setSnackbar({
            open: true,
            message: `Document not found on server (${response.status})`,
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error checking document:", error);
        setSnackbar({
          open: true,
          message: "Error accessing document. Please check your connection.",
          severity: "error",
        });
      }
    } else {
      console.error("No filename found for document:", documentData);
      setSnackbar({
        open: true,
        message: "Document file not found",
        severity: "error",
      });
    }
  };

  const handleDownloadDocument = async (documentType, documentInfo) => {
    console.log("Downloading document:", documentType, documentInfo);

    // Handle both object and string formats
    const documentData =
      typeof documentInfo === "object"
        ? documentInfo
        : { filename: documentInfo, originalName: documentInfo };

    if (documentData.filename) {
      try {
        const downloadUrl = `${API_BASE_URL}/license/documents/${documentData.filename}`;
        console.log("Download URL:", downloadUrl);

        // First check if the document exists
        const response = await fetch(downloadUrl, { method: "HEAD" });

        if (response.ok) {
          // Create download link
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = documentData.originalName || documentData.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setSnackbar({
            open: true,
            message: `Downloading ${documentType}...`,
            severity: "success",
          });
        } else {
          console.error("Document not found for download:", response.status);
          setSnackbar({
            open: true,
            message: `Document not available for download (${response.status})`,
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error downloading document:", error);
        setSnackbar({
          open: true,
          message: "Error downloading document. Please try again.",
          severity: "error",
        });
      }
    } else {
      console.error("No filename found for document:", documentData);
      setSnackbar({
        open: true,
        message: "Document file not found",
        severity: "error",
      });
    }
  };

  // Test document access function
  const testDocumentAccess = async (filename) => {
    try {
      const testUrl = `${API_BASE_URL}/license/documents/${filename}`;
      console.log("Testing document access:", testUrl);

      const response = await fetch(testUrl, { method: "HEAD" });
      console.log(
        "Document test response:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        console.log("✅ Document is accessible");
        return true;
      } else {
        console.log("❌ Document not accessible:", response.status);
        return false;
      }
    } catch (error) {
      console.error("❌ Error testing document access:", error);
      return false;
    }
  };

  // Debug functions
  const checkDatabaseCollections = async () => {
    try {
      setLoading(true);
      console.log("Checking database collections...");

      // Make a real API call to check database collections
      const response = await axios.get(
        `${API_BASE_URL}/license/admin/debug/collections`
      );

      console.log("Database collections:", response.data);

      setSnackbar({
        open: true,
        message: `Found ${response.data.collections?.length || 0} collections`,
        severity: "info",
      });
    } catch (error) {
      console.error("Error checking database collections:", error);
      setSnackbar({
        open: true,
        message: `Error checking database collections: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAPIEndpoints = async () => {
    try {
      setLoading(true);
      console.log("Testing API endpoints...");

      // Test a few API endpoints
      const endpoints = [
        `${API_BASE_URL}`,
        `${API_BASE_URL}/health`,
        `${API_BASE_URL}/license/test`,
        `${API_BASE_URL}/license/admin/applications`,
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await axios.get(endpoint);
            return { endpoint, status: response.status, success: true };
          } catch (error) {
            return {
              endpoint,
              status: error.response?.status || "error",
              success: false,
            };
          }
        })
      );

      console.log("API test results:", results);

      const successCount = results.filter((r) => r.success).length;

      setSnackbar({
        open: true,
        message: `${successCount}/${endpoints.length} API endpoints are working`,
        severity: successCount === endpoints.length ? "success" : "warning",
      });
    } catch (error) {
      console.error("Error testing API endpoints:", error);
      setSnackbar({
        open: true,
        message: `Error testing API endpoints: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    let color = "default";
    switch (status) {
      case "pending":
        color = "warning";
        break;
      case "approved":
        color = "success";
        break;
      case "rejected":
        color = "error";
        break;
      case "under_review":
        color = "info";
        break;
      default:
        color = "default";
    }
    return <Chip label={status} color={color} size="small" />;
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f0f4f8, #d7e3fc)",
        p: 0,
        m: 0,
        position: "relative",
        top: 0,
        left: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #3a8dff 0%, #1a56e5 100%)",
          color: "white",
          p: 3,
          m: 0,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/admin/dashboard")}
            startIcon={<BackIcon />}
            sx={{
              mr: 3,
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold">
            License Applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={fetchApplications}
          startIcon={<SearchIcon />}
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pt: 0, pb: 4, mt: 0 }}>
        {/* Search and Filter Bar */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "white",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "60%" }}>
            <TextField
              label="Search Applications"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: (theme) => theme.palette.primary.main,
                  },
                },
              }}
            />
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={checkDatabaseCollections}
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Debug DB
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={testAPIEndpoints}
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Test API
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchApplications}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>
        </Paper>

        {/* Status Cards */}
        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              flex: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {
                filteredApplications.filter((app) => app.status === "pending")
                  .length
              }
            </Typography>
            <Typography variant="subtitle1">Pending Applications</Typography>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              flex: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {
                filteredApplications.filter(
                  (app) => app.status === "under_review"
                ).length
              }
            </Typography>
            <Typography variant="subtitle1">Under Review</Typography>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              flex: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {
                filteredApplications.filter((app) => app.status === "approved")
                  .length
              }
            </Typography>
            <Typography variant="subtitle1">Approved</Typography>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              flex: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {
                filteredApplications.filter((app) => app.status === "rejected")
                  .length
              }
            </Typography>
            <Typography variant="subtitle1">Rejected</Typography>
          </Paper>
        </Box>

        {/* Applications Table */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          {error && (
            <Box sx={{ p: 2, bgcolor: "#ffebee" }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredApplications.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Assignment sx={{ fontSize: 60, color: "#bdbdbd" }} />
              <Typography variant="h6" color="textSecondary">
                No applications found.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Applicant</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      License Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Application Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow
                      key={application._id}
                      sx={{
                        "&:hover": {
                          bgcolor: "#f5f9ff",
                          transition: "background-color 0.2s ease",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              mr: 2,
                              bgcolor:
                                application.status === "approved"
                                  ? "#4caf50"
                                  : application.status === "rejected"
                                  ? "#f44336"
                                  : application.status === "under_review"
                                  ? "#2196f3"
                                  : "#ff9800",
                            }}
                          >
                            {application.firstName?.charAt(0) || "U"}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="medium">{`${
                              application.firstName || ""
                            } ${application.lastName || ""}`}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {application.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            application.licenseType === "learner"
                              ? "Learner's License"
                              : application.licenseType === "permanent"
                              ? "Permanent License"
                              : "Commercial License"
                          }
                          size="small"
                          sx={{
                            bgcolor:
                              application.licenseType === "learner"
                                ? "#e3f2fd"
                                : application.licenseType === "permanent"
                                ? "#e8f5e9"
                                : "#fff3e0",
                            color:
                              application.licenseType === "learner"
                                ? "#1976d2"
                                : application.licenseType === "permanent"
                                ? "#2e7d32"
                                : "#e65100",
                            fontWeight: "medium",
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const dateValue =
                            application.applicationDate ||
                            application.createdAt;
                          return dateValue && !isNaN(new Date(dateValue))
                            ? format(new Date(dateValue), "MMM dd, yyyy")
                            : "Invalid date";
                        })()}
                      </TableCell>
                      <TableCell>{getStatusChip(application.status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex" }}>
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() =>
                              handleViewApplication(application._id)
                            }
                            startIcon={<ViewIcon />}
                            sx={{ mr: 1, borderRadius: 1 }}
                          >
                            View
                          </Button>

                          {application.status === "pending" && (
                            <Button
                              variant="contained"
                              size="small"
                              color="info"
                              onClick={() =>
                                handleMarkUnderReview(application._id)
                              }
                              sx={{ mr: 1, borderRadius: 1 }}
                            >
                              Review
                            </Button>
                          )}

                          {(application.status === "pending" ||
                            application.status === "under_review") && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                onClick={() =>
                                  handleOpenStatusDialog(
                                    application,
                                    "approved"
                                  )
                                }
                                startIcon={<ApproveIcon />}
                                sx={{ mr: 1, borderRadius: 1 }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenStatusDialog(
                                    application,
                                    "rejected"
                                  )
                                }
                                startIcon={<RejectIcon />}
                                sx={{ mr: 1, borderRadius: 1 }}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(application)}
                            title="Delete Application"
                            sx={{
                              border: "1px solid rgba(0,0,0,0.12)",
                              borderRadius: 1,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* View Application Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Application Details</DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">Personal Information</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Name:</strong> {selectedApplication.firstName}{" "}
                    {selectedApplication.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Date of Birth:</strong>{" "}
                    {selectedApplication.dateOfBirth
                      ? format(
                          new Date(selectedApplication.dateOfBirth),
                          "MMM dd, yyyy"
                        )
                      : "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Gender:</strong>{" "}
                    {selectedApplication.gender || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Nationality:</strong>{" "}
                    {selectedApplication.nationality || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Email:</strong>{" "}
                    {selectedApplication.email || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Phone:</strong>{" "}
                    {selectedApplication.phoneNumber ||
                      selectedApplication.phone ||
                      "Not provided"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6">Address Information</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Address:</strong>{" "}
                    {selectedApplication.address || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography>
                    <strong>City:</strong>{" "}
                    {selectedApplication.city || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography>
                    <strong>State:</strong>{" "}
                    {selectedApplication.state || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography>
                    <strong>Postal Code:</strong>{" "}
                    {selectedApplication.postalCode || "Not provided"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6">License Information</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>License Type:</strong>{" "}
                    {selectedApplication.licenseType === "learner"
                      ? "Learner's License"
                      : selectedApplication.licenseType === "permanent"
                      ? "Permanent License"
                      : "Commercial License"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Previous License:</strong>{" "}
                    {selectedApplication.previousLicense || "None"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Driving Experience:</strong>{" "}
                    {selectedApplication.drivingExperience
                      ? `${selectedApplication.drivingExperience} years`
                      : "None"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6">Application Information</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Application Date:</strong>{" "}
                    {selectedApplication.applicationDate &&
                    !isNaN(new Date(selectedApplication.applicationDate))
                      ? format(
                          new Date(selectedApplication.applicationDate),
                          "MMM dd, yyyy"
                        )
                      : "Not available"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Status:</strong>{" "}
                    {getStatusChip(selectedApplication.status)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Status Message:</strong>{" "}
                    {selectedApplication.statusMessage}
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    📄 Submitted Documents for Review
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Click "View" to open documents in a new tab for review, or
                    "Download" to save locally.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  {selectedApplication.documents &&
                  Object.keys(selectedApplication.documents).length > 0 ? (
                    <List>
                      {Object.entries(selectedApplication.documents).map(
                        ([docType, docInfo]) => {
                          const documentData =
                            typeof docInfo === "object"
                              ? docInfo
                              : { filename: docInfo, originalName: docInfo };

                          return (
                            <ListItem key={docType} divider>
                              <ListItemIcon>
                                <Description color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={docType
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {documentData.originalName ||
                                        documentData.filename ||
                                        "Document uploaded"}
                                    </Typography>
                                    {documentData.size && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Size:{" "}
                                        {(documentData.size / 1024).toFixed(1)}{" "}
                                        KB
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  alignItems: "center",
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    handleViewDocument(docType, docInfo)
                                  }
                                  startIcon={<ViewIcon />}
                                  disabled={!documentData.filename}
                                  sx={{ minWidth: "80px" }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    handleDownloadDocument(docType, docInfo)
                                  }
                                  startIcon={<DownloadIcon />}
                                  disabled={!documentData.filename}
                                  sx={{ minWidth: "100px" }}
                                >
                                  Download
                                </Button>
                                {documentData.filename && (
                                  <Chip
                                    label="Available"
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </ListItem>
                          );
                        }
                      )}
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      No documents uploaded.
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6">Review Notes</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    {selectedApplication.reviewNotes ||
                      "No review notes available."}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
            {selectedApplication && (
              <>
                <Button
                  onClick={() => {
                    setOpenViewDialog(false);
                    handleEditApplication(selectedApplication);
                  }}
                  color="primary"
                >
                  Edit
                </Button>
                {(selectedApplication.status === "pending" ||
                  selectedApplication.status === "under_review") && (
                  <>
                    <Button
                      onClick={() => {
                        setOpenViewDialog(false);
                        handleOpenStatusDialog(selectedApplication, "approved");
                      }}
                      color="success"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        setOpenViewDialog(false);
                        handleOpenStatusDialog(selectedApplication, "rejected");
                      }}
                      color="error"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Edit Application Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Edit Application</DialogTitle>
          <DialogContent>
            {editedApplication && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    value={editedApplication.firstName || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="lastName"
                    label="Last Name"
                    value={editedApplication.lastName || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email"
                    value={editedApplication.email || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phoneNumber"
                    label="Phone Number"
                    value={editedApplication.phoneNumber || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="dateOfBirth"
                    label="Date of Birth"
                    value={format(
                      new Date(editedApplication.dateOfBirth),
                      "yyyy-MM-dd"
                    )}
                    onChange={handleEditChange}
                    fullWidth
                    InputProps={{
                      inputProps: { min: "1900-01-01" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="licenseType"
                    label="License Type"
                    value={editedApplication.licenseType || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="previousLicense"
                    label="Previous License"
                    value={editedApplication.previousLicense || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="drivingExperience"
                    label="Driving Experience (years)"
                    value={editedApplication.drivingExperience || ""}
                    onChange={handleEditChange}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 0 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="address"
                    label="Address"
                    value={editedApplication.address || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="city"
                    label="City"
                    value={editedApplication.city || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="state"
                    label="State"
                    value={editedApplication.state || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="postalCode"
                    label="Postal Code"
                    value={editedApplication.postalCode || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="gender"
                    label="Gender"
                    value={editedApplication.gender || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="nationality"
                    label="Nationality"
                    value={editedApplication.nationality || ""}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateApplication} color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog
          open={openStatusDialog}
          onClose={() => setOpenStatusDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">Application Details</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Name:</strong> {selectedApplication.firstName}{" "}
                    {selectedApplication.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>License Type:</strong>{" "}
                    {selectedApplication.licenseType === "learner"
                      ? "Learner's License"
                      : selectedApplication.licenseType === "permanent"
                      ? "Permanent License"
                      : "Commercial License"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Application Date:</strong>{" "}
                    {selectedApplication.applicationDate &&
                    !isNaN(new Date(selectedApplication.applicationDate))
                      ? format(
                          new Date(selectedApplication.applicationDate),
                          "MMM dd, yyyy"
                        )
                      : "Invalid date"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Current Status:</strong>{" "}
                    {getStatusChip(selectedApplication.status)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6">Status Update</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={statusUpdate.status}
                      onChange={handleStatusChange}
                    >
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <TextField
                    name="statusMessage"
                    label="Status Message *"
                    value={statusUpdate.statusMessage}
                    onChange={handleStatusChange}
                    multiline
                    rows={3}
                    fullWidth
                    required
                    error={!statusUpdate.statusMessage.trim()}
                    helperText={
                      !statusUpdate.statusMessage.trim()
                        ? "Status message is required"
                        : "Provide a clear message for the applicant"
                    }
                    placeholder={
                      statusUpdate.status === "approved"
                        ? "Your license application has been approved. Please visit our office to collect your license."
                        : "Your license application has been rejected. Please review the requirements and reapply."
                    }
                  />
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <TextField
                    name="reviewNotes"
                    label="Review Notes (Internal)"
                    value={statusUpdate.reviewNotes}
                    onChange={handleStatusChange}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Internal notes for admin reference (not visible to applicant)"
                    placeholder="Add any internal notes about the review process, documents checked, etc."
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} color="primary">
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Application Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Delete Application</DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">Application Details</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Name:</strong> {selectedApplication.firstName}{" "}
                    {selectedApplication.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>License Type:</strong>{" "}
                    {selectedApplication.licenseType === "learner"
                      ? "Learner's License"
                      : selectedApplication.licenseType === "permanent"
                      ? "Permanent License"
                      : "Commercial License"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Application Date:</strong>{" "}
                    {format(
                      new Date(selectedApplication.applicationDate),
                      "MMM dd, yyyy"
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Current Status:</strong>{" "}
                    {getStatusChip(selectedApplication.status)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6">Confirm Deletion</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      Warning: This action cannot be undone!
                    </Typography>
                    <Typography variant="body2">
                      Are you sure you want to permanently delete this
                      application? All associated data including documents will
                      be removed from the system.
                    </Typography>
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    Consider rejecting the application instead of deleting it to
                    maintain records.
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteApplication} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Document Viewer Dialog - Removed since we open documents directly in new tabs */}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminApplications;
