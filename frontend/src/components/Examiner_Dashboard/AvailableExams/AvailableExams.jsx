import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Assignment as AssignmentIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AvailableExams = () => {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/examiner/available-for-assignment`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailableExams(response.data || []);
    } catch (error) {
      console.error("Error fetching available exams:", error);
      setSnackbar({
        open: true,
        message: "Error fetching available exams",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExam = async (exam) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/examiner/assign/${exam._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam assigned successfully!",
          severity: "success",
        });

        // Remove the assigned exam from the list
        setAvailableExams((prev) => prev.filter((e) => e._id !== exam._id));
        setOpenAssignDialog(false);
      }
    } catch (error) {
      console.error("Error assigning exam:", error);
      setSnackbar({
        open: true,
        message: "Error assigning exam",
        severity: "error",
      });
    }
  };

  const filteredExams = availableExams.filter(
    (exam) =>
      exam.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
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
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/examiner/dashboard")}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary"
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
              >
                Available Practical Exams
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                View and assign yourself to available practical driving tests
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${filteredExams.length} Available`}
            color="primary"
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          />
        </Box>
      </Paper>

      {/* Search and Filter */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: "20px" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
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
              sx={{ borderRadius: "12px" }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<FilterIcon />}
              sx={{ borderRadius: "12px", py: 1.5 }}
            >
              Filter Exams
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Available Exams List */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: "20px" }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <AssignmentIcon color="primary" />
          Available Exams ({filteredExams.length})
        </Typography>

        {filteredExams.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CarIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No available exams found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "All practical exams have been assigned"}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    mb: 2,
                    background: "white",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    p: { xs: 2, sm: 3 },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: { xs: "auto", sm: 56 },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    sx={{ flex: 1, mb: { xs: 2, sm: 0 } }}
                    primary={
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        {exam.fullName}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <ScheduleIcon fontSize="small" />
                          {new Date(exam.date).toLocaleDateString()} at{" "}
                          {exam.time}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <LocationIcon fontSize="small" />
                          {exam.location}
                        </Typography>
                        <Chip
                          label={exam.status}
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    }
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexDirection: { xs: "column", sm: "row" },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AssignmentIcon />}
                      onClick={() => {
                        setSelectedExam(exam);
                        setOpenAssignDialog(true);
                      }}
                      sx={{
                        borderRadius: "8px",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 2, sm: 3 },
                      }}
                    >
                      Assign to Me
                    </Button>
                  </Box>
                </ListItem>
              </motion.div>
            ))}
          </List>
        )}
      </Paper>

      {/* Assignment Confirmation Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Exam Assignment</DialogTitle>
        <DialogContent>
          {selectedExam && (
            <Box>
              <Typography gutterBottom>
                Are you sure you want to assign yourself to conduct the
                practical exam for:
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {selectedExam.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📅 {new Date(selectedExam.date).toLocaleDateString()} at{" "}
                {selectedExam.time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 {selectedExam.location}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleAssignExam(selectedExam)}
            variant="contained"
            startIcon={<AssignmentIcon />}
          >
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AvailableExams;
