import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Avatar,
  Divider,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Home,
  Cake,
  CalendarToday,
  Badge,
  Lock,
  Visibility,
  VisibilityOff,
  Assignment,
  Description,
  GetApp,
  CheckCircle,
  Cancel,
  Schedule,
  Pending,
  Public,
  LocalHospital,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const UserDetails = ({ open, user, onClose, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userApplications, setUserApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchUserApplications = async () => {
    if (!user?._id) return;

    try {
      setLoadingApplications(true);
      console.log("Fetching applications for user:", user._id);

      const response = await axios.get(
        `/api/license/applications/user/${user._id}`
      );

      console.log("User applications response:", response.data);
      setUserApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      setUserApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle color="success" />;
      case "rejected":
        return <Cancel color="error" />;
      case "under_review":
        return <Schedule color="info" />;
      default:
        return <Pending color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "under_review":
        return "info";
      default:
        return "warning";
    }
  };

  const handleViewDocument = (document) => {
    console.log("Viewing document:", document);
    const documentUrl = `http://localhost:5001/api/license/documents/${document.filename}`;
    window.open(documentUrl, "_blank");
  };

  const handleDownloadDocument = (document) => {
    console.log("Downloading document:", document);
    const downloadUrl = `http://localhost:5001/api/license/documents/${document.filename}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = document.originalName || document.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (open && user?._id) {
      fetchUserApplications();
    }
  }, [open, user?._id]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          User Details - {user?.fullName || user?.full_name || "N/A"}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {/* Tabs */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Personal Information" />
          <Tab label={`Applications (${userApplications.length})`} />
        </Tabs>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* User Profile Section */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={
                    user?.profilePicture
                      ? `http://localhost:5001/api/users/profile-picture/${user.profilePicture}`
                      : undefined
                  }
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: "primary.main",
                    border: user?.profilePicture ? "3px solid #e0e0e0" : "none",
                    boxShadow: user?.profilePicture
                      ? "0 4px 12px rgba(0,0,0,0.15)"
                      : "none",
                  }}
                >
                  {!user?.profilePicture &&
                    (user?.fullName || user?.full_name || "User")
                      .charAt(0)
                      .toUpperCase()}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {user?.fullName || user?.full_name || "N/A"}
                </Typography>
                <Chip
                  label={
                    user?.role === "admin" || user?.isAdmin ? "Admin" : "User"
                  }
                  color={
                    user?.role === "admin" || user?.isAdmin
                      ? "primary"
                      : "default"
                  }
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Member since: {formatDate(user?.createdAt)}
                </Typography>
              </Paper>
            </Grid>

            {/* User Details Section */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={user?.fullName || user?.full_name || "N/A"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user?.email || user?.user_email || "N/A"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={user?.phone || user?.contact_no || "N/A"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Home color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={user?.address || "N/A"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Cake color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={formatDate(user?.dateOfBirth)}
                    />
                  </ListItem>
                  {user?.nationality && (
                    <ListItem>
                      <ListItemIcon>
                        <Public color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Nationality"
                        secondary={user.nationality}
                      />
                    </ListItem>
                  )}
                  {user?.bloodType && (
                    <ListItem>
                      <ListItemIcon>
                        <LocalHospital color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Blood Type"
                        secondary={
                          <Chip
                            label={user.bloodType}
                            color="error"
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        }
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <Lock color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Password"
                      secondary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {showPassword
                              ? user?.password || "No password set"
                              : "••••••••••••"}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={togglePasswordVisibility}
                            sx={{ ml: 1 }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Applications Tab */}
        {tabValue === 1 && (
          <Box>
            {loadingApplications ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : userApplications.length === 0 ? (
              <Alert severity="info">
                This user has not submitted any license applications yet.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {userApplications.map((application, index) => (
                  <Grid item xs={12} key={application._id || index}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Application #{index + 1}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getStatusIcon(application.status)}
                          <Chip
                            label={
                              application.status?.toUpperCase() || "PENDING"
                            }
                            color={getStatusColor(application.status)}
                            size="small"
                          />
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            License Type
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {application.licenseType?.charAt(0).toUpperCase() +
                              application.licenseType?.slice(1) || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Application Date
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {application.applicationDate
                              ? format(
                                  new Date(application.applicationDate),
                                  "MMM dd, yyyy"
                                )
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Last Updated
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {application.lastUpdated
                              ? format(
                                  new Date(application.lastUpdated),
                                  "MMM dd, yyyy"
                                )
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Application ID
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                          >
                            {application._id || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>

                      {application.statusMessage && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Status Message
                          </Typography>
                          <Alert
                            severity={getStatusColor(application.status)}
                            sx={{ mt: 1 }}
                          >
                            {application.statusMessage}
                          </Alert>
                        </Box>
                      )}

                      {/* Documents Section */}
                      {application.documents &&
                        Object.keys(application.documents).length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              gutterBottom
                            >
                              Uploaded Documents
                            </Typography>
                            <List dense>
                              {Object.entries(application.documents).map(
                                ([docType, document]) => {
                                  const documentData =
                                    typeof document === "object"
                                      ? document
                                      : {
                                          filename: document,
                                          originalName: document,
                                        };

                                  return (
                                    <ListItem key={docType} divider>
                                      <ListItemIcon>
                                        <Description color="primary" />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={docType
                                          .replace(/([A-Z])/g, " $1")
                                          .replace(/^./, (str) =>
                                            str.toUpperCase()
                                          )}
                                        secondary={
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                            >
                                              {documentData.originalName ||
                                                documentData.filename}
                                            </Typography>
                                            {documentData.size && (
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                              >
                                                Size:{" "}
                                                {(
                                                  documentData.size / 1024
                                                ).toFixed(1)}{" "}
                                                KB
                                              </Typography>
                                            )}
                                          </Box>
                                        }
                                      />
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <Tooltip title="View Document">
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<Visibility />}
                                            onClick={() =>
                                              handleViewDocument(documentData)
                                            }
                                            disabled={!documentData.filename}
                                          >
                                            View
                                          </Button>
                                        </Tooltip>
                                        <Tooltip title="Download Document">
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<GetApp />}
                                            onClick={() =>
                                              handleDownloadDocument(
                                                documentData
                                              )
                                            }
                                            disabled={!documentData.filename}
                                          >
                                            Download
                                          </Button>
                                        </Tooltip>
                                      </Box>
                                    </ListItem>
                                  );
                                }
                              )}
                            </List>
                          </Box>
                        )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" onClick={onDelete}>
          Delete User
        </Button>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetails;
