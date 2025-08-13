import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  DriveEta as DriveIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PracticalExamResultEntry = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examResult, setExamResult] = useState({
    score: "",
    evaluatedBy: "",
    notes: "",
    overallResult: "pass", // pass or fail
  });
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5004/api/exams/schedules/${examId}`
      );
      setExamData(response.data.data);
      setExamResult(prev => ({
        ...prev,
        evaluatedBy: localStorage.getItem("userName") || "Admin"
      }));
    } catch (error) {
      console.error("Error fetching exam data:", error);
      setSnackbar({
        open: true,
        message: "Error loading exam data: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async () => {
    try {
      // Calculate score based on overall result
      const calculatedScore = examResult.overallResult === "pass" ?
        (examResult.score ? parseInt(examResult.score) : 75) :
        (examResult.score ? parseInt(examResult.score) : 45);

      const response = await axios.put(
        `http://localhost:5004/api/exams/schedules/${examId}/complete-final`,
        {
          score: calculatedScore,
          notes: examResult.notes,
          evaluatedBy: examResult.evaluatedBy,
          overallPerformance: examResult.overallResult === "pass" ? "satisfactory" : "needs_improvement",
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Practical exam result submitted successfully! The candidate has been notified of their final result.",
          severity: "success",
        });
        setOpenSubmitDialog(false);

        // Navigate back to practical exam management after a delay
        setTimeout(() => {
          navigate("/admin/practical-exams");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting exam result:", error);
      setSnackbar({
        open: true,
        message: "Error submitting result: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading exam data...</Typography>
      </Box>
    );
  }

  if (!examData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Exam not found or you don't have permission to access this exam.
        </Alert>
        <Button onClick={() => navigate("/admin/practical-exams")} sx={{ mt: 2 }}>
          Back to Practical Exams
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/admin/practical-exams")}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight="bold">
          🚗 Enter Practical Exam Result
        </Typography>
      </Box>

      {/* Exam Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Exam Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PersonIcon color="primary" />
              <Box>
                <Typography variant="h6">
                  {examData.fullName || examData.userName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  User ID: {examData.userId}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DriveIcon color="primary" />
              <Box>
                <Typography variant="body1">
                  <strong>Date:</strong> {new Date(examData.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong> {examData.time}
                </Typography>
                <Typography variant="body1">
                  <strong>Location:</strong> {examData.location}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Result Entry Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Practical Exam Result Entry
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the results from the field practical driving test
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Overall Test Result</FormLabel>
                <RadioGroup
                  value={examResult.overallResult}
                  onChange={(e) => setExamResult(prev => ({ ...prev, overallResult: e.target.value }))}
                >
                  <FormControlLabel
                    value="pass"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="PASS" color="success" size="small" />
                        <span>Candidate passed the practical test</span>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="fail"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="FAIL" color="error" size="small" />
                        <span>Candidate failed the practical test</span>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Score (Optional)"
                type="number"
                value={examResult.score}
                onChange={(e) => setExamResult(prev => ({ ...prev, score: e.target.value }))}
                fullWidth
                inputProps={{ min: 0, max: 100 }}
                helperText="Enter specific score if available (0-100)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Evaluated By"
                value={examResult.evaluatedBy}
                onChange={(e) => setExamResult(prev => ({ ...prev, evaluatedBy: e.target.value }))}
                fullWidth
                required
                helperText="Name of the instructor/examiner"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Examiner Notes"
                value={examResult.notes}
                onChange={(e) => setExamResult(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={4}
                placeholder="Provide detailed feedback about the candidate's performance, areas of strength, and areas needing improvement..."
                helperText="Include specific observations about driving skills, traffic rule compliance, and overall performance"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: examResult.overallResult === 'pass' ? 'success.light' : 'error.light' }}>
        <Typography variant="h6" gutterBottom>
          Result Summary
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {examResult.overallResult === 'pass' ? '✅ PASS' : '❌ FAIL'}
        </Typography>
        {examResult.score && (
          <Typography variant="h5" color="text.secondary">
            Score: {examResult.score}%
          </Typography>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/admin/practical-exams")}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setOpenSubmitDialog(true)}
          disabled={!examResult.evaluatedBy.trim()}
        >
          Submit Result
        </Button>
      </Box>

      {/* Submit Confirmation Dialog */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)}>
        <DialogTitle>Submit Practical Exam Result</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to submit this practical exam result?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Result: {examResult.overallResult === 'pass' ? 'PASS' : 'FAIL'}
            {examResult.score && ` - Score: ${examResult.score}%`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will finalize the result and immediately notify the candidate. No further approval is required.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitResult} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PracticalExamResultEntry;
