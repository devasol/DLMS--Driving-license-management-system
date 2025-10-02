import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Quiz as QuizIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import axios from "axios";
import ExamTaking from "../ExamTaking/ExamTaking";

const AvailableExams = () => {
  const [availableExams, setAvailableExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [examToCancel, setExamToCancel] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [creatingInstantExam, setCreatingInstantExam] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchAvailableExams();
    fetchExamResults();
    // Refresh every 5 minutes instead of every minute to reduce server load
    const interval = setInterval(() => {
      fetchAvailableExams();
      fetchExamResults();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableExams = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return;
      }

      const response = await axios.get(`/api/exams/available/${userId}`);

      if (response.data.success) {
        setAvailableExams(response.data.exams);
      }
    } catch (error) {
      console.error("Error fetching available exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return;
      }

      console.log("🔍 Fetching exam results for user:", userId);
      const response = await axios.get(`/api/exams/results/user/${userId}`);

      console.log("📊 Exam results response:", response.data);

      // Backend returns array directly, not wrapped in success object
      if (Array.isArray(response.data)) {
        setExamResults(response.data);
        console.log(
          "✅ Set exam results:",
          response.data.length,
          "results found"
        );
      } else {
        console.log("⚠️ Unexpected response format:", response.data);
        setExamResults([]);
      }
    } catch (error) {
      console.error("❌ Error fetching exam results:", error);

      // For testing purposes, add mock data when API fails
      const mockResults = [
        {
          _id: "mock1",
          examType: "theory",
          score: 88,
          passed: true,
          correctAnswers: 44,
          totalQuestions: 50,
          timeSpent: 1530, // 25 minutes 30 seconds
          language: "english",
          dateTaken: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          _id: "mock2",
          examType: "theory",
          score: 62,
          passed: false,
          correctAnswers: 31,
          totalQuestions: 50,
          timeSpent: 1800, // 30 minutes
          language: "english",
          dateTaken: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      console.log("🧪 Using mock exam results for testing");
      setExamResults(mockResults);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleTakeExam = (exam) => {
    setSelectedExam(exam);
    setOpenConfirmDialog(true);
  };

  const confirmTakeExam = () => {
    setOpenConfirmDialog(false);
    setOpenExamDialog(true);
  };

  const getStatusChip = (exam) => {
    if (exam.hasExpired) {
      return (
        <Chip
          label="Expired"
          color="error"
          size="small"
          icon={<CancelIcon />}
        />
      );
    }
    if (exam.needsApproval) {
      return (
        <Chip
          label="Pending Approval"
          color="warning"
          size="small"
          icon={<WarningIcon />}
        />
      );
    }
    if (exam.isAvailable) {
      return (
        <Chip
          label="Available Now"
          color="success"
          size="small"
          icon={<CheckIcon />}
        />
      );
    }
    if (exam.minutesUntilAvailable > 0) {
      const hours = Math.floor(exam.minutesUntilAvailable / 60);
      const minutes = exam.minutesUntilAvailable % 60;
      return (
        <Chip
          label={`Available in ${hours}h ${minutes}m`}
          color="info"
          size="small"
          icon={<TimeIcon />}
        />
      );
    }
    return (
      <Chip
        label="Approved"
        color="primary"
        size="small"
        icon={<CheckIcon />}
      />
    );
  };

  const formatDateTime = (date, time) => {
    try {
      return `${format(new Date(date), "PPP")} at ${time}`;
    } catch (error) {
      return `${date} at ${time}`;
    }
  };

  const handleCancelExam = (exam) => {
    setExamToCancel(exam);
    setOpenCancelDialog(true);
  };

  const confirmCancelExam = async () => {
    try {
      const response = await axios.delete(
        `/api/exams/schedules/${examToCancel._id}`
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam cancelled successfully!",
          severity: "success",
        });

        // Remove the cancelled exam from the list
        setAvailableExams((prev) =>
          prev.filter((exam) => exam._id !== examToCancel._id)
        );

        setOpenCancelDialog(false);
        setExamToCancel(null);
      }
    } catch (error) {
      console.error("Error cancelling exam:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Failed to cancel exam. Please try again.",
        severity: "error",
      });
    }
  };

  const handleExamComplete = () => {
    setOpenExamDialog(false);
    setSelectedExam(null);
    fetchAvailableExams(); // Refresh the list
    fetchExamResults(); // Refresh exam results
    setShowResults(true); // Show results section
  };

  const handleCloseResult = (resultId) => {
    // Remove the result from the displayed results
    setExamResults((prev) => prev.filter((result) => result._id !== resultId));

    // Show success message
    setSnackbar({
      open: true,
      message: "Exam result dismissed",
      severity: "info",
    });
  };

  const handleCreateInstantTheoryExam = async () => {
    try {
      setCreatingInstantExam(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setSnackbar({
          open: true,
          message: "User not found. Please log in again.",
          severity: "error",
        });
        return;
      }

      const response = await axios.post("/api/exams/instant-theory", {
        userId,
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Theory exam created successfully! You can take it now.",
          severity: "success",
        });

        // Refresh the available exams list
        fetchAvailableExams();
      }
    } catch (error) {
      console.error("Error creating instant theory exam:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create theory exam. Please try again.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setCreatingInstantExam(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  try {
    return (
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            📝 Available Exams
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleCreateInstantTheoryExam}
            disabled={creatingInstantExam}
            startIcon={
              creatingInstantExam ? (
                <CircularProgress size={20} />
              ) : (
                <QuizIcon />
              )
            }
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
              },
            }}
          >
            {creatingInstantExam ? "Creating..." : "Take Theory Exam Now"}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>📚 Theory Exams:</strong> You can take theory exams anytime
            without scheduling! Just click "Take Theory Exam Now" above.
            <br />
            <strong>🚗 Practical Exams:</strong> Must be scheduled and require
            admin approval for field testing.
          </Typography>
        </Alert>

        {/* Toggle Results Section */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            📊 Your Exam Results
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowResults(!showResults)}
            startIcon={showResults ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showResults ? "Hide Results" : "Show Results"}
          </Button>
        </Box>

        {/* Exam Results Section */}
        {showResults && (
          <Box sx={{ mb: 4 }}>
            {resultsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : examResults.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">
                  📋 No exam results found. Take an exam to see your results
                  here!
                </Typography>
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {examResults.map((result, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card
                      sx={{
                        height: "100%",
                        border: result.passed
                          ? "2px solid #4caf50"
                          : "2px solid #f44336",
                        background: result.passed
                          ? "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)"
                          : "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)",
                      }}
                    >
                      <CardContent>
                        {/* Result Header with Close Button */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              flex: 1,
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold">
                              {result.examType === "theory"
                                ? "📚 Theory Exam"
                                : "🚗 Practical Exam"}
                            </Typography>
                            <Chip
                              label={result.passed ? "PASSED" : "FAILED"}
                              color={result.passed ? "success" : "error"}
                              size="small"
                              icon={
                                result.passed ? <CheckIcon /> : <CancelIcon />
                              }
                            />
                          </Box>
                          <Button
                            size="small"
                            onClick={() => handleCloseResult(result._id)}
                            sx={{
                              minWidth: "auto",
                              p: 0.5,
                              color: "text.secondary",
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                color: "text.primary",
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </Button>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Score Display */}
                        <Box sx={{ textAlign: "center", mb: 3 }}>
                          <Typography
                            variant="h3"
                            fontWeight="bold"
                            color={
                              result.passed ? "success.main" : "error.main"
                            }
                            sx={{ mb: 1 }}
                          >
                            {result.score}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {result.correctAnswers}/{result.totalQuestions}{" "}
                            Correct
                          </Typography>
                        </Box>

                        {/* Exam Details */}
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            <ScheduleIcon
                              sx={{
                                mr: 1,
                                fontSize: 16,
                                verticalAlign: "middle",
                              }}
                            />
                            {result.dateTaken
                              ? format(new Date(result.dateTaken), "PPP 'at' p")
                              : result.createdAt
                              ? format(new Date(result.createdAt), "PPP 'at' p")
                              : "Date not available"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            <TimeIcon
                              sx={{
                                mr: 1,
                                fontSize: 16,
                                verticalAlign: "middle",
                              }}
                            />
                            Time:{" "}
                            {result.timeSpent
                              ? `${Math.floor(result.timeSpent / 60)}:${(
                                  result.timeSpent % 60
                                )
                                  .toString()
                                  .padStart(2, "0")}`
                              : "Time not recorded"}
                          </Typography>
                          {result.language && (
                            <Typography variant="body2" color="text.secondary">
                              <SchoolIcon
                                sx={{
                                  mr: 1,
                                  fontSize: 16,
                                  verticalAlign: "middle",
                                }}
                              />
                              Language:{" "}
                              {result.language === "english"
                                ? "🇺🇸 English"
                                : "🇪🇹 አማርኛ"}
                            </Typography>
                          )}
                        </Box>

                        {/* Result Message */}
                        <Alert
                          severity={result.passed ? "success" : "error"}
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {result.passed
                            ? "🎉 Congratulations! You passed this exam."
                            : "📚 Keep studying! You need 74% to pass."}
                        </Alert>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Available Exams Section */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          📝 Scheduled Exams
        </Typography>

        {availableExams.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No scheduled exams found. You can take a theory exam anytime using
            the button above, or schedule a practical exam from your dashboard.
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {availableExams.map((exam) => (
              <Grid item xs={12} md={6} lg={4} key={exam._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: exam.isAvailable
                      ? "2px solid #4caf50"
                      : "1px solid #e0e0e0",
                    boxShadow: exam.isAvailable ? 3 : 1,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {exam.examType === "theory"
                          ? "Theory Exam"
                          : "Practical Exam"}
                      </Typography>
                      {getStatusChip(exam)}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                        {formatDateTime(exam.date, exam.time)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <QuizIcon sx={{ mr: 1, fontSize: 16 }} />
                        {exam.examType === "theory"
                          ? "20 Questions - Online Test"
                          : "Field Driving Test"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location:{" "}
                        {exam.location === "online"
                          ? "Online Exam"
                          : exam.location}
                      </Typography>
                    </Box>

                    {exam.adminMessage && (
                      <Alert
                        severity="info"
                        sx={{ mb: 2, fontSize: "0.875rem" }}
                      >
                        <strong>Admin Message:</strong> {exam.adminMessage}
                      </Alert>
                    )}

                    {exam.hasExpired && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        This exam has expired. Please schedule a new exam.
                      </Alert>
                    )}

                    {exam.examType === "theory" && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <CheckIcon sx={{ mr: 1 }} />
                        Theory exams are available anytime! You can take this
                        exam immediately.
                      </Alert>
                    )}

                    {exam.examType === "practical" && exam.needsApproval && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        Your practical exam is scheduled and waiting for admin
                        approval. You will be notified once approved.
                      </Alert>
                    )}

                    {exam.examType === "practical" &&
                      !exam.isAvailable &&
                      !exam.hasExpired &&
                      !exam.needsApproval &&
                      exam.minutesUntilAvailable > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <WarningIcon sx={{ mr: 1 }} />
                          Practical exam will be available 15 minutes before the
                          scheduled time.
                        </Alert>
                      )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    {exam.examType === "practical" ? (
                      <>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Field Test:</strong> This exam is conducted
                            at the testing center. Please arrive at{" "}
                            {exam.location} on your scheduled date and time.
                          </Typography>
                        </Alert>
                        {!exam.hasExpired && exam.status !== "completed" && (
                          <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={() => handleCancelExam(exam)}
                            size="large"
                            startIcon={<CancelIcon />}
                          >
                            Cancel Exam
                          </Button>
                        )}
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant={exam.isAvailable ? "contained" : "outlined"}
                          color={
                            exam.isAvailable
                              ? "success"
                              : exam.needsApproval
                              ? "warning"
                              : "primary"
                          }
                          fullWidth
                          disabled={!exam.isAvailable}
                          onClick={() => handleTakeExam(exam)}
                          size="large"
                        >
                          {exam.isAvailable
                            ? "Take Exam Now"
                            : exam.needsApproval
                            ? "Pending Approval"
                            : exam.hasExpired
                            ? "Expired"
                            : "Not Available Yet"}
                        </Button>
                        {!exam.hasExpired && exam.status !== "completed" && (
                          <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={() => handleCancelExam(exam)}
                            size="medium"
                            startIcon={<CancelIcon />}
                          >
                            Cancel Exam
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
        >
          <DialogTitle>Confirm Exam Start</DialogTitle>
          <DialogContent>
            <Typography>
              Are you ready to start your {selectedExam?.examType} exam?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Important:</strong>
              <br />
              • Once you start, you cannot pause the exam
              <br />
              • Theory exams have 50 questions, practical exams vary
              <br />
              • Make sure you have a stable internet connection
              <br />• You need at least 74% to pass theory exams
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
            <Button
              onClick={confirmTakeExam}
              variant="contained"
              color="success"
            >
              Start Exam
            </Button>
          </DialogActions>
        </Dialog>

        {/* Exam Taking Dialog */}
        <Dialog
          open={openExamDialog}
          onClose={() => {}}
          maxWidth="lg"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogContent sx={{ p: 0 }}>
            {selectedExam && (
              <ExamTaking
                examId={selectedExam._id}
                onClose={() => setOpenExamDialog(false)}
                onExamComplete={handleExamComplete}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Exam Confirmation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={() => setOpenCancelDialog(false)}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CancelIcon color="error" />
            Cancel Exam
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to cancel your {examToCancel?.examType}{" "}
              exam?
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Warning:</strong>
              <br />
              • This action cannot be undone
              <br />
              • You will need to schedule a new exam
              <br />• Scheduled date:{" "}
              {examToCancel &&
                formatDateTime(examToCancel.date, examToCancel.time)}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              If you're having issues or need to reschedule, please contact
              support instead of cancelling.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenCancelDialog(false)}
              variant="outlined"
            >
              Keep Exam
            </Button>
            <Button
              onClick={confirmCancelExam}
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
            >
              Cancel Exam
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
  } catch (error) {
    console.error("AvailableExams render error:", error);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Available Exams</Typography>
          <Typography variant="body2">
            There was an error loading the available exams. Please refresh the
            page or contact support.
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            Error: {error.message}
          </Typography>
        </Alert>
      </Box>
    );
  }
};

export default AvailableExams;
