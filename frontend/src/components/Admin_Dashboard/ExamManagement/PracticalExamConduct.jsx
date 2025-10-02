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
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person as PersonIcon,
  DriveEta as DriveIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PracticalExamConduct = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examResult, setExamResult] = useState({
    score: "",
    evaluatedBy: "",
    notes: "",
    maneuvers: {
      parallelParking: "",
      threePointTurn: "",
      hillStart: "",
      reversing: "",
      emergencyStop: "",
    },
    trafficRules: {
      signalUsage: "",
      speedControl: "",
      laneChanging: "",
      intersectionHandling: "",
      pedestrianAwareness: "",
    },
    overallPerformance: "",
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
      const response = await axios.get(`/api/exams/schedules/${examId}`);
      setExamData(response.data.data);
      setExamResult((prev) => ({
        ...prev,
        evaluatedBy: localStorage.getItem("userName") || "Instructor",
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

  const handleManeuverChange = (maneuver, value) => {
    setExamResult((prev) => ({
      ...prev,
      maneuvers: {
        ...prev.maneuvers,
        [maneuver]: value,
      },
    }));
  };

  const handleTrafficRuleChange = (rule, value) => {
    setExamResult((prev) => ({
      ...prev,
      trafficRules: {
        ...prev.trafficRules,
        [rule]: value,
      },
    }));
  };

  const calculateScore = () => {
    const maneuverScores = Object.values(examResult.maneuvers);
    const trafficScores = Object.values(examResult.trafficRules);
    const allScores = [...maneuverScores, ...trafficScores];

    const validScores = allScores.filter((score) => score !== "");
    if (validScores.length === 0) return 0;

    const passCount = validScores.filter((score) => score === "pass").length;
    return Math.round((passCount / validScores.length) * 100);
  };

  const handleSubmitResult = async () => {
    try {
      const calculatedScore = calculateScore();

      const response = await axios.put(
        `/api/exams/schedules/${examId}/complete`,
        {
          score: calculatedScore,
          notes: examResult.notes,
          evaluatedBy: examResult.evaluatedBy,
          maneuvers: examResult.maneuvers,
          trafficRules: examResult.trafficRules,
          overallPerformance: examResult.overallPerformance,
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Practical exam result submitted successfully!",
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
        message:
          "Error submitting result: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const renderEvaluationSection = (title, items, category) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(items).map(([key, label]) => (
            <Grid item xs={12} md={6} key={key}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{label}</FormLabel>
                <RadioGroup
                  row
                  value={
                    category === "maneuvers"
                      ? examResult.maneuvers[key]
                      : examResult.trafficRules[key]
                  }
                  onChange={(e) =>
                    category === "maneuvers"
                      ? handleManeuverChange(key, e.target.value)
                      : handleTrafficRuleChange(key, e.target.value)
                  }
                >
                  <FormControlLabel
                    value="pass"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckIcon color="success" fontSize="small" />
                        Pass
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="fail"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CancelIcon color="error" fontSize="small" />
                        Fail
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading exam data...</Typography>
      </Box>
    );
  }

  if (!examData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">
          Exam not found or you don't have permission to access this exam.
        </Alert>
        <Button
          onClick={() => navigate("/admin/practical-exams")}
          sx={{ mt: 2 }}
        >
          Back to Practical Exams
        </Button>
      </Box>
    );
  }

  const maneuverItems = {
    parallelParking: "Parallel Parking",
    threePointTurn: "Three-Point Turn",
    hillStart: "Hill Start",
    reversing: "Reversing",
    emergencyStop: "Emergency Stop",
  };

  const trafficRuleItems = {
    signalUsage: "Signal Usage",
    speedControl: "Speed Control",
    laneChanging: "Lane Changing",
    intersectionHandling: "Intersection Handling",
    pedestrianAwareness: "Pedestrian Awareness",
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🚗 Conduct Practical Exam
      </Typography>

      {/* Exam Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <DriveIcon color="primary" />
              <Box>
                <Typography variant="body1">
                  <strong>Date:</strong>{" "}
                  {new Date(examData.date).toLocaleDateString()}
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

      {/* Evaluation Form */}
      {renderEvaluationSection("Driving Maneuvers", maneuverItems, "maneuvers")}
      {renderEvaluationSection(
        "Traffic Rules & Safety",
        trafficRuleItems,
        "trafficRules"
      )}

      {/* Overall Performance and Notes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Assessment
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Overall Performance</FormLabel>
                <RadioGroup
                  value={examResult.overallPerformance}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      overallPerformance: e.target.value,
                    }))
                  }
                >
                  <FormControlLabel
                    value="excellent"
                    control={<Radio />}
                    label="Excellent"
                  />
                  <FormControlLabel
                    value="good"
                    control={<Radio />}
                    label="Good"
                  />
                  <FormControlLabel
                    value="satisfactory"
                    control={<Radio />}
                    label="Satisfactory"
                  />
                  <FormControlLabel
                    value="needs_improvement"
                    control={<Radio />}
                    label="Needs Improvement"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Evaluator Name"
                value={examResult.evaluatedBy}
                onChange={(e) =>
                  setExamResult((prev) => ({
                    ...prev,
                    evaluatedBy: e.target.value,
                  }))
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Additional Notes"
                value={examResult.notes}
                onChange={(e) =>
                  setExamResult((prev) => ({ ...prev, notes: e.target.value }))
                }
                fullWidth
                multiline
                rows={4}
                placeholder="Provide detailed feedback about the candidate's performance..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Score Display */}
      <Paper sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Calculated Score
        </Typography>
        <Typography
          variant="h3"
          color={calculateScore() >= 70 ? "success.main" : "error.main"}
        >
          {calculateScore()}%
        </Typography>
        <Chip
          label={calculateScore() >= 70 ? "PASS" : "FAIL"}
          color={calculateScore() >= 70 ? "success" : "error"}
          size="large"
          sx={{ mt: 1 }}
        />
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
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
      <Dialog
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
      >
        <DialogTitle>Submit Practical Exam Result</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to submit this practical exam result?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score: {calculateScore()}% -{" "}
            {calculateScore() >= 70 ? "PASS" : "FAIL"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone and will send the result for admin
            approval.
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

export default PracticalExamConduct;
