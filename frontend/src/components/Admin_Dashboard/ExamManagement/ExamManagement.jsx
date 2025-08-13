import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Quiz as QuizIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Grade as GradeIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const ExamManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [examSchedules, setExamSchedules] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEditQuestionDialog, setOpenEditQuestionDialog] = useState(false);
  const [openEditResultDialog, setOpenEditResultDialog] = useState(false);
  const [openDeleteResultDialog, setOpenDeleteResultDialog] = useState(false);
  const [openAddResultDialog, setOpenAddResultDialog] = useState(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    userId: "",
    userName: "",
    examType: "theory",
    date: "",
    time: "",
    location: "main-center",
    status: "scheduled",
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "traffic-rules",
    difficulty: "medium",
  });

  const [resultForm, setResultForm] = useState({
    userId: "",
    userName: "",
    examType: "theory",
    score: "",
    passed: false,
    correctAnswers: "",
    totalQuestions: "10",
    timeSpent: "",
    language: "english",
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch data functions
  const fetchExamSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5004/api/exams/schedules"
      );

      // Handle different response structures
      let schedules = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        schedules = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        schedules = response.data;
      } else if (response.data && response.data.schedules && Array.isArray(response.data.schedules)) {
        schedules = response.data.schedules;
      }

      setExamSchedules(schedules);
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5004/api/exams/questions"
      );

      // Handle different response structures
      let questions = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        questions = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        questions = response.data;
      } else if (response.data && response.data.questions && Array.isArray(response.data.questions)) {
        questions = response.data.questions;
      }

      setExamQuestions(questions);
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      setExamQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5004/api/exams/results"
      );

      // Handle different response structures
      let results = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        results = response.data.results;
      }

      setExamResults(results);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamSchedules();
    fetchExamQuestions();
    fetchExamResults();
  }, []);

  // Handle form submissions
  const handleScheduleSubmit = async () => {
    try {
      if (!scheduleForm.userId || !scheduleForm.date || !scheduleForm.time) {
        setSnackbar({
          open: true,
          message: "Please fill in all required fields",
          severity: "error",
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:5004/api/exams/schedule",
        scheduleForm
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam scheduled successfully!",
          severity: "success",
        });
        setOpenScheduleDialog(false);
        fetchExamSchedules();
        setScheduleForm({
          userId: "",
          userName: "",
          examType: "theory",
          date: "",
          time: "",
          location: "main-center",
          status: "scheduled",
        });
      }
    } catch (error) {
      console.error("Error scheduling exam:", error);
      setSnackbar({
        open: true,
        message:
          "Error scheduling exam: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleQuestionSubmit = async () => {
    try {
      if (
        !questionForm.question ||
        questionForm.options.some((opt) => !opt.trim())
      ) {
        setSnackbar({
          open: true,
          message: "Please fill in the question and all options",
          severity: "error",
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:5004/api/exams/questions",
        questionForm
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Question added successfully!",
          severity: "success",
        });
        setOpenQuestionDialog(false);
        fetchExamQuestions();
        setQuestionForm({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          category: "traffic-rules",
          difficulty: "medium",
        });
      }
    } catch (error) {
      console.error("Error adding question:", error);
      setSnackbar({
        open: true,
        message:
          "Error adding question: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleApproveSchedule = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5004/api/exams/schedules/${selectedItem._id}/approve`,
        { adminMessage }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam schedule approved successfully!",
          severity: "success",
        });
        setOpenApproveDialog(false);
        setAdminMessage("");
        fetchExamSchedules();
      }
    } catch (error) {
      console.error("Error approving exam schedule:", error);
      setSnackbar({
        open: true,
        message:
          "Error approving exam schedule: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleRejectSchedule = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5004/api/exams/schedules/${selectedItem._id}/reject`,
        { adminMessage }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam schedule rejected successfully!",
          severity: "success",
        });
        setOpenRejectDialog(false);
        setAdminMessage("");
        fetchExamSchedules();
      }
    } catch (error) {
      console.error("Error rejecting exam schedule:", error);
      setSnackbar({
        open: true,
        message:
          "Error rejecting exam schedule: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this exam schedule?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5004/api/exams/schedules/${scheduleId}`
        );

        if (response.data.success) {
          setSnackbar({
            open: true,
            message: "Exam schedule deleted successfully!",
            severity: "success",
          });
          fetchExamSchedules();
        }
      } catch (error) {
        console.error("Error deleting exam schedule:", error);
        setSnackbar({
          open: true,
          message:
            "Error deleting exam schedule: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5004/api/exams/questions/${questionId}`
        );

        if (response.data.success) {
          setSnackbar({
            open: true,
            message: "Question deleted successfully!",
            severity: "success",
          });
          fetchExamQuestions();
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        setSnackbar({
          open: true,
          message:
            "Error deleting question: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      }
    }
  };

  const handleEditSchedule = async () => {
    try {
      if (!selectedItem.date || !selectedItem.time) {
        setSnackbar({
          open: true,
          message: "Please fill in all required fields",
          severity: "error",
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5004/api/exams/schedules/${selectedItem._id}`,
        {
          userName: selectedItem.userName,
          examType: selectedItem.examType,
          date: selectedItem.date,
          time: selectedItem.time,
          location: selectedItem.location,
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam schedule updated successfully!",
          severity: "success",
        });
        setOpenEditDialog(false);
        setSelectedItem(null);
        fetchExamSchedules();
      }
    } catch (error) {
      console.error("Error updating exam schedule:", error);
      setSnackbar({
        open: true,
        message:
          "Error updating exam schedule: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleEditQuestion = async () => {
    try {
      if (
        !selectedItem.question ||
        selectedItem.options.some((opt) => !opt.trim())
      ) {
        setSnackbar({
          open: true,
          message: "Please fill in the question and all options",
          severity: "error",
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5004/api/exams/questions/${selectedItem._id}`,
        {
          question: selectedItem.question,
          options: selectedItem.options,
          correctAnswer: selectedItem.correctAnswer,
          category: selectedItem.category,
          difficulty: selectedItem.difficulty,
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Question updated successfully!",
          severity: "success",
        });
        setOpenEditQuestionDialog(false);
        setSelectedItem(null);
        fetchExamQuestions();
      }
    } catch (error) {
      console.error("Error updating question:", error);
      setSnackbar({
        open: true,
        message:
          "Error updating question: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  // Result management functions
  const handleAddResult = async () => {
    try {
      if (!resultForm.userId || !resultForm.score) {
        setSnackbar({
          open: true,
          message: "Please fill in User ID and Score",
          severity: "error",
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:5004/api/exams/submit-result",
        {
          ...resultForm,
          score: parseInt(resultForm.score),
          correctAnswers: parseInt(resultForm.correctAnswers),
          totalQuestions: parseInt(resultForm.totalQuestions),
          timeSpent: parseInt(resultForm.timeSpent) || 0,
          passed: parseInt(resultForm.score) >= 74,
          dateTaken: new Date().toISOString(),
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam result added successfully!",
          severity: "success",
        });
        setOpenAddResultDialog(false);
        setResultForm({
          userId: "",
          userName: "",
          examType: "theory",
          score: "",
          passed: false,
          correctAnswers: "",
          totalQuestions: "10",
          timeSpent: "",
          language: "english",
        });
        fetchExamResults();
      }
    } catch (error) {
      console.error("Error adding exam result:", error);
      setSnackbar({
        open: true,
        message:
          "Error adding exam result: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleEditResult = (result) => {
    setSelectedItem(result);
    setResultForm({
      userId: result.userId || "",
      userName: result.userName || "",
      examType: result.examType || "theory",
      score: result.score?.toString() || "",
      passed: result.passed || false,
      correctAnswers: result.correctAnswers?.toString() || "",
      totalQuestions: result.totalQuestions?.toString() || "10",
      timeSpent: result.timeSpent?.toString() || "",
      language: result.language || "english",
    });
    setOpenEditResultDialog(true);
  };

  const handleUpdateResult = async () => {
    try {
      if (!resultForm.score) {
        setSnackbar({
          open: true,
          message: "Please fill in the score",
          severity: "error",
        });
        return;
      }

      const updateUrl = `http://localhost:5004/api/exams/results/${selectedItem._id}`;
      console.log("🔄 Updating exam result with URL:", updateUrl);
      console.log("📊 Update data:", {
        score: parseInt(resultForm.score),
        passed: parseInt(resultForm.score) >= 74,
        correctAnswers: parseInt(resultForm.correctAnswers),
        totalQuestions: parseInt(resultForm.totalQuestions),
        timeSpent: parseInt(resultForm.timeSpent) || 0,
      });

      try {
        const response = await axios.put(updateUrl, {
          score: parseInt(resultForm.score),
          passed: parseInt(resultForm.score) >= 74,
          correctAnswers: parseInt(resultForm.correctAnswers),
          totalQuestions: parseInt(resultForm.totalQuestions),
          timeSpent: parseInt(resultForm.timeSpent) || 0,
        });

        if (response.data.success) {
          setSnackbar({
            open: true,
            message: "Exam result updated successfully!",
            severity: "success",
          });
          setOpenEditResultDialog(false);
          setSelectedItem(null);
          fetchExamResults();
        }
      } catch (error) {
        console.error("❌ Server error, using local update for testing:", error);

        // For testing purposes, update locally when server is not available
        setExamResults(prev => prev.map(result =>
          result._id === selectedItem._id
            ? {
                ...result,
                score: parseInt(resultForm.score),
                passed: parseInt(resultForm.score) >= 74,
                correctAnswers: parseInt(resultForm.correctAnswers),
                totalQuestions: parseInt(resultForm.totalQuestions),
                timeSpent: parseInt(resultForm.timeSpent) || 0,
              }
            : result
        ));

        setSnackbar({
          open: true,
          message: "Exam result updated locally (server unavailable)",
          severity: "warning",
        });
        setOpenEditResultDialog(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("❌ Error updating exam result:", error);
      setSnackbar({
        open: true,
        message: "Error updating exam result: " + error.message,
        severity: "error",
      });
    }
  };

  const handleDeleteResult = (result) => {
    setSelectedItem(result);
    setOpenDeleteResultDialog(true);
  };

  const handleConfirmDeleteResult = async () => {
    try {
      try {
        const response = await axios.delete(
          `http://localhost:5004/api/exams/results/${selectedItem._id}`
        );

        if (response.data.success) {
          setSnackbar({
            open: true,
            message: "Exam result deleted successfully!",
            severity: "success",
          });
          setOpenDeleteResultDialog(false);
          setSelectedItem(null);
          fetchExamResults();
        }
      } catch (error) {
        console.error("❌ Server error, using local delete for testing:", error);

        // For testing purposes, delete locally when server is not available
        setExamResults(prev => prev.filter(result => result._id !== selectedItem._id));

        setSnackbar({
          open: true,
          message: "Exam result deleted locally (server unavailable)",
          severity: "warning",
        });
        setOpenDeleteResultDialog(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error deleting exam result:", error);
      setSnackbar({
        open: true,
        message: "Error deleting exam result: " + error.message,
        severity: "error",
      });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      scheduled: { color: "primary", label: "Scheduled" },
      approved: { color: "success", label: "Approved" },
      rejected: { color: "error", label: "Rejected" },
      completed: { color: "info", label: "Completed" },
      cancelled: { color: "error", label: "Cancelled" },
      in_progress: { color: "warning", label: "In Progress" },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getDifficultyChip = (difficulty) => {
    const difficultyConfig = {
      easy: { color: "success", label: "Easy" },
      medium: { color: "warning", label: "Medium" },
      hard: { color: "error", label: "Hard" },
    };

    const config = difficultyConfig[difficulty] || {
      color: "default",
      label: difficulty,
    };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📋 Exam Management System
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Exam Schedules" icon={<ScheduleIcon />} />
          <Tab label="Question Bank" icon={<QuizIcon />} />
          <Tab label="Exam Results" icon={<AssignmentIcon />} />
        </Tabs>

        {/* Tab 1: Exam Schedules */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Exam Schedules</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenScheduleDialog(true)}
              >
                Schedule New Exam
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Exam Type</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examSchedules.map((schedule) => (
                    <TableRow key={schedule._id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PersonIcon color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {schedule.userName || schedule.fullName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {schedule.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            schedule.examType === "theory"
                              ? "Theory"
                              : "Practical"
                          }
                          color={
                            schedule.examType === "theory" ? "info" : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {schedule.date
                            ? format(new Date(schedule.date), "MMM dd, yyyy")
                            : "Not set"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {schedule.time || "Not set"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {schedule.location || "Not specified"}
                      </TableCell>
                      <TableCell>{getStatusChip(schedule.status)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(schedule);
                            setOpenViewDialog(true);
                          }}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>

                        {schedule.status === "scheduled" && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedItem(schedule);
                                setOpenApproveDialog(true);
                              }}
                              title="Approve"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedItem(schedule);
                                setOpenRejectDialog(true);
                              }}
                              title="Reject"
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}

                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(schedule);
                            setOpenEditDialog(true);
                          }}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSchedule(schedule._id)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 2: Question Bank */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Question Bank</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenQuestionDialog(true)}
              >
                Add New Question
              </Button>
            </Box>

            <Grid container spacing={3}>
              {examQuestions.map((question, index) => (
                <Grid item xs={12} md={6} key={question._id || index}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ flex: 1 }}>
                          Q{index + 1}: {
                            typeof question.question === 'string'
                              ? question.question
                              : question.question?.english || question.question?.amharic || 'No question text'
                          }
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {getDifficultyChip(question.difficulty)}
                          <Chip
                            label={question.category}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      <List dense>
                        {(() => {
                          // Handle both old format (array) and new format (multilingual object)
                          const options = Array.isArray(question.options)
                            ? question.options
                            : question.options?.english || question.options?.amharic || [];

                          return options.map((option, optIndex) => (
                            <ListItem key={optIndex} sx={{ py: 0.5 }}>
                              <ListItemIcon>
                                {optIndex === question.correctAnswer ? (
                                  <CheckIcon color="success" />
                                ) : (
                                  <CancelIcon color="disabled" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={`${String.fromCharCode(
                                  65 + optIndex
                                )}. ${option}`}
                                sx={{
                                  color:
                                    optIndex === question.correctAnswer
                                      ? "success.main"
                                      : "text.primary",
                                  fontWeight:
                                    optIndex === question.correctAnswer
                                      ? "bold"
                                      : "normal",
                                }}
                              />
                            </ListItem>
                          ));
                        })()}
                      </List>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                          mt: 2,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(question);
                            setOpenEditQuestionDialog(true);
                          }}
                          title="Edit Question"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteQuestion(question._id)}
                          title="Delete Question"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 3: Exam Results */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Exam Results Management</Typography>
              <Button
                variant="contained"
                startIcon={<GradeIcon />}
                onClick={() => setOpenAddResultDialog(true)}
              >
                Add Exam Result
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Exam Type</TableCell>
                    <TableCell>Date Taken</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examResults.map((result) => (
                    <TableRow key={result._id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PersonIcon color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {result.userName || result.fullName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {result.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            result.examType === "theory"
                              ? "Theory"
                              : "Practical"
                          }
                          color={
                            result.examType === "theory" ? "info" : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {result.dateTaken
                          ? format(new Date(result.dateTaken), "MMM dd, yyyy")
                          : "Not available"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {result.score}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={result.passed ? "PASSED" : "FAILED"}
                          color={result.passed ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedItem(result);
                              setOpenViewDialog(true);
                            }}
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditResult(result)}
                            title="Edit Result"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteResult(result)}
                            title="Delete Result"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Schedule Exam Dialog */}
      <Dialog
        open={openScheduleDialog}
        onClose={() => setOpenScheduleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule New Exam</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="User ID"
                value={scheduleForm.userId}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, userId: e.target.value })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="User Name"
                value={scheduleForm.userName}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, userName: e.target.value })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  value={scheduleForm.examType}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      examType: e.target.value,
                      location: e.target.value === "practical" ? "Kality, Addis Ababa" : "online",
                    })
                  }
                >
                  <MenuItem value="theory">Theory Exam</MenuItem>
                  <MenuItem value="practical">Practical Exam</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                type="date"
                value={scheduleForm.date}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, date: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Time</InputLabel>
                <Select
                  value={scheduleForm.time}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, time: e.target.value })
                  }
                >
                  <MenuItem value="08:00">08:00 AM</MenuItem>
                  <MenuItem value="08:30">08:30 AM</MenuItem>
                  <MenuItem value="09:00">09:00 AM</MenuItem>
                  <MenuItem value="09:30">09:30 AM</MenuItem>
                  <MenuItem value="10:00">10:00 AM</MenuItem>
                  <MenuItem value="10:30">10:30 AM</MenuItem>
                  <MenuItem value="11:00">11:00 AM</MenuItem>
                  <MenuItem value="11:30">11:30 AM</MenuItem>
                  <MenuItem value="13:00">01:00 PM</MenuItem>
                  <MenuItem value="13:30">01:30 PM</MenuItem>
                  <MenuItem value="14:00">02:00 PM</MenuItem>
                  <MenuItem value="14:30">02:30 PM</MenuItem>
                  <MenuItem value="15:00">03:00 PM</MenuItem>
                  <MenuItem value="15:30">03:30 PM</MenuItem>
                  <MenuItem value="16:00">04:00 PM</MenuItem>
                  <MenuItem value="16:30">04:30 PM</MenuItem>
                  <MenuItem value="17:00">05:00 PM</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={scheduleForm.location}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      location: e.target.value,
                    })
                  }
                >
                  {scheduleForm.examType === "practical" ? (
                    <>
                      <MenuItem value="Kality, Addis Ababa">
                        🚗 Kality Testing Center - Addis Ababa (Main)
                      </MenuItem>
                      <MenuItem value="Debre Berhan">
                        🚗 Debre Berhan Testing Center
                      </MenuItem>
                      <MenuItem value="Mekelle">
                        🚗 Mekelle Testing Center - Tigray
                      </MenuItem>
                      <MenuItem value="Dire Dawa">
                        🚗 Dire Dawa Testing Center
                      </MenuItem>
                      <MenuItem value="Ambo">
                        🚗 Ambo Testing Center - Oromia
                      </MenuItem>
                      <MenuItem value="Debre Zeit">
                        🚗 Debre Zeit Testing Center - Oromia
                      </MenuItem>
                      <MenuItem value="Hawassa">
                        🚗 Hawassa Testing Center - SNNPR
                      </MenuItem>
                      <MenuItem value="Bahir Dar">
                        🚗 Bahir Dar Testing Center - Amhara
                      </MenuItem>
                      <MenuItem value="Jimma">
                        🚗 Jimma Testing Center - Oromia
                      </MenuItem>
                      <MenuItem value="Dessie">
                        🚗 Dessie Testing Center - Amhara
                      </MenuItem>
                      <MenuItem value="Adama">
                        🚗 Adama Testing Center - Oromia
                      </MenuItem>
                      <MenuItem value="Gondar">
                        🚗 Gondar Testing Center - Amhara
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="online">
                        💻 Online Exam Platform
                      </MenuItem>
                      <MenuItem value="main-center">
                        🏢 Main Testing Center - Addis Ababa
                      </MenuItem>
                      <MenuItem value="branch-1">🏢 Branch Center - Bole</MenuItem>
                      <MenuItem value="branch-2">🏢 Branch Center - Piassa</MenuItem>
                      <MenuItem value="branch-3">🏢 Branch Center - Merkato</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleScheduleSubmit} variant="contained">
            Schedule Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog
        open={openQuestionDialog}
        onClose={() => setOpenQuestionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Question</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Question"
                value={questionForm.question}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, question: e.target.value })
                }
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>

            {questionForm.options.map((option, index) => (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  label={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[index] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                  fullWidth
                  required
                />
              </Grid>
            ))}

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <FormLabel>Correct Answer</FormLabel>
                <RadioGroup
                  value={questionForm.correctAnswer}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      correctAnswer: parseInt(e.target.value),
                    })
                  }
                  row
                >
                  {questionForm.options.map((_, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={<Radio />}
                      label={String.fromCharCode(65 + index)}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={questionForm.category}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      category: e.target.value,
                    })
                  }
                >
                  <MenuItem value="traffic-rules">Traffic Rules</MenuItem>
                  <MenuItem value="road-signs">Road Signs</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                  <MenuItem value="vehicle-operation">
                    Vehicle Operation
                  </MenuItem>
                  <MenuItem value="emergency">Emergency Procedures</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={questionForm.difficulty}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)}>Cancel</Button>
          <Button onClick={handleQuestionSubmit} variant="contained">
            Add Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={() => setOpenApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Exam Schedule</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to approve this exam schedule for{" "}
            <strong>{selectedItem?.userName}</strong>?
          </Typography>
          <TextField
            label="Admin Message (Optional)"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Add any additional instructions or notes for the user..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleApproveSchedule}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Exam Schedule</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to reject this exam schedule for{" "}
            <strong>{selectedItem?.userName}</strong>?
          </Typography>
          <TextField
            label="Reason for Rejection"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Please provide a reason for rejection..."
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRejectSchedule}
            variant="contained"
            color="error"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Exam Schedule</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="User ID"
                  value={selectedItem.userId || ""}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="User Name"
                  value={selectedItem.userName || selectedItem.fullName || ""}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, userName: e.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    value={selectedItem.examType || ""}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, examType: e.target.value })
                    }
                  >
                    <MenuItem value="theory">Theory Exam</MenuItem>
                    <MenuItem value="practical">Practical Exam</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date"
                  type="date"
                  value={selectedItem.date ? selectedItem.date.split('T')[0] : ""}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, date: e.target.value })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time</InputLabel>
                  <Select
                    value={selectedItem.time || ""}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, time: e.target.value })
                    }
                  >
                    <MenuItem value="08:00">08:00 AM</MenuItem>
                    <MenuItem value="08:30">08:30 AM</MenuItem>
                    <MenuItem value="09:00">09:00 AM</MenuItem>
                    <MenuItem value="09:30">09:30 AM</MenuItem>
                    <MenuItem value="10:00">10:00 AM</MenuItem>
                    <MenuItem value="10:30">10:30 AM</MenuItem>
                    <MenuItem value="11:00">11:00 AM</MenuItem>
                    <MenuItem value="11:30">11:30 AM</MenuItem>
                    <MenuItem value="13:00">01:00 PM</MenuItem>
                    <MenuItem value="13:30">01:30 PM</MenuItem>
                    <MenuItem value="14:00">02:00 PM</MenuItem>
                    <MenuItem value="14:30">02:30 PM</MenuItem>
                    <MenuItem value="15:00">03:00 PM</MenuItem>
                    <MenuItem value="15:30">03:30 PM</MenuItem>
                    <MenuItem value="16:00">04:00 PM</MenuItem>
                    <MenuItem value="16:30">04:30 PM</MenuItem>
                    <MenuItem value="17:00">05:00 PM</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  value={selectedItem.location || ""}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, location: e.target.value })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditSchedule}
            variant="contained"
            color="primary"
          >
            Update Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedItem?.examType === "theory" ? "Theory" : selectedItem?.examType === "practical" ? "Practical" : "Exam"} Details
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedItem.examType === "theory" ? "Theory Exam" :
                   selectedItem.examType === "practical" ? "Practical Exam" :
                   selectedItem.examType ? `${selectedItem.examType} Exam` : "Exam"} Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography><strong>User:</strong> {selectedItem.userName || selectedItem.fullName || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>User ID:</strong> {selectedItem.userId || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Exam Type:</strong> {selectedItem.examType || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Date:</strong> {selectedItem.date ? format(new Date(selectedItem.date), "PPP") : "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Time:</strong> {selectedItem.time || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Location:</strong> {selectedItem.location || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Status:</strong> {getStatusChip(selectedItem.status)}</Typography>
              </Grid>

              {selectedItem.score && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Exam Results
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Score:</strong> {selectedItem.score}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Result:</strong> {selectedItem.passed ? "PASSED" : "FAILED"}</Typography>
                  </Grid>
                  {selectedItem.dateTaken && (
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Date Taken:</strong> {format(new Date(selectedItem.dateTaken), "PPP")}</Typography>
                    </Grid>
                  )}
                </>
              )}

              {selectedItem.adminNotes && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Admin Notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>{selectedItem.adminNotes}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog
        open={openEditQuestionDialog}
        onClose={() => setOpenEditQuestionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Question"
                  value={selectedItem.question || ""}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, question: e.target.value })
                  }
                  fullWidth
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              {/* Options */}
              {selectedItem.options && selectedItem.options.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...selectedItem.options];
                      newOptions[index] = e.target.value;
                      setSelectedItem({ ...selectedItem, options: newOptions });
                    }}
                    fullWidth
                    required
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Correct Answer</FormLabel>
                  <RadioGroup
                    value={selectedItem.correctAnswer || 0}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, correctAnswer: parseInt(e.target.value) })
                    }
                  >
                    {selectedItem.options && selectedItem.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={index}
                        control={<Radio />}
                        label={`Option ${index + 1}: ${option.substring(0, 30)}${option.length > 30 ? '...' : ''}`}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedItem.category || ""}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, category: e.target.value })
                    }
                  >
                    <MenuItem value="traffic-rules">Traffic Rules</MenuItem>
                    <MenuItem value="road-signs">Road Signs</MenuItem>
                    <MenuItem value="vehicle-safety">Vehicle Safety</MenuItem>
                    <MenuItem value="driving-techniques">Driving Techniques</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={selectedItem.difficulty || ""}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, difficulty: e.target.value })
                    }
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditQuestionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditQuestion}
            variant="contained"
            color="primary"
          >
            Update Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Result Dialog */}
      <Dialog
        open={openAddResultDialog}
        onClose={() => setOpenAddResultDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Exam Result</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="User ID"
                value={resultForm.userId}
                onChange={(e) =>
                  setResultForm({ ...resultForm, userId: e.target.value })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="User Name"
                value={resultForm.userName}
                onChange={(e) =>
                  setResultForm({ ...resultForm, userName: e.target.value })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  value={resultForm.examType}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, examType: e.target.value })
                  }
                >
                  <MenuItem value="theory">Theory Exam</MenuItem>
                  <MenuItem value="practical">Practical Exam</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Score (%)"
                type="number"
                value={resultForm.score}
                onChange={(e) =>
                  setResultForm({
                    ...resultForm,
                    score: e.target.value,
                    passed: parseInt(e.target.value) >= 74
                  })
                }
                fullWidth
                required
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Correct Answers"
                type="number"
                value={resultForm.correctAnswers}
                onChange={(e) =>
                  setResultForm({ ...resultForm, correctAnswers: e.target.value })
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Total Questions"
                type="number"
                value={resultForm.totalQuestions}
                onChange={(e) =>
                  setResultForm({ ...resultForm, totalQuestions: e.target.value })
                }
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Time Spent (minutes)"
                type="number"
                value={resultForm.timeSpent}
                onChange={(e) =>
                  setResultForm({ ...resultForm, timeSpent: e.target.value })
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={resultForm.language}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, language: e.target.value })
                  }
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="amharic">Amharic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Status: {parseInt(resultForm.score) >= 74 ? "✅ Passed" : "❌ Failed"}
                {resultForm.score && ` (Score: ${resultForm.score}%)`}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddResultDialog(false)}>Cancel</Button>
          <Button onClick={handleAddResult} variant="contained">
            Add Result
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Result Dialog */}
      <Dialog
        open={openEditResultDialog}
        onClose={() => setOpenEditResultDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Exam Result</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Editing result for: {selectedItem.userName} (ID: {selectedItem.userId})
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Score (%)"
                  type="number"
                  value={resultForm.score}
                  onChange={(e) =>
                    setResultForm({
                      ...resultForm,
                      score: e.target.value,
                      passed: parseInt(e.target.value) >= 74
                    })
                  }
                  fullWidth
                  required
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Time Spent (minutes)"
                  type="number"
                  value={resultForm.timeSpent}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, timeSpent: e.target.value })
                  }
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Correct Answers"
                  type="number"
                  value={resultForm.correctAnswers}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, correctAnswers: e.target.value })
                  }
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Total Questions"
                  type="number"
                  value={resultForm.totalQuestions}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, totalQuestions: e.target.value })
                  }
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Status: {parseInt(resultForm.score) >= 74 ? "✅ Passed" : "❌ Failed"}
                  {resultForm.score && ` (Score: ${resultForm.score}%)`}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditResultDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateResult}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Result Confirmation Dialog */}
      <Dialog
        open={openDeleteResultDialog}
        onClose={() => setOpenDeleteResultDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete this exam result?
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>User:</strong> {selectedItem.userName}
                </Typography>
                <Typography variant="body2">
                  <strong>User ID:</strong> {selectedItem.userId}
                </Typography>
                <Typography variant="body2">
                  <strong>Exam Type:</strong> {selectedItem.examType}
                </Typography>
                <Typography variant="body2">
                  <strong>Score:</strong> {selectedItem.score}%
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedItem.passed ? "Passed" : "Failed"}
                </Typography>
                {selectedItem.dateTaken && (
                  <Typography variant="body2">
                    <strong>Date:</strong> {format(new Date(selectedItem.dateTaken), "PPp")}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                ⚠️ This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteResultDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDeleteResult}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Result
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ExamManagement;
