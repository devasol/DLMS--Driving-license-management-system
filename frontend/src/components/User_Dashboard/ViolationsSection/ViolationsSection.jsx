import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Avatar,
} from "@mui/material";
import {
  Gavel as ViolationIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import axios from "axios";

const ViolationsSection = ({ onClose }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchUserViolations();
  }, []);

  const fetchUserViolations = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User not found. Please log in again.");
        return;
      }

      const response = await axios.get(
        `http://localhost:5004/api/license/violations/user/${userId}`
      );

      // Handle the new response format
      if (response.data.success) {
        setViolations(response.data.violations || []);
        setTotalPoints(response.data.totalPoints || 0);
      } else {
        setViolations([]);
        setTotalPoints(0);
      }
    } catch (error) {
      console.error("Error fetching violations:", error);
      if (error.response?.status === 404) {
        // No license found - this is normal for new users
        setViolations([]);
        setTotalPoints(0);
      } else {
        setError("Failed to load violations. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (points) => {
    if (points >= 8) return "error";
    if (points >= 4) return "warning";
    return "info";
  };

  const getPointsStatus = (points) => {
    if (points === 0) return { color: "success", text: "Clean Record" };
    if (points <= 3) return { color: "info", text: "Good Standing" };
    if (points <= 6) return { color: "warning", text: "Caution" };
    if (points <= 9) return { color: "error", text: "High Risk" };
    return { color: "error", text: "Critical" };
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={onClose} startIcon={<BackIcon />}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const pointsStatus = getPointsStatus(totalPoints);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          onClick={onClose}
          startIcon={<BackIcon />}
          sx={{ mr: 2, color: "white" }}
        >
          Back
        </Button>
        <ViolationIcon sx={{ fontSize: 40, color: "white", mr: 2 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
            Traffic Violations
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: "rgba(255,255,255,0.8)" }}
          >
            Your violation history and demerit points
          </Typography>
        </Box>
      </Box>

      {/* Points Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Avatar
                sx={{
                  bgcolor:
                    pointsStatus.color === "success"
                      ? "#4caf50"
                      : pointsStatus.color === "info"
                      ? "#2196f3"
                      : pointsStatus.color === "warning"
                      ? "#ff9800"
                      : "#f44336",
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {totalPoints}
                </Typography>
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Total Demerit Points
              </Typography>
              <Chip
                label={pointsStatus.text}
                color={pointsStatus.color}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Avatar
                sx={{
                  bgcolor: violations.length === 0 ? "#4caf50" : "#2196f3",
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {violations.length}
                </Typography>
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Total Violations
              </Typography>
              <Chip
                label={
                  violations.length === 0
                    ? "Clean Record"
                    : `${violations.length} Violation${
                        violations.length > 1 ? "s" : ""
                      }`
                }
                color={violations.length === 0 ? "success" : "info"}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Violations Table */}
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center" }}
          >
            <ViolationIcon sx={{ mr: 1 }} />
            Violation History
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {violations.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CheckIcon sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                No Violations Found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Congratulations! You have a clean driving record. Keep up the
                excellent driving!
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Violation Type</strong>
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
                      <strong>Description</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Recorded By</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {violations.map((violation, index) => (
                    <TableRow key={violation._id || index} hover>
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
                          <LocationIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {violation.location || "Not specified"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DateIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {format(new Date(violation.date), "MMM dd, yyyy")}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {violation.description || "No additional details"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {violation.recordedBy?.fullName || "System"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Important Notice */}
          {totalPoints > 6 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Important Notice:</strong> You have accumulated{" "}
                {totalPoints} demerit points. If you reach 12 points, your
                license may be suspended. Please drive carefully and consider
                taking a defensive driving course.
              </Typography>
            </Alert>
          )}

          {totalPoints >= 12 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>License Suspension Warning:</strong> You have reached
                the maximum demerit points limit. Your license may be suspended.
                Please contact the licensing authority immediately.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViolationsSection;
