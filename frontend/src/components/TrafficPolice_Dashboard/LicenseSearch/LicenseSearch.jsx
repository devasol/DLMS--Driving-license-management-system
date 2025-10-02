import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  CardMembership as LicenseIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CalendarToday as DateIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";

const LicenseSearch = ({ onViolationAdd }) => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [licenseData, setLicenseData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!licenseNumber.trim()) {
      setError("Please enter a license number");
      return;
    }

    setLoading(true);
    setError("");
    setLicenseData(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/traffic-police/license/${licenseNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLicenseData(response.data);
    } catch (error) {
      console.error("Error searching license:", error);
      if (error.response?.status === 404) {
        setError("License not found. Please check the license number.");
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError("Error searching license. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const getSeverityColor = (points) => {
    if (points >= 8) return "error";
    if (points >= 4) return "warning";
    return "info";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "valid":
        return "success";
      case "expired":
        return "warning";
      case "suspended":
      case "revoked":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            License Search
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter the driving license number to view user information and
            violation history
          </Typography>

          <Box display="flex" gap={2} mt={3}>
            <TextField
              fullWidth
              label="License Number"
              placeholder="e.g., ETH-2025-000001"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <LicenseIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={20} /> : <SearchIcon />
              }
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </motion.div>

      {/* License Information */}
      {licenseData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Grid container spacing={3}>
            {/* User Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      User Information
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {licenseData.userName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {licenseData.userEmail}
                      </Typography>
                    </Grid>
                    {licenseData.userDetails?.nationality && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nationality / ዜግነት
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {licenseData.userDetails.nationality}
                          {licenseData.userDetails.nationality ===
                            "Ethiopian" && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ opacity: 0.7 }}
                            >
                              ኢትዮጵያዊ
                            </Typography>
                          )}
                        </Typography>
                      </Grid>
                    )}
                    {licenseData.userDetails?.bloodType &&
                      licenseData.userDetails.bloodType !== "N/A" && (
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Blood Type / የደም ዓይነት
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            color="error.main"
                          >
                            {licenseData.userDetails.bloodType}
                          </Typography>
                        </Grid>
                      )}
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        License Number
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {licenseData.number}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        License Class
                      </Typography>
                      <Typography variant="body1">
                        Class {licenseData.class}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* License Status */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "info.main" }}>
                      <LicenseIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      License Status
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={licenseData.status}
                        color={getStatusColor(licenseData.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Demerit Points
                      </Typography>
                      <Chip
                        label={`${licenseData.points}/${licenseData.maxPoints}`}
                        color={getSeverityColor(licenseData.points)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Issue Date
                      </Typography>
                      <Typography variant="body1">
                        {format(
                          new Date(licenseData.issueDate),
                          "MMM dd, yyyy"
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Expiry Date
                      </Typography>
                      <Typography variant="body1">
                        {format(
                          new Date(licenseData.expiryDate),
                          "MMM dd, yyyy"
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Restrictions
                      </Typography>
                      <Typography variant="body1">
                        {licenseData.restrictions || "None"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        // Store license data in localStorage for violation form
                        localStorage.setItem(
                          "selectedLicense",
                          JSON.stringify(licenseData)
                        );
                        onViolationAdd && onViolationAdd();
                      }}
                      color="warning"
                    >
                      Add Violation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Violation History */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <WarningIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Violation History ({licenseData.violations?.length || 0})
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {licenseData.violations &&
                  licenseData.violations.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <strong>Type</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Points</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Location</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Date</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Recorded By</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Actions</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {licenseData.violations.map((violation, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Chip
                                  label={violation.type}
                                  color={getSeverityColor(violation.points)}
                                  size="small"
                                  icon={<WarningIcon />}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={`${violation.points} pts`}
                                  color={getSeverityColor(violation.points)}
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <LocationIcon
                                    color="action"
                                    fontSize="small"
                                  />
                                  <Typography variant="body2">
                                    {violation.location || "Not specified"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <DateIcon color="action" fontSize="small" />
                                  <Typography variant="body2">
                                    {format(
                                      new Date(violation.date),
                                      "MMM dd, yyyy"
                                    )}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {violation.recordedBy?.fullName || "System"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="View Details">
                                  <IconButton size="small" color="primary">
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No violations found for this license.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </Box>
  );
};

export default LicenseSearch;
