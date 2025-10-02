import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Cancel,
  Assignment,
  Schedule,
  Person,
  Description,
  Refresh,
  Warning,
  Visibility,
  GetApp,
  PictureAsPdf,
  Image,
  FileDownload,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import { format } from "date-fns";

const StatusCard = styled(Card)(({ theme, status }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `2px solid ${
    status === "approved"
      ? "#4caf50"
      : status === "rejected"
      ? "#f44336"
      : status === "under_review"
      ? "#ff9800"
      : "#2196f3"
  }`,
}));

const ApplicationStatus = ({ onClose, onCancel }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);

  // License state
  const [userLicense, setUserLicense] = useState(null);
  const [hasLicense, setHasLicense] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(true);

  // Function to check if user has a license
  const checkUserLicense = async () => {
    try {
      setCheckingLicense(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.warn("No user ID found for license check");
        return;
      }

      console.log("🔍 Checking if user has a license in ApplicationStatus...");

      // Try the debug endpoint first (most reliable)
      try {
        const response = await axios.get(`/api/license/debug/user/${userId}`);

        console.log("🔍 License check response:", response.data);

        if (response.data && response.data.licenseExists) {
          console.log("✅ User has a license:", response.data.licenseNumber);

          setHasLicense(true);
          setUserLicense({
            number: response.data.licenseNumber,
            status: response.data.licenseStatus,
            class: response.data.licenseClass,
            userName: response.data.userName,
            userEmail: response.data.userEmail,
            issueDate: response.data.issueDate
              ? new Date(response.data.issueDate).toLocaleDateString()
              : "N/A",
            expiryDate: response.data.expiryDate
              ? new Date(response.data.expiryDate).toLocaleDateString()
              : "N/A",
          });
        } else {
          console.log("📋 User does not have a license");
          setHasLicense(false);
          setUserLicense(null);
        }
      } catch (debugError) {
        console.log("Debug endpoint failed:", debugError.message);
        setHasLicense(false);
        setUserLicense(null);
      }
    } catch (error) {
      console.error("Error checking user license:", error);
      setHasLicense(false);
      setUserLicense(null);
    } finally {
      setCheckingLicense(false);
    }
  };

  const fetchApplicationStatus = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User not found. Please log in again.");
        return;
      }

      const response = await axios.get(
        `/api/license/applications/user/${userId}`
      );

      if (response.data && response.data.length > 0) {
        // Sort applications by date (most recent first)
        const sortedApplications = response.data.sort(
          (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
        );

        // Get the most recent application (regardless of status)
        const selectedApp = sortedApplications[0];

        // Debug: Log the application data to see document structure
        console.log("Application data:", selectedApp);
        console.log("All applications:", response.data);

        setApplication(selectedApp);
      } else {
        setError("No application found.");
      }
    } catch (err) {
      console.error("Error fetching application status:", err);
      setError("Failed to fetch application status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([checkUserLicense(), fetchApplicationStatus()]);
    };

    initializeData();
  }, []);

  const handleCancelApplication = async () => {
    try {
      if (onCancel && application) {
        await onCancel(application._id);
        setShowCancelDialog(false);
        // Close the status view and return to dashboard
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error cancelling application:", error);
      setShowCancelDialog(false);
    }
  };

  const handleViewDocument = (document) => {
    console.log("Viewing document:", document);
    console.log("Document filename:", document.filename);
    console.log("Document URL:", getDocumentUrl(document.filename));
    setSelectedDocument(document);
    setOpenDocumentDialog(true);
  };

  const handleDownloadDocument = (document) => {
    console.log("Downloading document:", document);
    const downloadUrl = `http://localhost:5003/api/license/documents/${document.filename}`;
    console.log("Download URL:", downloadUrl);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = document.originalName || document.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <PictureAsPdf color="error" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <Image color="primary" />;
      default:
        return <Description color="action" />;
    }
  };

  const getDocumentUrl = (filename) => {
    return `http://localhost:5003/api/license/documents/${filename}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "under_review":
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle />;
      case "rejected":
        return <Cancel />;
      case "under_review":
        return <Schedule />;
      default:
        return <Pending />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "under_review":
        return "Under Review";
      default:
        return "Pending";
    }
  };

  // Congratulations component for when user gets their license
  const CongratulationsView = () => (
    <Box sx={{ maxWidth: 800, margin: "0 auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          🎉 Congratulations!
        </Typography>
        {onClose && (
          <Button variant="contained" onClick={onClose}>
            Back to Dashboard
          </Button>
        )}
      </Box>

      {/* Congratulations Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              🎊
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Your License Has Been Issued!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Congratulations on successfully obtaining your driving license!
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              p: 3,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              License Number: {userLicense?.number}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              You can now legally drive with your new license!
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* License Details Card */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "primary.main" }}
          >
            Your License Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  License Information
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    License Number:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {userLicense?.number}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Class:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {userLicense?.class}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip
                    label={userLicense?.status}
                    color="success"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Issue Date:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {userLicense?.issueDate}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Expiry Date:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {userLicense?.expiryDate}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Holder Information
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Full Name:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {userLicense?.userName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {userLicense?.userEmail}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownload />}
              onClick={() => {
                // Placeholder for download functionality
                alert("License download feature will be available soon!");
              }}
            >
              Download License
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                checkUserLicense();
                fetchApplicationStatus();
              }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Important Notes:
        </Typography>
        <Typography variant="body2">
          • Always carry your license while driving
          <br />
          • Your license is valid for 5 years from the issue date
          <br />
          • Remember to renew before the expiry date
          <br />• Follow all traffic rules and regulations
        </Typography>
      </Alert>
    </Box>
  );

  if (loading || checkingLicense) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // Show congratulations view if user has a license
  if (hasLicense && userLicense) {
    return <CongratulationsView />;
  }

  if (!application) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No application found. Please submit a new application.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, margin: "0 auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Application Status
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchApplicationStatus}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          {/* Cancel button - only show for pending or under_review applications */}
          {application &&
            (application.status === "pending" ||
              application.status === "under_review") &&
            onCancel && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setShowCancelDialog(true)}
                sx={{ mr: 2 }}
              >
                Cancel Application
              </Button>
            )}
          {onClose && (
            <Button variant="contained" onClick={onClose}>
              Back to Dashboard
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Status Overview */}
        <Grid item xs={12} md={4}>
          <StatusCard status={application.status}>
            <CardContent sx={{ textAlign: "center" }}>
              <Box sx={{ mb: 2 }}>{getStatusIcon(application.status)}</Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Application Status
              </Typography>
              <Chip
                label={getStatusText(application.status)}
                color={getStatusColor(application.status)}
                size="large"
                sx={{ fontWeight: "bold" }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Application ID: {application._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted:{" "}
                {format(new Date(application.applicationDate), "PPP")}
              </Typography>
            </CardContent>
          </StatusCard>
        </Grid>

        {/* Application Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Application Details
            </Typography>
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                >
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.firstName} {application.lastName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.dateOfBirth
                    ? format(new Date(application.dateOfBirth), "MMM dd, yyyy")
                    : "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.gender
                    ? application.gender.charAt(0).toUpperCase() +
                      application.gender.slice(1)
                    : "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Nationality
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.nationality || "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Blood Group
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.bloodGroup || "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  License Type
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.licenseType
                    ? application.licenseType.charAt(0).toUpperCase() +
                      application.licenseType.slice(1)
                    : "Not specified"}
                </Typography>
              </Grid>

              {/* Contact Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.email || "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.phoneNumber || "Not provided"}
                </Typography>
              </Grid>

              {/* Address Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Address Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Full Address
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.address || "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  City
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.city || "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  State
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.state || "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Postal Code
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.postalCode || "Not provided"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Country
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.country || "Not provided"}
                </Typography>
              </Grid>

              {/* Additional Information Section */}
              {(application.previousLicense ||
                application.drivingExperience) && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                      gutterBottom
                      sx={{ mt: 2 }}
                    >
                      Additional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  {application.previousLicense && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Previous License Number
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {application.previousLicense}
                      </Typography>
                    </Grid>
                  )}

                  {application.drivingExperience && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Driving Experience
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {application.drivingExperience} years
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Application Timeline Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Application Timeline
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Application Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.applicationDate
                    ? format(
                        new Date(application.applicationDate),
                        "MMM dd, yyyy 'at' hh:mm a"
                      )
                    : "Not available"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.lastUpdated
                    ? format(
                        new Date(application.lastUpdated),
                        "MMM dd, yyyy 'at' hh:mm a"
                      )
                    : "Not available"}
                </Typography>
              </Grid>
            </Grid>

            {application.statusMessage && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Status Message
                </Typography>
                <Alert severity={getStatusColor(application.status)}>
                  {application.statusMessage}
                </Alert>
              </Box>
            )}

            {application.reviewNotes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Review Notes
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                  <Typography variant="body2">
                    {application.reviewNotes}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Documents */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Submitted Documents
            </Typography>
            <List>
              {application.documents &&
                Object.keys(application.documents).map((docType) => {
                  const document = application.documents[docType];

                  // Handle different document structures
                  let documentData = {};
                  if (typeof document === "string") {
                    // If document is just a string (filename)
                    documentData = {
                      filename: document,
                      originalName: document,
                      type: docType,
                    };
                  } else if (
                    typeof document === "object" &&
                    document !== null
                  ) {
                    // If document is an object with properties
                    documentData = {
                      filename: document.filename || document.name || document,
                      originalName:
                        document.originalName ||
                        document.originalname ||
                        document.filename ||
                        document.name ||
                        document,
                      path: document.path,
                      size: document.size,
                      mimetype: document.mimetype,
                      type: docType,
                    };
                  } else {
                    // Fallback
                    documentData = {
                      filename: "unknown",
                      originalName: "Unknown Document",
                      type: docType,
                    };
                  }

                  console.log(`Document ${docType}:`, documentData);

                  return (
                    <ListItem key={docType} divider>
                      <ListItemIcon>
                        {getDocumentIcon(documentData.filename)}
                      </ListItemIcon>
                      <ListItemText
                        primary={docType
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {documentData.originalName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {documentData.size && (
                                <>
                                  Size: {(documentData.size / 1024).toFixed(1)}{" "}
                                  KB |{" "}
                                </>
                              )}
                              Uploaded:{" "}
                              {document.uploadDate
                                ? format(
                                    new Date(document.uploadDate),
                                    "MMM dd, yyyy"
                                  )
                                : "Date unknown"}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View Document">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewDocument(documentData)}
                            disabled={
                              !documentData.filename ||
                              documentData.filename === "unknown"
                            }
                          >
                            View
                          </Button>
                        </Tooltip>
                        <Tooltip title="Download Document">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<GetApp />}
                            onClick={() => handleDownloadDocument(documentData)}
                            disabled={
                              !documentData.filename ||
                              documentData.filename === "unknown"
                            }
                          >
                            Download
                          </Button>
                        </Tooltip>
                      </Box>
                      <Chip
                        label="Uploaded"
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  );
                })}
              {(!application.documents ||
                Object.keys(application.documents).length === 0) && (
                <ListItem>
                  <ListItemText
                    primary="No documents uploaded"
                    secondary="No documents found for this application"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="error" />
          Cancel Application
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold">
              Are you sure you want to cancel your license application?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This action cannot be undone. You will need to submit a new
              application if you want to apply for a license again.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Application ID: {application?._id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Status: {application && getStatusText(application.status)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)} variant="outlined">
            Keep Application
          </Button>
          <Button
            onClick={handleCancelApplication}
            variant="contained"
            color="error"
            startIcon={<Cancel />}
          >
            Cancel Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog
        open={openDocumentDialog}
        onClose={() => setOpenDocumentDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {selectedDocument && getDocumentIcon(selectedDocument.filename)}
          Document Viewer -{" "}
          {selectedDocument?.type
            ?.replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ textAlign: "center", p: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>File:</strong>{" "}
                {selectedDocument.originalName || selectedDocument.filename}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                <strong>Type:</strong>{" "}
                {selectedDocument.type
                  ?.replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </Typography>

              {/* Document Preview */}
              <Box
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  overflow: "hidden",
                  minHeight: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#f5f5f5",
                }}
              >
                {selectedDocument.filename?.toLowerCase().endsWith(".pdf") ? (
                  <Box sx={{ width: "100%", height: 500 }}>
                    <iframe
                      src={getDocumentUrl(selectedDocument.filename)}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="PDF Document"
                    />
                  </Box>
                ) : (
                  <img
                    src={getDocumentUrl(selectedDocument.filename)}
                    alt={
                      selectedDocument.originalName || selectedDocument.filename
                    }
                    style={{
                      maxWidth: "100%",
                      maxHeight: 500,
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                )}
                <Box
                  sx={{
                    display: "none",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    p: 4,
                  }}
                >
                  <Description sx={{ fontSize: 64, color: "text.secondary" }} />
                  <Typography variant="body1" color="text.secondary">
                    Unable to preview this document
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<GetApp />}
                    onClick={() => handleDownloadDocument(selectedDocument)}
                  >
                    Download to View
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              selectedDocument && handleDownloadDocument(selectedDocument)
            }
            startIcon={<GetApp />}
            variant="outlined"
          >
            Download
          </Button>
          <Button
            onClick={() => setOpenDocumentDialog(false)}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationStatus;
