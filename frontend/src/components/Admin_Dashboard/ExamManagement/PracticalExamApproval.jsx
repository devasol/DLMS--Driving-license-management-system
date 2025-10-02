import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Check as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PracticalExamApproval = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [examSchedules, setExamSchedules] = useState([]);
  const [pendingApprovalExams, setPendingApprovalExams] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openApproveResultDialog, setOpenApproveResultDialog] = useState(false);
  const [openRejectResultDialog, setOpenRejectResultDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchExamSchedules = async () => {
    try {
      const response = await axios.get("/api/exams/schedules");
      console.log("API Response:", response.data); // Debug log

      // Handle different response structures
      let allExams = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        allExams = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        allExams = response.data;
      } else {
        console.error("Unexpected response structure:", response.data);
        setSnackbar({
          open: true,
          message: "Unexpected response structure from server",
          severity: "error",
        });
        return;
      }

      const practicalExams = allExams.filter(
        (exam) => exam.examType === "practical"
      );
      console.log("Filtered practical exams:", practicalExams); // Debug log
      setExamSchedules(practicalExams);
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
      setSnackbar({
        open: true,
        message:
          "Error fetching exam schedules: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const fetchPendingApprovalExams = async () => {
    try {
      const response = await axios.get("/api/exams/schedules/pending-approval");
      console.log("Pending Approval Response:", response.data); // Debug log

      // Handle different response structures
      let pendingExams = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        pendingExams = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        pendingExams = response.data;
      } else {
        console.error(
          "Unexpected pending approval response structure:",
          response.data
        );
        pendingExams = [];
      }

      // Filter for practical exams only
      const practicalPendingExams = pendingExams.filter(
        (exam) => exam.examType === "practical"
      );
      console.log("Filtered pending practical exams:", practicalPendingExams); // Debug log
      setPendingApprovalExams(practicalPendingExams);
    } catch (error) {
      console.error("Error fetching pending approval exams:", error);
      setSnackbar({
        open: true,
        message:
          "Error fetching pending approval exams: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchExamSchedules();
    fetchPendingApprovalExams();
  }, []);

  const handleApproveSchedule = async () => {
    try {
      const response = await axios.put(
        `/api/exams/schedules/${selectedItem._id}/approve`,
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
        `/api/exams/schedules/${selectedItem._id}/reject`,
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

  const handleApproveResult = async () => {
    try {
      const response = await axios.put(
        `/api/exams/schedules/${selectedItem._id}/approve-result`,
        { adminMessage }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam result approved successfully!",
          severity: "success",
        });
        setOpenApproveResultDialog(false);
        setAdminMessage("");
        fetchPendingApprovalExams();
        fetchExamSchedules();
      }
    } catch (error) {
      console.error("Error approving exam result:", error);
      setSnackbar({
        open: true,
        message:
          "Error approving exam result: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleRejectResult = async () => {
    try {
      const response = await axios.put(
        `/api/exams/schedules/${selectedItem._id}/reject-result`,
        { adminMessage }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam result rejected successfully!",
          severity: "success",
        });
        setOpenRejectResultDialog(false);
        setAdminMessage("");
        fetchPendingApprovalExams();
        fetchExamSchedules();
      }
    } catch (error) {
      console.error("Error rejecting exam result:", error);
      setSnackbar({
        open: true,
        message:
          "Error rejecting exam result: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "scheduled":
        return <Chip label="Scheduled" color="primary" size="small" />;
      case "approved":
        return <Chip label="Approved" color="success" size="small" />;
      case "rejected":
        return <Chip label="Rejected" color="error" size="small" />;
      case "completed":
        return <Chip label="Completed" color="info" size="small" />;
      case "pending_approval":
        return <Chip label="Pending Approval" color="warning" size="small" />;
      case "cancelled":
        return <Chip label="Cancelled" color="default" size="small" />;
      case "no-show":
        return <Chip label="No Show" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🚗 Practical Exam Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage practical driving test schedules and approve exam results. Field
        tests are conducted at Ethiopian testing centers.
      </Typography>

      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2">
          <strong>📍 Field Testing Process:</strong>
          <br />
          • Practical exams are conducted at physical testing locations (Kality,
          Mekelle, Dire Dawa, etc.)
          <br />
          • Use the "Enter Result" button to input field test results after
          completion
          <br />
          • Results require admin approval before being finalized
          <br />
          • Passing score: 70% or above
          <br />
          <strong>⏰ Flexible Timing:</strong> Users can take exams 2 hours
          before or 4 hours after scheduled time
        </Typography>
      </Alert>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={`Scheduled Exams (${examSchedules.length})`}
            icon={<AssignmentIcon />}
          />
          <Tab
            label={`Pending Approval (${pendingApprovalExams.length})`}
            icon={<CheckIcon />}
          />
        </Tabs>

        {/* Tab 1: Scheduled Practical Exams */}
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
              <Typography variant="h6" gutterBottom>
                Scheduled Practical Exams
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchExamSchedules}
                size="small"
              >
                Refresh
              </Button>
            </Box>

            {examSchedules.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No practical exams scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Practical exam schedules will appear here when users book them
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Instructor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examSchedules.map((schedule) => (
                      <TableRow key={schedule._id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PersonIcon color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {schedule.fullName || schedule.userName}
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
                          <Typography variant="body2">
                            {new Date(schedule.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {schedule.time}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {schedule.location || "Not specified"}
                        </TableCell>
                        <TableCell>
                          {schedule.instructor || "To be assigned"}
                        </TableCell>
                        <TableCell>{getStatusChip(schedule.status)}</TableCell>
                        <TableCell>
                          {schedule.status === "scheduled" && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setSelectedItem(schedule);
                                  setOpenApproveDialog(true);
                                }}
                                title="Approve Schedule"
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
                                title="Reject Schedule"
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          )}
                          {schedule.status === "approved" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                navigate(
                                  `/admin/practical-exams/result/${schedule._id}`
                                );
                              }}
                              sx={{
                                fontWeight: "bold",
                                boxShadow: 2,
                                "&:hover": {
                                  boxShadow: 4,
                                  transform: "translateY(-1px)",
                                },
                              }}
                            >
                              📝 Add Field Test Result
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 2: Pending Approval Exams */}
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
              <Typography variant="h6" gutterBottom>
                Exams Pending Approval
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchPendingApprovalExams}
                size="small"
              >
                Refresh
              </Button>
            </Box>

            {pendingApprovalExams.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No exams pending approval
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed practical exams awaiting approval will appear here
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Evaluator</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingApprovalExams.map((exam) => (
                      <TableRow key={exam._id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PersonIcon color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {exam.fullName || exam.userName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID: {exam.userId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(exam.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {exam.time}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {exam.examResult?.score || "Not recorded"}
                            </Typography>
                            {exam.examResult?.score && (
                              <Chip
                                label={
                                  exam.examResult.score >= 70 ? "PASS" : "FAIL"
                                }
                                color={
                                  exam.examResult.score >= 70
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {exam.examResult?.evaluatedBy || "Not specified"}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {exam.examResult?.notes || "No notes provided"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                              setSelectedItem(exam);
                              setOpenApproveResultDialog(true);
                            }}
                            title="Approve Result"
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedItem(exam);
                              setOpenRejectResultDialog(true);
                            }}
                            title="Reject Result"
                          >
                            <CancelIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* Approve Schedule Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={() => setOpenApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Practical Exam Schedule</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to approve this practical exam schedule for{" "}
            <strong>{selectedItem?.fullName}</strong>?
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

      {/* Reject Schedule Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Practical Exam Schedule</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to reject this practical exam schedule for{" "}
            <strong>{selectedItem?.fullName}</strong>?
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

      {/* Approve Result Dialog */}
      <Dialog
        open={openApproveResultDialog}
        onClose={() => setOpenApproveResultDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Practical Exam Result</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to approve this practical exam result for{" "}
            <strong>{selectedItem?.fullName}</strong>?
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
          <Button onClick={() => setOpenApproveResultDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApproveResult}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Result Dialog */}
      <Dialog
        open={openRejectResultDialog}
        onClose={() => setOpenRejectResultDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Practical Exam Result</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to reject this practical exam result for{" "}
            <strong>{selectedItem?.fullName}</strong>?
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
          <Button onClick={() => setOpenRejectResultDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectResult}
            variant="contained"
            color="error"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export default PracticalExamApproval;
