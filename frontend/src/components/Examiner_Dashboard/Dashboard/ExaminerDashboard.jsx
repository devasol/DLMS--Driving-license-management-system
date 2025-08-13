import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  InputAdornment,
  Pagination,
  CardActions,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ExaminerDashboard = () => {
  const navigate = useNavigate();
  const [examinerData, setExaminerData] = useState(null);
  const [assignedExams, setAssignedExams] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // New state for improved interface
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 cards per page

  // Get examiner info from localStorage
  const examinerId = localStorage.getItem("userId");
  const examinerName = localStorage.getItem("userName");
  const examinerEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchExaminerData();
    fetchAssignedExams();
    fetchExamHistory();
  }, []);

  const fetchExaminerData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5004/api/examiner/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExaminerData(response.data);
    } catch (error) {
      console.error("Error fetching examiner data:", error);
      // Fallback to basic user data if examiner endpoint fails
      try {
        const fallbackResponse = await axios.get(
          `http://localhost:5004/api/users/${examinerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExaminerData(fallbackResponse.data);
      } catch (fallbackError) {
        console.error("Error fetching fallback user data:", fallbackError);
      }
    }
  };

  const fetchAssignedExams = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔄 Fetching assigned exams...");
      const response = await axios.get(
        `http://localhost:5004/api/examiner/assigned`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("📋 Assigned exams response:", response.data);
      setAssignedExams(response.data || []);

      if (response.data && response.data.length > 0) {
        setSnackbar({
          open: true,
          message: `Found ${response.data.length} assigned exams`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error fetching assigned exams:", error);
      setAssignedExams([]);
      setSnackbar({
        open: true,
        message: "Error fetching assigned exams",
        severity: "error",
      });
    }
  };

  const fetchExamHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔄 Fetching exam history...");
      const response = await axios.get(
        `http://localhost:5004/api/examiner/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("📋 Exam history response:", response.data);
      setExamHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching exam history:", error);
      setExamHistory([]);
      setSnackbar({
        open: true,
        message: "Error fetching exam history",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  const handleStartExam = (exam) => {
    navigate(`/examiner/conduct-exam/${exam._id}`);
  };

  const handleViewExam = (exam) => {
    setSelectedExam(exam);
    setOpenResultDialog(true);
  };

  const handleNotifications = () => {
    console.log("🔔 Notifications button clicked!");
    setSnackbar({
      open: true,
      message:
        "Notifications feature coming soon! You'll be notified of new exam assignments and updates.",
      severity: "info",
    });
  };

  const handleSettings = () => {
    console.log("⚙️ Settings button clicked!");
    setSnackbar({
      open: true,
      message:
        "Settings panel coming soon! You'll be able to customize your dashboard preferences.",
      severity: "info",
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchExaminerData(),
      fetchAssignedExams(),
      fetchExamHistory(),
    ]);
    setSnackbar({
      open: true,
      message: "Dashboard refreshed successfully!",
      severity: "success",
    });
  };

  // Calculate real-time statistics
  const todaysExams = assignedExams.filter(
    (exam) => new Date(exam.date).toDateString() === new Date().toDateString()
  );

  const approvedExams = assignedExams.filter(
    (exam) => exam.status === "approved"
  );
  const pendingApprovalExams = assignedExams.filter(
    (exam) => exam.status === "scheduled" || exam.status === "pending"
  );
  const rejectedExams = assignedExams.filter(
    (exam) => exam.status === "rejected"
  );

  const completedToday = examHistory.filter(
    (exam) =>
      new Date(exam.completedAt).toDateString() === new Date().toDateString()
  );

  const totalConducted =
    examinerData?.statistics?.totalExams || examHistory.length;
  const passRate = examinerData?.statistics?.passRate || 0;

  // Filter and organize exams by status
  const examsByStatus = {
    approved: approvedExams,
    pending: pendingApprovalExams,
    rejected: rejectedExams,
    all: assignedExams,
  };

  // Apply search and date filters
  const getFilteredExams = (exams) => {
    return exams.filter((exam) => {
      const matchesSearch =
        !searchTerm ||
        exam.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate =
        !dateFilter ||
        new Date(exam.date).toDateString() ===
          new Date(dateFilter).toDateString();

      const matchesLocation =
        !locationFilter ||
        exam.location?.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesDate && matchesLocation;
    });
  };

  // Get current tab's exams
  const tabLabels = ["All Exams", "Approved", "Pending Approval", "Rejected"];
  const tabKeys = ["all", "approved", "pending", "rejected"];
  const currentTabKey = tabKeys[activeTab];
  const currentExams = examsByStatus[currentTabKey] || [];
  const filteredExams = getFilteredExams(currentExams);

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExams = filteredExams.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page when changing tabs or filters
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, dateFilter, locationFilter]);

  const stats = [
    {
      title: "Approved Exams",
      value: approvedExams.length,
      icon: <CheckIcon />,
      color: "#388e3c",
      bgColor: "#e8f5e8",
      trend: approvedExams.length > 0 ? "Ready" : "None",
      subtitle: "Ready to conduct",
    },
    {
      title: "Pending Approval",
      value: pendingApprovalExams.length,
      icon: <ScheduleIcon />,
      color: "#f57c00",
      bgColor: "#fff3e0",
      trend: pendingApprovalExams.length > 0 ? "Waiting" : "None",
      subtitle: "Awaiting admin approval",
    },
    {
      title: "Rejected Exams",
      value: rejectedExams.length,
      icon: <CancelIcon />,
      color: "#d32f2f",
      bgColor: "#ffebee",
      trend: rejectedExams.length > 0 ? "Rejected" : "None",
      subtitle: "Admin rejected",
    },
    {
      title: "Total Scheduled",
      value: assignedExams.length,
      icon: <AssignmentIcon />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
      trend: assignedExams.length > 0 ? "Active" : "None",
      subtitle: "All practical exams",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <LinearProgress sx={{ width: "50%" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 3,
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "20px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {examinerName?.charAt(0) || "E"}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                Welcome, {examinerName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Driving Test Examiner • {examinerEmail}
              </Typography>
              <Chip
                label="Active Examiner"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <IconButton
              color="primary"
              onClick={handleRefresh}
              title="Refresh Dashboard"
              disabled={loading}
              sx={{
                position: "relative",
                zIndex: 1000,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleNotifications}
              title="View Notifications"
              sx={{
                position: "relative",
                zIndex: 1000,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSettings}
              title="Dashboard Settings"
              sx={{
                position: "relative",
                zIndex: 1000,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <SettingsIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: "12px",
                display: { xs: "none", sm: "flex" },
              }}
            >
              Logout
            </Button>
            <IconButton
              color="primary"
              onClick={handleLogout}
              sx={{ display: { xs: "flex", sm: "none" } }}
              title="Logout"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: "20px",
                  background: stat.bgColor,
                  border: `2px solid ${stat.color}20`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: `0 10px 25px ${stat.color}30`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 2,
                      borderRadius: "50%",
                      backgroundColor: stat.color,
                      color: "white",
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color={stat.color}
                    sx={{
                      fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={stat.color}
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {stat.trend}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Enhanced Exams Interface */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: "20px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <AssignmentIcon color="primary" />
                Practical Exams Management
              </Typography>

              {/* Search and Filters */}
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder="Search by student name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 250, flex: 1 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Filter by Date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 180 }}
                />
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
            >
              {tabLabels.map((label, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {label}
                      <Chip
                        label={examsByStatus[tabKeys[index]]?.length || 0}
                        size="small"
                        color={
                          index === 1
                            ? "success"
                            : index === 2
                            ? "warning"
                            : index === 3
                            ? "error"
                            : "primary"
                        }
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {filteredExams.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <CarIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    {searchTerm || dateFilter || locationFilter
                      ? "No exams match your filters"
                      : `No ${tabLabels[activeTab].toLowerCase()} found`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || dateFilter || locationFilter
                      ? "Try adjusting your search criteria"
                      : "Check back later for new exam assignments"}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Results Summary */}
                  <Box
                    sx={{
                      mb: 3,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing {startIndex + 1}-
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredExams.length
                      )}{" "}
                      of {filteredExams.length} exams
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Page {currentPage} of {totalPages}
                    </Typography>
                  </Box>

                  {/* Card Grid */}
                  <Grid container spacing={2}>
                    {paginatedExams.map((exam, index) => (
                      <Grid item xs={12} md={6} key={exam._id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            elevation={2}
                            sx={{
                              height: "100%",
                              borderRadius: "16px",
                              border: "1px solid #e0e0e0",
                              "&:hover": {
                                boxShadow: 4,
                                transform: "translateY(-2px)",
                                transition: "all 0.3s ease",
                              },
                            }}
                          >
                            <CardContent sx={{ pb: 1 }}>
                              {/* Student Info Header */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: "primary.main",
                                    width: 48,
                                    height: 48,
                                  }}
                                >
                                  <PersonIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ fontSize: "1.1rem" }}
                                  >
                                    {exam.fullName || exam.userName}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Practical Driving Test
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Exam Details */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                  mb: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <CalendarIcon
                                    sx={{
                                      fontSize: 16,
                                      color: "text.secondary",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {new Date(exam.date).toLocaleDateString()}{" "}
                                    at {exam.time}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <LocationIcon
                                    sx={{
                                      fontSize: 16,
                                      color: "text.secondary",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {exam.location}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Status Chip */}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  mb: 2,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Chip
                                  label={exam.status.toUpperCase()}
                                  size="small"
                                  color={
                                    exam.status === "approved"
                                      ? "success"
                                      : exam.status === "rejected"
                                      ? "error"
                                      : "warning"
                                  }
                                />
                                {exam.adminMessage && (
                                  <Tooltip title={exam.adminMessage}>
                                    <Chip
                                      label="Admin Note"
                                      size="small"
                                      variant="outlined"
                                      color="info"
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            </CardContent>

                            <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              >
                                {/* Action Button */}
                                {exam.status === "approved" ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CarIcon />}
                                    onClick={() => handleStartExam(exam)}
                                    sx={{
                                      borderRadius: "8px",
                                      backgroundColor: "#4caf50",
                                      "&:hover": { backgroundColor: "#45a049" },
                                      flex: 1,
                                    }}
                                  >
                                    Add Result
                                  </Button>
                                ) : exam.status === "scheduled" ||
                                  exam.status === "pending" ? (
                                  <Chip
                                    label="Awaiting Approval"
                                    color="warning"
                                    size="small"
                                    sx={{ flex: 1 }}
                                  />
                                ) : exam.status === "rejected" ? (
                                  <Chip
                                    label="Rejected"
                                    color="error"
                                    size="small"
                                    sx={{ flex: 1 }}
                                  />
                                ) : (
                                  <Chip
                                    label={exam.status}
                                    color="default"
                                    size="small"
                                    sx={{ flex: 1 }}
                                  />
                                )}

                                {/* View details button */}
                                <IconButton
                                  onClick={() => handleViewExam(exam)}
                                  title="View Exam Details"
                                  size="small"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Box>
                            </CardActions>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, page) => setCurrentPage(page)}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                "& .MuiButton-root": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  py: { xs: 1, sm: 1.5 },
                },
              }}
            >
              <Button
                variant="contained"
                fullWidth
                startIcon={<AssignmentIcon />}
                sx={{ borderRadius: "12px" }}
                onClick={() => navigate("/examiner/available-exams")}
              >
                Available Exams
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<HistoryIcon />}
                sx={{ borderRadius: "12px" }}
                onClick={() => navigate("/examiner/exam-history")}
              >
                View Exam History
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AssessmentIcon />}
                sx={{ borderRadius: "12px" }}
                onClick={() => navigate("/examiner/reports")}
              >
                Generate Reports
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SettingsIcon />}
                sx={{ borderRadius: "12px" }}
                onClick={() => navigate("/examiner/profile")}
              >
                Profile Settings
              </Button>
            </Box>
          </Paper>

          {/* Recent Activity */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            {examHistory.slice(0, 5).map((exam, index) => (
              <Box key={exam._id} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {exam.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {exam.result === "pass" ? "✅ Passed" : "❌ Failed"} •{" "}
                  {new Date(exam.completedAt).toLocaleDateString()}
                </Typography>
                {index < 4 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Exam Details Dialog */}
      <Dialog
        open={openResultDialog}
        onClose={() => setOpenResultDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Exam Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedExam?.fullName || selectedExam?.userName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedExam && (
            <Grid container spacing={3}>
              {/* Student Information */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: "12px" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    color="primary"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PersonIcon />
                    Student Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body2">
                      <strong>Name:</strong>{" "}
                      {selectedExam.fullName || selectedExam.userName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>User ID:</strong> {selectedExam.userId}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Exam Type:</strong>{" "}
                      {selectedExam.examType?.toUpperCase()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Exam Schedule */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: "12px" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    color="primary"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <ScheduleIcon />
                    Schedule Details
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body2">
                      <strong>Date:</strong>{" "}
                      {new Date(selectedExam.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {selectedExam.time}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedExam.location}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Status Information */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: "12px" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    color="primary"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <AssessmentIcon />
                    Status & Results
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Chip
                        label={selectedExam.status?.toUpperCase()}
                        color={
                          selectedExam.status === "approved"
                            ? "success"
                            : selectedExam.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                        size="medium"
                      />
                      {selectedExam.result && (
                        <Chip
                          label={`Result: ${selectedExam.result?.toUpperCase()}`}
                          color={
                            selectedExam.result === "pass"
                              ? "success"
                              : selectedExam.result === "fail"
                              ? "error"
                              : "default"
                          }
                          size="medium"
                        />
                      )}
                    </Box>

                    {selectedExam.adminMessage && (
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Admin Message:
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          {selectedExam.adminMessage}
                        </Typography>
                      </Box>
                    )}

                    {selectedExam.notes && (
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedExam.notes}
                        </Typography>
                      </Box>
                    )}

                    {selectedExam.instructor && (
                      <Typography variant="body2">
                        <strong>Assigned Instructor:</strong>{" "}
                        {selectedExam.instructor}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Exam Results (if available) */}
              {selectedExam.examResult && (
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: "12px" }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      color="primary"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <StarIcon />
                      Exam Results
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>Score:</strong> {selectedExam.examResult.score}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Evaluated By:</strong>{" "}
                        {selectedExam.examResult.evaluatedBy}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Evaluated At:</strong>{" "}
                        {new Date(
                          selectedExam.examResult.evaluatedAt
                        ).toLocaleString()}
                      </Typography>
                      {selectedExam.examResult.notes && (
                        <Typography variant="body2">
                          <strong>Examiner Notes:</strong>{" "}
                          {selectedExam.examResult.notes}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenResultDialog(false)}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Close
          </Button>
          {selectedExam?.status === "approved" && (
            <Button
              onClick={() => {
                setOpenResultDialog(false);
                handleStartExam(selectedExam);
              }}
              variant="contained"
              startIcon={<CarIcon />}
              sx={{
                borderRadius: "8px",
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#45a049" },
              }}
            >
              Add Result
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExaminerDashboard;
