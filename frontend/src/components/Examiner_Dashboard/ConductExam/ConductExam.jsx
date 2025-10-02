import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as BackIcon,
  Timer as TimerIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ConductExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [examDuration, setExamDuration] = useState(0);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [examResult, setExamResult] = useState({
    // Basic Information
    examinerName: localStorage.getItem("userName") || "",
    examDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",

    // Vehicle and Route Information
    vehicleDetails: {
      make: "",
      model: "",
      plateNumber: "",
      condition: "good",
    },
    routeDetails: {
      startLocation: "",
      endLocation: "",
      routeType: "urban",
      trafficConditions: "normal",
      weatherConditions: "clear",
    },

    // Practical Skills Assessment
    maneuvers: {
      parallelParking: { score: 0, notes: "" },
      threePointTurn: { score: 0, notes: "" },
      hillStart: { score: 0, notes: "" },
      reversing: { score: 0, notes: "" },
      emergencyStop: { score: 0, notes: "" },
      roundabout: { score: 0, notes: "" },
    },

    // Traffic Rules and Safety
    trafficRules: {
      signalUsage: { score: 0, notes: "" },
      speedControl: { score: 0, notes: "" },
      laneChanging: { score: 0, notes: "" },
      intersectionHandling: { score: 0, notes: "" },
      pedestrianAwareness: { score: 0, notes: "" },
      followingDistance: { score: 0, notes: "" },
    },

    // Vehicle Control
    vehicleControl: {
      steering: { score: 0, notes: "" },
      acceleration: { score: 0, notes: "" },
      braking: { score: 0, notes: "" },
      clutchControl: { score: 0, notes: "" },
      gearChanging: { score: 0, notes: "" },
      mirrorUsage: { score: 0, notes: "" },
    },

    // Overall Assessment
    overallPerformance: "",
    finalScore: 0,
    result: "pending", // pass/fail/pending
    generalNotes: "",
    recommendations: "",

    // Critical Errors
    criticalErrors: [],
    minorFaults: [],
    majorFaults: [],
  });

  const steps = [
    "Exam Setup",
    "Vehicle & Route Check",
    "Practical Maneuvers",
    "Traffic Rules Assessment",
    "Vehicle Control Evaluation",
    "Final Assessment",
  ];

  const criticalErrorOptions = [
    "Dangerous driving",
    "Traffic light violation",
    "Speed limit violation",
    "Failure to yield right of way",
    "Improper lane change",
    "Collision or near miss",
    "Failure to stop at stop sign",
    "Driving on wrong side of road",
  ];

  useEffect(() => {
    fetchExamData();
    setExamStartTime(new Date());
  }, [examId]);

  useEffect(() => {
    if (examStartTime) {
      const interval = setInterval(() => {
        setExamDuration(Math.floor((new Date() - examStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [examStartTime]);

  const fetchExamData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/exams/schedules/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExamData(response.data);
      setExamResult((prev) => ({
        ...prev,
        startTime: new Date().toLocaleTimeString(),
        routeDetails: {
          ...prev.routeDetails,
          startLocation: response.data.location || "",
        },
      }));
    } catch (error) {
      console.error("Error fetching exam data:", error);
      setSnackbar({
        open: true,
        message: "Error loading exam data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalScore = () => {
    const maneuverScores = Object.values(examResult.maneuvers).map(
      (m) => m.score
    );
    const trafficScores = Object.values(examResult.trafficRules).map(
      (t) => t.score
    );
    const controlScores = Object.values(examResult.vehicleControl).map(
      (v) => v.score
    );

    const allScores = [...maneuverScores, ...trafficScores, ...controlScores];
    const averageScore =
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

    // Deduct points for critical errors
    const criticalDeduction = examResult.criticalErrors.length * 20;
    const majorDeduction = examResult.majorFaults.length * 10;
    const minorDeduction = examResult.minorFaults.length * 2;

    const finalScore = Math.max(
      0,
      averageScore - criticalDeduction - majorDeduction - minorDeduction
    );

    return Math.round(finalScore);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleScoreChange = (category, skill, score) => {
    setExamResult((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skill]: {
          ...prev[category][skill],
          score: score,
        },
      },
    }));
  };

  const handleNotesChange = (category, skill, notes) => {
    setExamResult((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skill]: {
          ...prev[category][skill],
          notes: notes,
        },
      },
    }));
  };

  const handleSubmitResult = async () => {
    try {
      const finalScore = calculateFinalScore();
      const result = finalScore >= 70 ? "pass" : "fail";

      const submissionData = {
        ...examResult,
        endTime: new Date().toLocaleTimeString(),
        finalScore: finalScore,
        result: result,
        examDuration: examDuration,
      };

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/exams/schedules/${examId}/complete-examiner`,
        submissionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Exam result submitted successfully!",
          severity: "success",
        });

        setTimeout(() => {
          navigate("/examiner/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting exam result:", error);
      setSnackbar({
        open: true,
        message: "Error submitting exam result",
        severity: "error",
      });
    }
    setOpenSubmitDialog(false);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
            <IconButton onClick={() => navigate("/examiner/dashboard")}>
              <BackIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Practical Exam - {examData?.fullName || examData?.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📅 {new Date(examData?.date).toLocaleDateString()} • 📍{" "}
                {examData?.location}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<TimerIcon />}
              label={formatDuration(examDuration)}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Score: ${calculateFinalScore()}%`}
              color={calculateFinalScore() >= 70 ? "success" : "error"}
            />
          </Box>
        </Box>
      </Paper>

      {/* Stepper */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: "20px" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: "20px", mb: 3 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Exam Setup
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Examiner Name"
                  value={examResult.examinerName}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      examinerName: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Exam Date"
                  type="date"
                  value={examResult.examDate}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      examDate: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Vehicle & Route Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Vehicle Make"
                  value={examResult.vehicleDetails.make}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      vehicleDetails: {
                        ...prev.vehicleDetails,
                        make: e.target.value,
                      },
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Vehicle Model"
                  value={examResult.vehicleDetails.model}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      vehicleDetails: {
                        ...prev.vehicleDetails,
                        model: e.target.value,
                      },
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Plate Number"
                  value={examResult.vehicleDetails.plateNumber}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      vehicleDetails: {
                        ...prev.vehicleDetails,
                        plateNumber: e.target.value,
                      },
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Practical Maneuvers Assessment
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(examResult.maneuvers).map(([skill, data]) => (
                <Grid item xs={12} md={6} key={skill}>
                  <Card elevation={2} sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {skill
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Typography>
                    <Typography gutterBottom>Score: {data.score}/10</Typography>
                    <Slider
                      value={data.score}
                      onChange={(e, value) =>
                        handleScoreChange("maneuvers", skill, value)
                      }
                      min={0}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Notes"
                      value={data.notes}
                      onChange={(e) =>
                        handleNotesChange("maneuvers", skill, e.target.value)
                      }
                      size="small"
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Traffic Rules & Safety Assessment
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(examResult.trafficRules).map(([skill, data]) => (
                <Grid item xs={12} md={6} key={skill}>
                  <Card elevation={2} sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {skill
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Typography>
                    <Typography gutterBottom>Score: {data.score}/10</Typography>
                    <Slider
                      value={data.score}
                      onChange={(e, value) =>
                        handleScoreChange("trafficRules", skill, value)
                      }
                      min={0}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Notes"
                      value={data.notes}
                      onChange={(e) =>
                        handleNotesChange("trafficRules", skill, e.target.value)
                      }
                      size="small"
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Vehicle Control Assessment
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(examResult.vehicleControl).map(
                ([skill, data]) => (
                  <Grid item xs={12} md={6} key={skill}>
                    <Card elevation={2} sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        {skill
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Typography>
                      <Typography gutterBottom>
                        Score: {data.score}/10
                      </Typography>
                      <Slider
                        value={data.score}
                        onChange={(e, value) =>
                          handleScoreChange("vehicleControl", skill, value)
                        }
                        min={0}
                        max={10}
                        marks
                        valueLabelDisplay="auto"
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes"
                        value={data.notes}
                        onChange={(e) =>
                          handleNotesChange(
                            "vehicleControl",
                            skill,
                            e.target.value
                          )
                        }
                        size="small"
                      />
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </Box>
        )}

        {activeStep === 5 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Final Assessment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Overall Performance
                  </Typography>
                  <FormControl component="fieldset">
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
                      <FormControlLabel
                        value="unsatisfactory"
                        control={<Radio />}
                        label="Unsatisfactory"
                      />
                    </RadioGroup>
                  </FormControl>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Final Score
                  </Typography>
                  <Typography
                    variant="h3"
                    color={
                      calculateFinalScore() >= 70
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {calculateFinalScore()}%
                  </Typography>
                  <Chip
                    label={calculateFinalScore() >= 70 ? "PASS" : "FAIL"}
                    color={calculateFinalScore() >= 70 ? "success" : "error"}
                    size="large"
                    sx={{ mt: 2 }}
                  />
                </Card>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="General Notes & Comments"
                  value={examResult.generalNotes}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      generalNotes: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Recommendations for Improvement"
                  value={examResult.recommendations}
                  onChange={(e) =>
                    setExamResult((prev) => ({
                      ...prev,
                      recommendations: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Navigation Buttons */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: "20px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setOpenSubmitDialog(true)}
              startIcon={<SendIcon />}
            >
              Submit Result
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Submit Dialog */}
      <Dialog
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
      >
        <DialogTitle>Submit Exam Result</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit the exam result for{" "}
            {examData?.fullName}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Final Score: {calculateFinalScore()}% -{" "}
            {calculateFinalScore() >= 70 ? "PASS" : "FAIL"}
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
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ConductExam;
