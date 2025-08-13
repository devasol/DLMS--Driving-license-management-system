import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  History as HistoryIcon,
  ArrowBack as BackIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  Assessment as StatsIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  School as ExamIcon,
  CardMembership as LicenseIcon,
  Payment as PaymentIcon,
  Warning as ViolationIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import axios from "axios";

const HistorySection = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(null);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    activityType: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const activityTypes = [
    { value: "", label: "All Activities" },
    { value: "license_application", label: "License Applications" },
    { value: "exam_schedule", label: "Exam Schedules" },
    { value: "exam_completion", label: "Exam Completions" },
    { value: "exam_result", label: "Exam Results" },
    { value: "license_issued", label: "License Issued" },
    { value: "license_renewal", label: "License Renewals" },
    { value: "violation_recorded", label: "Violations" },
    { value: "payment_made", label: "Payments" },
    { value: "profile_update", label: "Profile Updates" },
    { value: "document_upload", label: "Document Uploads" },
    { value: "login", label: "Login Activities" },
    { value: "system_notification", label: "System Notifications" },
  ];

  const statusTypes = [
    { value: "", label: "All Statuses" },
    { value: "success", label: "Success" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    fetchUserHistory();
  }, [currentPage, filters]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchUserStats();
    }
  }, [activeTab]);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        setError("User not found. Please log in again.");
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (filters.activityType) params.append("activityType", filters.activityType);
      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await axios.get(
        `http://localhost:5004/api/user-activity/${userId}/history?${params}`
      );

      if (response.data.success) {
        setHistory(response.data.data);
        setActivities(response.data.data.activities);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching user history:", error);
      setError("Failed to load history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `http://localhost:5004/api/user-activity/${userId}/stats`
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };



  const getActivityIcon = (activityType, status) => {
    const iconMap = {
      license_application: <LicenseIcon />,
      exam_schedule: <ExamIcon />,
      exam_completion: <ExamIcon />,
      exam_result: <StatsIcon />,
      license_issued: <LicenseIcon />,
      license_renewal: <RefreshIcon />,
      violation_recorded: <ViolationIcon />,
      payment_made: <PaymentIcon />,
      profile_update: <PersonIcon />,
      document_upload: <UploadIcon />,
      login: <SecurityIcon />,
      logout: <SecurityIcon />,
      password_change: <SecurityIcon />,
      system_notification: <NotificationIcon />,
      status_change: <EditIcon />,
    };

    return iconMap[activityType] || <HistoryIcon />;
  };

  const getActivityColor = (activityType, status) => {
    if (status === "failed") return "#f44336";
    if (status === "pending") return "#ff9800";
    if (status === "cancelled") return "#9e9e9e";

    const colorMap = {
      license_application: "#2196f3",
      exam_schedule: "#9c27b0",
      exam_completion: "#4caf50",
      exam_result: "#ff5722",
      license_issued: "#4caf50",
      license_renewal: "#00bcd4",
      violation_recorded: "#f44336",
      payment_made: "#4caf50",
      profile_update: "#607d8b",
      document_upload: "#795548",
      login: "#3f51b5",
      logout: "#9e9e9e",
      password_change: "#e91e63",
      system_notification: "#ff9800",
      status_change: "#673ab7",
    };

    return colorMap[activityType] || "#2196f3";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <SuccessIcon color="success" />;
      case "pending":
        return <PendingIcon color="warning" />;
      case "failed":
        return <ErrorIcon color="error" />;
      case "cancelled":
        return <CancelIcon color="disabled" />;
      default:
        return <SuccessIcon color="success" />;
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      activityType: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
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
        <HistoryIcon sx={{ fontSize: 40, color: "white", mr: 2 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
            Activity History
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Your complete activity timeline and statistics
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab
            icon={<TimelineIcon />}
            label="Timeline"
            iconPosition="start"
          />
          <Tab
            icon={<StatsIcon />}
            label="Statistics"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Timeline Tab */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <FilterIcon sx={{ mr: 1 }} />
                Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Activity Type</InputLabel>
                    <Select
                      value={filters.activityType}
                      onChange={(e) => handleFilterChange("activityType", e.target.value)}
                      label="Activity Type"
                    >
                      {activityTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      label="Status"
                    >
                      {statusTypes.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchUserHistory}
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* User Summary */}
          {history && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {history.user?.fullName || "User"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {history.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Member since: {history.user?.joinDate ? format(new Date(history.user.joinDate), "MMM dd, yyyy") : "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Activity Summary
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Total Activities:</Typography>
                      <Chip
                        label={history.statistics?.totalActivities || 0}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    {history.license && (
                      <>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">License Status:</Typography>
                          <Chip
                            label={history.license.status}
                            color={history.license.status === "active" ? "success" : "warning"}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">Demerit Points:</Typography>
                          <Chip
                            label={`${history.license.points || 0} pts`}
                            color={history.license.points > 6 ? "error" : "success"}
                            size="small"
                          />
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Activities List */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <TimelineIcon sx={{ mr: 1 }} />
                Activity Timeline ({pagination.total || 0} total)
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {activities.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <HistoryIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Activities Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Object.values(filters).some(f => f)
                      ? "Try adjusting your filters to see more activities."
                      : "Your activity history will appear here as you use the system."
                    }
                  </Typography>
                </Box>
              ) : (
                <List>
                  {activities.map((activity, index) => (
                    <React.Fragment key={activity._id || index}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: getActivityColor(activity.activityType, activity.status),
                              width: 48,
                              height: 48,
                            }}
                          >
                            {getActivityIcon(activity.activityType, activity.status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {activity.description}
                              </Typography>
                              <Chip
                                icon={getStatusIcon(activity.status)}
                                label={activity.status}
                                size="small"
                                color={
                                  activity.status === "success" ? "success" :
                                  activity.status === "pending" ? "warning" :
                                  activity.status === "failed" ? "error" : "default"
                                }
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {activity.action} • {activity.createdAt ? format(new Date(activity.createdAt), "MMM dd, yyyy 'at' HH:mm") : "Date not available"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : ""}
                              </Typography>
                              {activity.details && Object.keys(activity.details).length > 0 && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                                  <Typography variant="caption" color="text.secondary" component="div">
                                    <strong>Details:</strong>
                                  </Typography>
                                  <Box component="pre" sx={{ fontSize: "0.75rem", mt: 0.5, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                                    {Object.entries(activity.details).map(([key, value]) => (
                                      <Box key={key} component="div" sx={{ mb: 0.5 }}>
                                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < activities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={pagination.pages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center" }}>
              <StatsIcon sx={{ mr: 1 }} />
              Activity Statistics
            </Typography>

            {stats ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Activity Breakdown
                    </Typography>
                    {stats.activityByType?.map((item) => (
                      <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2">
                          {activityTypes.find(t => t.value === item._id)?.label || item._id}:
                        </Typography>
                        <Chip label={item.count} size="small" />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Status Distribution
                    </Typography>
                    {stats.activityByStatus?.map((item) => (
                      <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2">
                          {item._id.charAt(0).toUpperCase() + item._id.slice(1)}:
                        </Typography>
                        <Chip
                          label={item.count}
                          size="small"
                          color={
                            item._id === "success" ? "success" :
                            item._id === "pending" ? "warning" :
                            item._id === "failed" ? "error" : "default"
                          }
                        />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h4" color="primary">
                            {stats.totalActivities}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Activities
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h4" color="success.main">
                            {stats.recentActivityCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last 30 Days
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading statistics...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default HistorySection;
