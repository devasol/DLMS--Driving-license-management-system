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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import {
  CardMembership as LicenseIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Block as SuspendIcon,
  CheckCircle as ActivateIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as ApproveIcon,
  People as PeopleIcon,
  Gavel as IssueIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const LicenseManagement = () => {
  const [licenses, setLicenses] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(0); // 0: Issued Licenses, 1: Eligible Users
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (activeTab === 0) {
      fetchLicenses();
    } else {
      fetchEligibleUsers();
    }
  }, [page, statusFilter, classFilter, activeTab]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await axios.get(
        `http://localhost:5004/api/payments/licenses?${params}`
      );

      if (response.data.success) {
        setLicenses(response.data.licenses);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error("Error fetching licenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleUsers = async () => {
    try {
      setLoading(true);

      // Get all payments that are verified but don't have licenses yet
      const response = await axios.get(
        "http://localhost:5004/api/payments/all"
      );

      if (response.data.success) {
        const verifiedPayments = response.data.payments.filter(
          (payment) => payment.status === "verified"
        );

        // Check each payment to see if user is eligible for license
        const eligibleUsersData = [];

        for (const payment of verifiedPayments) {
          try {
            const eligibilityResponse = await axios.get(
              `http://localhost:5004/api/payments/license/eligibility/${payment.userId._id}`
            );

            if (
              eligibilityResponse.data.success &&
              eligibilityResponse.data.eligible
            ) {
              eligibleUsersData.push({
                ...payment,
                eligibilityData: eligibilityResponse.data,
              });
            }
          } catch (error) {
            console.log(
              `Error checking eligibility for user ${payment.userId._id}:`,
              error
            );
          }
        }

        setEligibleUsers(eligibleUsersData);
        console.log(
          `Found ${eligibleUsersData.length} eligible users for license issuance`
        );
      }
    } catch (error) {
      console.error("Error fetching eligible users:", error);
      setSnackbar({
        open: true,
        message: "Error fetching eligible users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIssueLicense = async (payment) => {
    try {
      setProcessing(true);
      const adminId = localStorage.getItem("userId");

      console.log(`🎫 Issuing license for payment ${payment._id}`);

      const response = await axios.post(
        `http://localhost:5004/api/payments/license/issue/${payment._id}`,
        {
          adminId: adminId,
          adminNotes: "License issued by admin",
          licenseClass: "B", // Default to Class B
        }
      );

      if (response.data.success) {
        if (response.data.alreadyIssued) {
          setSnackbar({
            open: true,
            message: `ℹ️ License already issued for ${payment.userName}. License Number: ${response.data.license.number}`,
            severity: "info",
          });
        } else {
          setSnackbar({
            open: true,
            message: `✅ License issued successfully for ${payment.userName}. License Number: ${response.data.license.number}`,
            severity: "success",
          });
        }

        // Refresh the eligible users list
        fetchEligibleUsers();

        // Also refresh licenses if on that tab
        if (activeTab === 0) {
          fetchLicenses();
        }
      } else {
        setSnackbar({
          open: true,
          message: "❌ Failed to issue license: " + response.data.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error issuing license:", error);
      setSnackbar({
        open: true,
        message:
          "❌ Error issuing license: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadLicense = async (license) => {
    try {
      console.log(`📄 Downloading license for user ${license.userId._id}`);

      const response = await axios.get(
        `http://localhost:5004/api/payments/license/download/${license.userId._id}`,
        {
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Ethiopian_Driving_License_${license.number}.html`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "✅ License downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading license:", error);
      setSnackbar({
        open: true,
        message: "❌ Error downloading license",
        severity: "error",
      });
    }
  };

  const handleViewDetails = (license) => {
    setSelectedLicense(license);
    setShowDetailDialog(true);
  };

  const handleSuspendLicense = async (license) => {
    const reason = prompt("Please provide a reason for suspension:");
    if (!reason) return;

    try {
      // Implementation for suspending license
      alert("License suspension functionality would be implemented here");
    } catch (error) {
      console.error("Error suspending license:", error);
    }
  };

  const handleActivateLicense = async (license) => {
    try {
      // Implementation for activating license
      alert("License activation functionality would be implemented here");
    } catch (error) {
      console.error("Error activating license:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Valid: "success",
      Expired: "warning",
      Suspended: "error",
      Revoked: "error",
    };
    return colors[status] || "default";
  };

  const getClassColor = (licenseClass) => {
    const colors = {
      A: "primary",
      B: "success",
      C: "warning",
      D: "info",
      E: "secondary",
    };
    return colors[licenseClass] || "default";
  };

  const filteredLicenses = licenses.filter(
    (license) =>
      license.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatistics = () => {
    const total = licenses.length;
    const valid = licenses.filter((l) => l.status === "Valid").length;
    const expired = licenses.filter((l) => l.status === "Expired").length;
    const suspended = licenses.filter((l) => l.status === "Suspended").length;

    return { total, valid, expired, suspended };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🪪 License Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage issued licenses and approve new license applications
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<LicenseIcon />}
            label="Issued Licenses"
            iconPosition="start"
          />
          <Tab
            icon={<PeopleIcon />}
            label="Eligible Users"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <LicenseIcon
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Licenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <CheckCircleIcon
                sx={{ fontSize: 40, color: "success.main", mb: 1 }}
              />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.valid}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.expired}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.suspended}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspended
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, license number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Valid">Valid</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
                <MenuItem value="Revoked">Revoked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={classFilter}
                label="Class"
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <MenuItem value="all">All Classes</MenuItem>
                <MenuItem value="A">Class A</MenuItem>
                <MenuItem value="B">Class B</MenuItem>
                <MenuItem value="C">Class C</MenuItem>
                <MenuItem value="D">Class D</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" onClick={fetchLicenses}>
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 ? (
        // Issued Licenses Tab
        <>
          {filteredLicenses.length === 0 ? (
            <Alert severity="info">
              No licenses found matching your criteria.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>License Holder</TableCell>
                    <TableCell>License Number</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLicenses.map((license) => (
                    <TableRow key={license._id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {license.userName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {license.userName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {license.userEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          fontWeight="bold"
                          sx={{ fontSize: "1.1rem" }}
                        >
                          {license.number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Class ${license.class}`}
                          color={getClassColor(license.class)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={license.status}
                          color={getStatusColor(license.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {license.issueDate &&
                        !isNaN(new Date(license.issueDate))
                          ? format(new Date(license.issueDate), "PPP")
                          : "Invalid date"}
                      </TableCell>
                      <TableCell>
                        {license.expiryDate &&
                        !isNaN(new Date(license.expiryDate))
                          ? format(new Date(license.expiryDate), "PPP")
                          : "Invalid date"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewDetails(license)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadLicense(license)}
                          >
                            Download
                          </Button>
                          {license.status === "Valid" ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<SuspendIcon />}
                              onClick={() => handleSuspendLicense(license)}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<ActivateIcon />}
                              onClick={() => handleActivateLicense(license)}
                            >
                              Activate
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : (
        // Eligible Users Tab
        <>
          {eligibleUsers.length === 0 ? (
            <Alert severity="info">
              No users are currently eligible for license issuance. Users must
              pass both theory and practical exams and have verified payment.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Payment Status</TableCell>
                    <TableCell>Theory Exam</TableCell>
                    <TableCell>Practical Exam</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eligibleUsers.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {payment.userName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {payment.userName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {payment.userId?.email || payment.userEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color="success"
                          size="small"
                        />
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {payment.amount} {payment.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label="Passed" color="success" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label="Passed" color="success" size="small" />
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.paymentDate), "PPP")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<IssueIcon />}
                          onClick={() => handleIssueLicense(payment)}
                          disabled={processing}
                        >
                          Issue License
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>License Details</DialogTitle>
        <DialogContent>
          {selectedLicense && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  License Information
                </Typography>
                <Typography variant="body1">
                  <strong>Number:</strong> {selectedLicense.number}
                </Typography>
                <Typography variant="body1">
                  <strong>Class:</strong> {selectedLicense.class}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {selectedLicense.status}
                </Typography>
                <Typography variant="body1">
                  <strong>Issue Date:</strong>{" "}
                  {format(new Date(selectedLicense.issueDate), "PPP")}
                </Typography>
                <Typography variant="body1">
                  <strong>Expiry Date:</strong>{" "}
                  {format(new Date(selectedLicense.expiryDate), "PPP")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Holder Information
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {selectedLicense.userName}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {selectedLicense.userEmail}
                </Typography>
                <Typography variant="body1">
                  <strong>Restrictions:</strong>{" "}
                  {selectedLicense.restrictions || "None"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Exam Results
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2">Theory Exam</Typography>
                        <Typography variant="h6" color="success.main">
                          {selectedLicense.theoryExamResult?.score}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2">
                          Practical Exam
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {selectedLicense.practicalExamResult?.score}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() =>
              selectedLicense && handleDownloadLicense(selectedLicense)
            }
          >
            Download
          </Button>
          <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LicenseManagement;
