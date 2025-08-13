import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  School,
  Event,
  LocationOn,
  AccessTime,
  Delete,
  Edit,
  Cancel,
} from "@mui/icons-material";
import axios from "axios";
import { styled } from "@mui/system";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: "#f8f9fa",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
}));

const ExamSchedule = () => {
  const [writtenExams, setWrittenExams] = useState([]);
  const [practicalExams, setPracticalExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchExamSchedules();

    // Add refresh event listener
    const handleRefresh = () => {
      fetchExamSchedules();
    };

    window.addEventListener("refresh-exam-schedule", handleRefresh);

    return () => {
      window.removeEventListener("refresh-exam-schedule", handleRefresh);
    };
  }, []);

  const fetchExamSchedules = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Fetch written exams
      const writtenResponse = await axios.get(
        `http://localhost:5004/api/exams/written/${userId}`
      );
      setWrittenExams(writtenResponse.data);

      // Fetch practical exams
      const practicalResponse = await axios.get(
        `http://localhost:5004/api/exams/practical/${userId}`
      );
      setPracticalExams(practicalResponse.data);

      setLoading(false);
      setError("");
    } catch (err) {
      console.error("Error fetching exam schedules:", err);
      setError("Failed to load exam schedules");
      setLoading(false);
    }
  };

  const handleCancelExam = async (examId, examType) => {
    if (!window.confirm("Are you sure you want to cancel this exam? This action cannot be undone.")) {
      return;
    }

    try {
      // Use the correct API endpoint and port
      await axios.delete(
        `http://localhost:5004/api/exams/schedules/${examId}`
      );

      // Update the local state
      if (examType === "theory" || examType === "written") {
        setWrittenExams((prev) => prev.filter((exam) => exam._id !== examId));
      } else {
        setPracticalExams((prev) => prev.filter((exam) => exam._id !== examId));
      }

      setSuccessMessage("Exam cancelled successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error canceling exam:", err);
      setError("Failed to cancel exam: " + (err.response?.data?.message || err.message));
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleEditExam = (exam) => {
    // For now, just show an alert. In a full implementation, this would open an edit dialog
    alert(`Edit functionality for ${exam.type} exam on ${new Date(exam.date).toLocaleDateString()} is not yet implemented. Please cancel and reschedule if needed.`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const examSchedules = [...writtenExams, ...practicalExams];

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Scheduled Exams
      </Typography>

      {/* Success Message */}
      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <Typography color="success.main" variant="body2">
            ✅ {successMessage}
          </Typography>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            ❌ {error}
          </Typography>
        </Box>
      )}

      {examSchedules.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <School sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No exams scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Schedule your theory or practical exam to get started
          </Typography>
        </Box>
      ) : (
        <List>
          {examSchedules.map((exam) => (
            <StyledPaper key={exam._id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {exam.type === "theory" ? (
                      <School color="primary" />
                    ) : (
                      <Event color="secondary" />
                    )}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {exam.type === "theory" ? "Theory" : "Practical"} Exam
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Event fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(exam.date)}
                          </Typography>
                        </Box>
                        {exam.time && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(exam.time)}
                            </Typography>
                          </Box>
                        )}
                        {exam.location && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {exam.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={exam.status}
                    color={
                      exam.status === "scheduled" ? "primary" :
                      exam.status === "approved" ? "success" :
                      exam.status === "completed" ? "success" :
                      exam.status === "rejected" ? "error" : "default"
                    }
                    size="small"
                  />

                  {/* Action Buttons - Only show for scheduled exams */}
                  {exam.status === "scheduled" && (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit Exam">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditExam(exam)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel Exam">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancelExam(exam._id, exam.type)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Box>
            </StyledPaper>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ExamSchedule;
