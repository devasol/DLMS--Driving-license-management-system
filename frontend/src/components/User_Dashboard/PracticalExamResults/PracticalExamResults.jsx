import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  DriveEta as DriveIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";

const PracticalExamResults = ({ onClose }) => {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPracticalExamResults();

    // Auto-refresh every 2 minutes instead of 30 seconds to reduce server load
    const interval = setInterval(fetchPracticalExamResults, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchPracticalExamResults = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Use the dedicated practical exam results endpoint for better data consistency
      const response = await axios.get(
        `http://localhost:5004/api/exams/practical-results/${userId}`
      );

      if (response.data.success) {
        setExamResults(response.data.data);
      } else {
        setExamResults([]);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching practical exam results:", err);
      setError("Failed to load practical exam results");
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "scheduled":
        return <Chip label="Scheduled" color="primary" size="small" />;
      case "approved":
        return (
          <Chip label="Approved - Ready for Test" color="info" size="small" />
        );
      case "completed":
        return <Chip label="Test Completed" color="success" size="small" />;
      case "pending_approval":
        return (
          <Chip label="Result Under Review" color="warning" size="small" />
        );
      case "rejected":
        return <Chip label="Result Rejected" color="error" size="small" />;
      case "cancelled":
        return <Chip label="Cancelled" color="default" size="small" />;
      case "no-show":
        return <Chip label="No Show" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getResultChip = (result) => {
    if (result === "pass") {
      return <Chip label="PASS" color="success" size="small" />;
    } else if (result === "fail") {
      return <Chip label="FAIL" color="error" size="small" />;
    }
    return null;
  };

  const getStatusMessage = (exam) => {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    switch (exam.status) {
      case "scheduled":
        return {
          type: "info",
          title: "📅 Exam Scheduled",
          message: `Your practical driving test is scheduled for ${formatDate(
            exam.date
          )} at ${exam.time}. Please arrive 30 minutes early at ${
            exam.location
          } with all required documents.`,
        };
      case "approved":
        return {
          type: "success",
          title: "✅ Ready for Test",
          message: `Your exam schedule has been approved! Please arrive at ${
            exam.location
          } on ${formatDate(exam.date)} at ${
            exam.time
          } for your practical driving test.`,
        };
      case "pending_approval":
        return {
          type: "warning",
          title: "⏳ Result Under Review",
          message:
            "You have completed your practical driving test. Your results are currently being reviewed by our administrators. This page will automatically refresh to show your final results once the review is complete.",
        };
      case "completed":
        return {
          type: exam.result === "pass" ? "success" : "error",
          title:
            exam.result === "pass"
              ? "🎉 Congratulations! You Passed!"
              : "📝 Test Completed - Please Review",
          message:
            exam.result === "pass"
              ? "Excellent! You have successfully passed your practical driving test. You can now proceed with your license application."
              : "You have completed your practical driving test. Please review the feedback below and consider additional practice before retaking the test.",
        };
      case "rejected":
        return {
          type: "error",
          title: "❌ Result Rejected",
          message:
            "Your practical exam result has been rejected by the administrator. Please contact support for more information or to schedule a retest.",
        };
      case "cancelled":
        return {
          type: "warning",
          title: "🚫 Exam Cancelled",
          message:
            "Your practical driving test has been cancelled. Please reschedule your exam or contact support for assistance.",
        };
      case "no-show":
        return {
          type: "error",
          title: "⚠️ No Show",
          message:
            "You did not attend your scheduled practical driving test. Please reschedule your exam to continue with the licensing process.",
        };
      default:
        return {
          type: "info",
          title: "📋 Exam Status",
          message:
            "Your practical exam status is being updated. Please check back later for more information.",
        };
    }
  };

  const renderExamDetails = (exam) => {
    const statusInfo = getStatusMessage(exam);

    return (
      <Card key={exam._id} sx={{ mb: 2 }}>
        <CardContent>
          {/* Status Alert */}
          <Alert severity={statusInfo.type} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {statusInfo.title}
            </Typography>
            <Typography variant="body2">{statusInfo.message}</Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <DriveIcon color="primary" />
                <Typography variant="h6">Practical Driving Test</Typography>
                {getStatusChip(exam.status)}
                {exam.result && getResultChip(exam.result)}
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date & Time"
                    secondary={`${new Date(
                      exam.date
                    ).toLocaleDateString()} at ${exam.time}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location"
                    secondary={exam.location || "Not specified"}
                  />
                </ListItem>
                {exam.examResult?.evaluatedBy && (
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Evaluated By"
                      secondary={exam.examResult.evaluatedBy}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              {(exam.status === "completed" ||
                exam.status === "pending_approval") &&
              exam.examResult ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <AssessmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Exam Results
                  </Typography>

                  {exam.examResult.score && (
                    <Box sx={{ mb: 2, textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        color={
                          exam.examResult.score >= 70
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {exam.examResult.score}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Final Score
                      </Typography>
                    </Box>
                  )}

                  {exam.examResult.overallPerformance && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Overall Performance:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {exam.examResult.overallPerformance.replace("_", " ")}
                      </Typography>
                    </Box>
                  )}

                  {exam.examResult.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Instructor Notes:
                      </Typography>
                      <Typography variant="body2">
                        {exam.examResult.notes}
                      </Typography>
                    </Box>
                  )}

                  {exam.adminMessage && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Admin Message:
                      </Typography>
                      <Typography variant="body2">
                        {exam.adminMessage}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <AssessmentIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    {exam.status === "scheduled" || exam.status === "approved"
                      ? "Results Not Available Yet"
                      : "No Results Available"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exam.status === "scheduled"
                      ? "Results will be available after you complete your practical driving test"
                      : exam.status === "approved"
                      ? "Please complete your practical driving test to see results"
                      : "Results are not available for this exam"}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Detailed Assessment - Only show if results are available */}
          {(exam.status === "completed" ||
            exam.status === "pending_approval") &&
            exam.examResult && (
              <>
                {exam.examResult.maneuvers &&
                  Object.keys(exam.examResult.maneuvers).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Driving Maneuvers Assessment
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(exam.examResult.maneuvers).map(
                          ([key, value]) => (
                            <Grid item xs={6} md={4} key={key}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {value === "pass" ? (
                                  <CheckIcon color="success" fontSize="small" />
                                ) : value === "fail" ? (
                                  <CancelIcon color="error" fontSize="small" />
                                ) : (
                                  <ScheduleIcon
                                    color="disabled"
                                    fontSize="small"
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </Typography>
                              </Box>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  )}

                {exam.examResult.trafficRules &&
                  Object.keys(exam.examResult.trafficRules).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Traffic Rules & Safety Assessment
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(exam.examResult.trafficRules).map(
                          ([key, value]) => (
                            <Grid item xs={6} md={4} key={key}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {value === "pass" ? (
                                  <CheckIcon color="success" fontSize="small" />
                                ) : value === "fail" ? (
                                  <CancelIcon color="error" fontSize="small" />
                                ) : (
                                  <ScheduleIcon
                                    color="disabled"
                                    fontSize="small"
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </Typography>
                              </Box>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  )}
              </>
            )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading practical exam results...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          🚗 Practical Exam Results
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
            Auto-refreshes every 30 seconds
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchPracticalExamResults}
            disabled={loading}
            size="small"
          >
            Refresh Now
          </Button>
          {onClose && (
            <Button variant="outlined" onClick={onClose} size="small">
              Close
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {examResults.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <DriveIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No practical exams scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Schedule a practical driving test to see your exam status and
            results here
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Schedule Practical Exam
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Track your practical driving test status and view results
          </Typography>
          {examResults.map(renderExamDetails)}
        </Box>
      )}
    </Paper>
  );
};

export default PracticalExamResults;
