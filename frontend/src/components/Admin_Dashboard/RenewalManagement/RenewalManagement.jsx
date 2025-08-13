import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import {
  Refresh as RenewIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Assignment as IssueIcon,
  Person as PersonIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const RenewalManagement = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRenewal, setSelectedRenewal] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [issueDialog, setIssueDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5004/api/renewals/admin/all");
      
      if (response.data.success) {
        setRenewals(response.data.renewals);
      }
    } catch (error) {
      console.error("Error fetching renewals:", error);
      setSnackbar({
        open: true,
        message: "Error fetching renewal applications",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewRenewal = (renewal) => {
    setSelectedRenewal(renewal);
    setViewDialog(true);
  };

  const handleStatusUpdate = async (status) => {
    try {
      setProcessing(true);
      const adminId = localStorage.getItem("userId");

      const response = await axios.patch(
        `http://localhost:5004/api/renewals/admin/${selectedRenewal._id}/status`,
        {
          status,
          adminNotes,
          adminId,
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Renewal application ${status} successfully`,
          severity: "success"
        });
        fetchRenewals();
        setStatusDialog(false);
        setAdminNotes("");
      }
    } catch (error) {
      console.error("Error updating renewal status:", error);
      setSnackbar({
        open: true,
        message: "Error updating renewal status",
        severity: "error"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleIssueLicense = async () => {
    try {
      setProcessing(true);
      const adminId = localStorage.getItem("userId");

      const response = await axios.post(
        `http://localhost:5004/api/renewals/admin/${selectedRenewal._id}/issue`,
        { adminId }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Renewed license issued successfully",
          severity: "success"
        });
        fetchRenewals();
        setIssueDialog(false);
      }
    } catch (error) {
      console.error("Error issuing renewed license:", error);
      setSnackbar({
        open: true,
        message: "Error issuing renewed license",
        severity: "error"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "under_review":
        return "info";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getRenewalReasonText = (reason) => {
    switch (reason) {
      case "expiring":
        return "License Expiring Soon";
      case "expired":
        return "License Already Expired";
      case "damaged":
        return "License Damaged";
      case "lost":
        return "License Lost/Stolen";
      default:
        return reason;
    }
  };

  const filteredRenewals = renewals.filter((renewal) => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return renewal.status === "pending";
    if (tabValue === 2) return renewal.status === "approved";
    if (tabValue === 3) return renewal.status === "rejected";
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: "linear-gradient(to right, #1976d2, #42a5f5)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <RenewIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                License Renewal Management
              </Typography>
              <Typography variant="subtitle1">
                Review and process license renewal applications
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={fetchRenewals}
            sx={{ bgcolor: "rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      <Card elevation={2}>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label={`All (${renewals.length})`} />
            <Tab label={`Pending (${renewals.filter(r => r.status === "pending").length})`} />
            <Tab label={`Approved (${renewals.filter(r => r.status === "approved").length})`} />
            <Tab label={`Rejected (${renewals.filter(r => r.status === "rejected").length})`} />
          </Tabs>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell><strong>Applicant</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>National ID</strong></TableCell>
                  <TableCell><strong>License Document</strong></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Submitted</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRenewals.map((renewal) => (
                  <TableRow key={renewal._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#1976d2" }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {renewal.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {renewal.userId?.fullName || renewal.userId?.full_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{renewal.email}</TableCell>
                    <TableCell>{renewal.nationalId}</TableCell>
                    <TableCell>
                      {renewal.currentLicenseDocument ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={renewal.currentLicenseDocument.mimetype === 'application/pdf' ? <PdfIcon /> : <ImageIcon />}
                          onClick={() => window.open(`http://localhost:5004/api/renewals/documents/${renewal.currentLicenseDocument.filename}`, '_blank')}
                          sx={{ textTransform: "none" }}
                        >
                          View Document
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No document
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getRenewalReasonText(renewal.renewalReason)}</TableCell>
                    <TableCell>
                      <Chip
                        label={renewal.status.toUpperCase()}
                        color={getStatusColor(renewal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(renewal.submissionDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewRenewal(renewal)}
                        >
                          View
                        </Button>
                        {renewal.status === "pending" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<ApproveIcon />}
                              onClick={() => {
                                setSelectedRenewal(renewal);
                                setStatusDialog(true);
                              }}
                            >
                              Review
                            </Button>
                          </>
                        )}
                        {renewal.status === "approved" && !renewal.newLicenseIssued && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<IssueIcon />}
                            onClick={() => {
                              setSelectedRenewal(renewal);
                              setIssueDialog(true);
                            }}
                          >
                            Issue License
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRenewals.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No renewal applications found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* View Renewal Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Renewal Application Details</DialogTitle>
        <DialogContent>
          {selectedRenewal && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Applicant Name</Typography>
                <Typography variant="body1">{selectedRenewal.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedRenewal.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">National ID</Typography>
                <Typography variant="body1">{selectedRenewal.nationalId}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Current License Document</Typography>
                {selectedRenewal.currentLicenseDocument ? (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={selectedRenewal.currentLicenseDocument.mimetype === 'application/pdf' ? <PdfIcon /> : <ImageIcon />}
                      onClick={() => window.open(`http://localhost:5004/api/renewals/documents/${selectedRenewal.currentLicenseDocument.filename}`, '_blank')}
                      sx={{ textTransform: "none" }}
                    >
                      View {selectedRenewal.currentLicenseDocument.mimetype === 'application/pdf' ? 'PDF' : 'Image'} Document
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      File: {selectedRenewal.currentLicenseDocument.originalName}
                      ({(selectedRenewal.currentLicenseDocument.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1">No document uploaded</Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Renewal Reason</Typography>
                <Typography variant="body1">{getRenewalReasonText(selectedRenewal.renewalReason)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedRenewal.status.toUpperCase()}
                  color={getStatusColor(selectedRenewal.status)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Submitted Date</Typography>
                <Typography variant="body1">
                  {format(new Date(selectedRenewal.submissionDate), "MMM dd, yyyy HH:mm")}
                </Typography>
              </Grid>
              {selectedRenewal.adminNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Admin Notes</Typography>
                  <Typography variant="body1">{selectedRenewal.adminNotes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Renewal Status</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Admin Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleStatusUpdate("rejected")}
            color="error"
            disabled={processing}
            startIcon={<RejectIcon />}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleStatusUpdate("approved")}
            color="success"
            disabled={processing}
            startIcon={<ApproveIcon />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue License Dialog */}
      <Dialog open={issueDialog} onClose={() => setIssueDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Renewed License</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will generate a new license number and update the expiry date for the approved renewal application.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueDialog(false)}>Cancel</Button>
          <Button
            onClick={handleIssueLicense}
            color="primary"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <IssueIcon />}
          >
            Issue License
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RenewalManagement;
