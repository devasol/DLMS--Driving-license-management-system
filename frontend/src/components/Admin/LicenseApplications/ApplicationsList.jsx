import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    statusMessage: "",
    reviewNotes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApplications, setFilteredApplications] = useState([]);

  const adminId = localStorage.getItem("adminId") || "admin123"; // Get from auth context in a real app

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (applications.length > 0) {
      const filtered = applications.filter(
        (app) =>
          app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.licenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "/api/license/admin/applications/pending"
      );
      setApplications(response.data);
      setFilteredApplications(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch applications");
      setLoading(false);
      console.error("Error fetching applications:", err);
    }
  };

  const handleViewApplication = async (applicationId) => {
    try {
      const response = await axios.get(
        `/api/license/admin/applications/${applicationId}`
      );
      setSelectedApplication(response.data);
      setOpenViewDialog(true);
    } catch (err) {
      console.error("Error fetching application details:", err);
    }
  };

  const handleOpenStatusDialog = (application, initialStatus) => {
    setSelectedApplication(application);
    setStatusUpdate({
      status: initialStatus,
      statusMessage:
        initialStatus === "approved"
          ? "Your license application has been approved. You can now proceed to the next steps."
          : initialStatus === "rejected"
          ? "Your license application has been rejected. Please review the notes for more information."
          : "Your application is under review.",
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
      await axios.patch(
        `https://dlms-driving-license-management-system-v1.onrender.com/api/license/admin/applications/${selectedApplication._id}/status`,
        {
          ...statusUpdate,
          adminId,
        }
      );

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === selectedApplication._id
            ? { ...app, status: statusUpdate.status }
            : app
        )
      );

      setOpenStatusDialog(false);
      // Refresh the list
      fetchApplications();
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  const handleMarkUnderReview = async (applicationId) => {
    try {
      await axios.patch(
        `https://dlms-driving-license-management-system-v1.onrender.com/api/license/admin/applications/${applicationId}/review`,
        { adminId }
      );

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: "under_review" } : app
        )
      );

      // Refresh the list
      fetchApplications();
    } catch (err) {
      console.error("Error marking application under review:", err);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return <Chip label="Pending" color="warning" size="small" />;
      case "under_review":
        return <Chip label="Under Review" color="info" size="small" />;
      case "approved":
        return <Chip label="Approved" color="success" size="small" />;
      case "rejected":
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        License Applications
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <TextField
          label="Search Applications"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {filteredApplications.length === 0 ? (
        <Typography>No pending applications found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>License Type</TableCell>
                <TableCell>Application Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application._id}>
                  <TableCell>{`${application.firstName} ${application.lastName}`}</TableCell>
                  <TableCell>
                    {application.licenseType === "learner"
                      ? "Learner's License"
                      : application.licenseType === "permanent"
                      ? "Permanent License"
                      : "Commercial License"}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(application.applicationDate),
                      "MMM dd, yyyy"
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(application.status)}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewApplication(application._id)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>

                    {application.status === "pending" && (
                      <Button
                        variant="outlined"
                        color="info"
                        onClick={() => handleMarkUnderReview(application._id)}
                        sx={{ mr: 1 }}
                      >
                        Start Review
                      </Button>
                    )}

                    {(application.status === "pending" ||
                      application.status === "under_review") && (
                      <>
                        <Button
                          startIcon={<ApproveIcon />}
                          variant="outlined"
                          color="success"
                          onClick={() =>
                            handleOpenStatusDialog(application, "approved")
                          }
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          startIcon={<RejectIcon />}
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            handleOpenStatusDialog(application, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
                  {format(
                    new Date(selectedApplication.dateOfBirth),
                    "MMM dd, yyyy"
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Gender:</strong> {selectedApplication.gender}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Nationality:</strong>{" "}
                  {selectedApplication.nationality}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Blood Group:</strong>{" "}
                  {selectedApplication.bloodGroup || "Not specified"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Phone:</strong> {selectedApplication.phoneNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Email:</strong> {selectedApplication.email}
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6">Address Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Address:</strong> {selectedApplication.address}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>City:</strong> {selectedApplication.city}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>State:</strong> {selectedApplication.state}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Postal Code:</strong> {selectedApplication.postalCode}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Country:</strong> {selectedApplication.country}
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6">License Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>License Type:</strong>{" "}
                  {selectedApplication.licenseType}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>License Number:</strong>{" "}
                  {selectedApplication.licenseNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Issuing Authority:</strong>{" "}
                  {selectedApplication.issuingAuthority}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Issued Date:</strong>{" "}
                  {format(
                    new Date(selectedApplication.issuedDate),
                    "MMM dd, yyyy"
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Expiry Date:</strong>{" "}
                  {format(
                    new Date(selectedApplication.expiryDate),
                    "MMM dd, yyyy"
                  )}
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6">Application Information</Typography>
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
                  <strong>Status:</strong> {selectedApplication.status}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6">Review Notes</Typography>
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
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Status: {statusUpdate.status}</Typography>
            <Typography>{statusUpdate.statusMessage}</Typography>
          </Box>
          <TextField
            label="Review Notes"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={statusUpdate.reviewNotes}
            onChange={(e) =>
              setStatusUpdate((prev) => ({
                ...prev,
                reviewNotes: e.target.value,
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} color="primary">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationsList;
