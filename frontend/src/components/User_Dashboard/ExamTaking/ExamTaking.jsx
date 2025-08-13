import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Grid,
  Divider,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  Timer as TimerIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const ExamTaking = ({ examId, onExamComplete, onClose }) => {
  console.log("🔄 ExamTaking component mounted/re-rendered with props:", { examId, onClose: !!onClose, onExamComplete: !!onExamComplete });

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [forceStartForTesting, setForceStartForTesting] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [language, setLanguage] = useState("english");
  const [showLanguageDialog, setShowLanguageDialog] = useState(false); // Temporarily disable for testing
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Initial fetch when component mounts
  useEffect(() => {
    if (examId) {
      console.log("🚀 Component mounted, fetching exam for ID:", examId);
      fetchExam("english"); // Directly fetch exam for testing
    }
  }, [examId]);

  // Timer effect for tracking time spent
  useEffect(() => {
    let timer;
    if (examStarted && !examCompleted) {
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examCompleted]);

  // Auto-mark correct answers for testing
  useEffect(() => {
    if (examStarted && questions.length > 0 && answers[currentQuestion] === undefined) {
      const currentQ = questions[currentQuestion];
      if (currentQ?.correctAnswer !== undefined) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion]: currentQ.correctAnswer
        }));
      }
    }
  }, [currentQuestion, examStarted, questions, answers]);

  const fetchExamInfo = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching exam info for ID:", examId);

      const response = await axios.get(
        `http://localhost:5004/api/exams/schedules/${examId}`
      );

      console.log("📋 Exam info response:", response.data);

      if (response.data.success) {
        setExam(response.data.data);
        // For theory exams, show language dialog
        if (response.data.data.examType === "theory") {
          setShowLanguageDialog(true);
        } else {
          // For practical exams, fetch questions directly
          setShowLanguageDialog(false);
          fetchExam("english");
        }
      } else {
        console.error("❌ Failed to fetch exam info:", response.data.message);
        // Fallback: try to fetch exam directly
        console.log("🔄 Trying fallback: fetch exam directly");
        fetchExam("english");
      }
    } catch (error) {
      console.error("❌ Error fetching exam info:", error);
      // Fallback: try to fetch exam directly
      console.log("🔄 Trying fallback: fetch exam directly");
      fetchExam("english");
    } finally {
      setLoading(false);
    }
  };

  const fetchExam = async (selectedLanguage = "english") => {
    try {
      setLoading(true);
      console.log("📝 Fetching exam questions for ID:", examId, "Language:", selectedLanguage);

      const response = await axios.get(
        `http://localhost:5004/api/exams/take/${examId}?language=${selectedLanguage}`
      );

      console.log("📋 Exam questions response:", response.data);

      if (response.data.success) {
        setExam(response.data.exam);
        setQuestions(response.data.questions);
        setLanguage(selectedLanguage);
        console.log("✅ Exam data loaded successfully. Questions:", response.data.questions.length);
      } else {
        console.error("❌ Failed to fetch exam questions:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setShowLanguageDialog(false);
    fetchExam(selectedLanguage);
  };

  const handleStartExam = () => {
    console.log("🚀 Starting exam...");
    console.log("Current state before start:", { examStarted, loading, examCompleted });

    // Prevent any default behavior that might cause navigation
    try {
      setExamStarted(true);
      console.log("✅ Exam started state set to true");
    } catch (error) {
      console.error("❌ Error setting exam started:", error);
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      console.log("📤 Submitting exam...");
      setShowConfirmDialog(false); // Close confirmation dialog

      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Unknown User";

      // Convert answers object to array
      const answersArray = questions.map((_, index) => answers[index] || 0);

      console.log("📋 Exam submission data:", {
        userId,
        userName,
        answersCount: answersArray.length,
        timeSpent: Math.floor(timeSpent / 60),
        language,
        answers: answersArray
      });

      const response = await axios.post(
        `http://localhost:5004/api/exams/take/${examId}/submit`,
        {
          userId,
          userName,
          answers: answersArray,
          timeSpent: Math.floor(timeSpent / 60), // Convert to minutes
          language,
          cancelled: false,
        }
      );

      console.log("📊 Exam submission response:", response.data);

      if (response.data.success) {
        console.log("✅ Exam submitted successfully, showing results");
        console.log("📊 Exam result data:", response.data.result);
        setExamResult(response.data.result);
        setExamCompleted(true);

        // Add a small delay to ensure the result is saved before calling onExamComplete
        setTimeout(() => {
          if (onExamComplete) {
            console.log("🔄 Calling onExamComplete to refresh results");
            onExamComplete(response.data.result);
          }
        }, 1000);
      } else {
        console.error("❌ Exam submission failed:", response.data.message);
        alert("Failed to submit exam: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error submitting exam:", error);
      alert("Error submitting exam. Please try again or contact support.");
    }
  };

  const handleCancelExam = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Unknown User";

      const response = await axios.post(
        `http://localhost:5004/api/exams/take/${examId}/submit`,
        {
          userId,
          userName,
          answers: [],
          timeSpent: Math.floor(timeSpent / 60),
          language,
          cancelled: true,
        }
      );

      if (response.data.success) {
        setExamCompleted(true);
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error cancelling exam:", error);
    } finally {
      setShowCancelDialog(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log("🔍 ExamTaking render state:", {
      loading,
      examStarted,
      examCompleted,
      showLanguageDialog,
      hasExam: !!exam,
      hasQuestions: questions.length > 0,
      examId
    });
  }

  if (loading) {
    console.log("📋 Showing loading screen");
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Typography>Loading exam...</Typography>
      </Box>
    );
  }

  if (!exam || !questions.length) {
    console.log("❌ No exam or questions available");
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">
          Exam not found or no questions available.
          <br />
          Debug: Exam = {exam ? "✅" : "❌"}, Questions = {questions.length}
        </Alert>
      </Box>
    );
  }

  if (examCompleted && examResult) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Paper
          sx={{
            p: 4,
            maxWidth: 700,
            mx: "auto",
            background: examResult.passed
              ? "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)"
              : "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)",
            border: examResult.passed ? "2px solid #4caf50" : "2px solid #f44336"
          }}
        >
          {/* Success/Failure Icon */}
          <Box sx={{ mb: 3 }}>
            {examResult.passed ? (
              <CheckIcon sx={{ fontSize: 100, color: "success.main", mb: 2 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 100, color: "error.main", mb: 2 }} />
            )}
          </Box>

          {/* Main Result */}
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Exam {examResult.passed ? "Passed!" : "Failed"}
          </Typography>

          {/* Score Display */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h1"
              fontWeight="bold"
              color={examResult.passed ? "success.main" : "error.main"}
              sx={{ fontSize: "4rem", mb: 1 }}
            >
              {examResult.score}%
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {examResult.passed ? "🎉 Excellent Work!" : "📚 Keep Studying!"}
            </Typography>
          </Box>

          {/* Detailed Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: "center", bgcolor: "background.default" }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {examResult.correctAnswers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Correct Answers
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: "center", bgcolor: "background.default" }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {examResult.totalQuestions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Questions
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: "center", bgcolor: "background.default" }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {formatTime(timeSpent)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Taken
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Details */}
          <Grid container spacing={2} sx={{ mb: 3, textAlign: "left" }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Exam Type:</strong> {exam.examType === "theory" ? "Theory (Written)" : "Practical (Road Test)"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Language:</strong> {language === "english" ? "🇺🇸 English" : "🇪🇹 አማርኛ"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Passing Score:</strong> 74%
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date:</strong> {format(new Date(), "PPP")}
              </Typography>
            </Grid>
          </Grid>

          {/* Result Message */}
          <Alert
            severity={examResult.passed ? "success" : "error"}
            sx={{ mb: 4, textAlign: "left" }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {examResult.passed ? "🎉 Congratulations!" : "📚 Don't Give Up!"}
            </Typography>
            <Typography variant="body2">
              {examResult.passed
                ? "You have successfully passed the exam! You can now proceed to the next step in your driving license application. Your result has been recorded in the system."
                : `You scored ${examResult.score}% but need at least 74% to pass. Review the study materials and try again when you're ready. You can retake the exam after studying more.`}
            </Typography>
          </Alert>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={onClose}
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Back to Dashboard
            </Button>
            {!examResult.passed && (
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={onClose}
                sx={{ px: 4, py: 1.5 }}
              >
                Study & Retake
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  if (showLanguageDialog && exam?.examType === "theory") {
    console.log("🌐 Showing language dialog");
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", textAlign: "center" }}>
          <LanguageIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Select Exam Language
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
            Please choose your preferred language for the theory exam:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => handleLanguageSelect("english")}
                sx={{
                  py: 3,
                  fontSize: "1.1rem",
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 }
                }}
              >
                🇺🇸 English
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => handleLanguageSelect("amharic")}
                sx={{
                  py: 3,
                  fontSize: "1.1rem",
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 }
                }}
              >
                🇪🇹 አማርኛ (Amharic)
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  if (!examStarted) {
    console.log("📋 Showing start exam screen");
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <QuizIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {exam.examType === "theory" ? "Theory Exam" : "Practical Exam"}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Main Driving License Examination
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ScheduleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Exam Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Date:</strong> {format(new Date(exam.date), "PPP")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Time:</strong> {exam.time}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Location:</strong> {exam.location}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong>{" "}
                    {exam.examType === "theory"
                      ? "Theory (Written)"
                      : "Practical (Road Test)"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TimerIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Exam Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Questions:</strong> {questions.length}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Duration:</strong>{" "}
                    {exam.examType === "theory" ? "60 minutes" : "30 minutes"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Passing Score:</strong> 74%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Question Types:</strong> Multiple Choice
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              <strong>Instructions:</strong>
              <br />
              • Read each question carefully before selecting your answer
              <br />
              • You can navigate between questions using the Previous/Next
              buttons
              <br />
              • Make sure to answer all questions before submitting
              <br />
              • The exam will auto-submit when time runs out
              <br />• You need at least 74% to pass this exam
            </Typography>
          </Alert>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🖱️ Start Exam button clicked");
                handleStartExam();
              }}
              sx={{ px: 6, py: 2, mr: 2 }}
              type="button"
            >
              Start Exam
            </Button>

            {/* Test button to force start exam */}
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => {
                console.log("🧪 Force starting exam for testing");
                setForceStartForTesting(true);
                setExamStarted(true);
              }}
              sx={{ px: 4, py: 2 }}
            >
              🧪 Force Start (Test)
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  const currentQ = questions[currentQuestion];

  console.log("📝 Showing exam questions - examStarted:", examStarted);

  if (!currentQ) {
    console.log("❌ No current question available");
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">
          Question data not available. Please refresh and try again.
          <br />
          Debug: Current Question Index = {currentQuestion}, Total Questions = {questions.length}
        </Alert>
      </Box>
    );
  }

  console.log("✅ Rendering exam questions interface");
  return (
    <Box sx={{ p: 3 }}>
      {/* Test Mode */}
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>TEST MODE:</strong> Correct answers marked automatically
        </Typography>
      </Alert>

      {/* Header with timer and progress */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TimerIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Time: {formatTime(timeSpent)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Chip
              label={language === "english" ? "🇺🇸 English" : "🇪🇹 አማርኛ"}
              size="small"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "right" }}>
              <Chip
                label={`Answered: ${getAnsweredCount()}/${questions.length}`}
                color={
                  getAnsweredCount() === questions.length
                    ? "success"
                    : "warning"
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Question */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Question {currentQuestion + 1}
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, lineHeight: 1.6 }}>
          {currentQ.question}
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={answers[currentQuestion] !== undefined ? answers[currentQuestion].toString() : ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion, parseInt(e.target.value))
            }
          >
            {currentQ.options.map((option, index) => {
              const isCorrectAnswer = currentQ.correctAnswer === index;
              const isSelected = answers[currentQuestion] === index;

              return (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={
                    <Radio
                      sx={{
                        pointerEvents: 'auto',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.04)'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body1" sx={{ py: 1, cursor: 'pointer' }}>
                      {String.fromCharCode(65 + index)}. {option}
                    </Typography>
                  }
                  sx={{
                    mb: 1,
                    p: 2,
                    border: isCorrectAnswer ? "2px solid #4caf50" : "1px solid #e0e0e0",
                    borderRadius: 1,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    backgroundColor: isCorrectAnswer ? "#e8f5e9" : "transparent",
                    "&:hover": {
                      backgroundColor: isCorrectAnswer ? "#c8e6c9" : "#f5f5f5",
                      borderColor: isCorrectAnswer ? "#4caf50" : "#1976d2"
                    },
                    "&.Mui-checked": {
                      backgroundColor: isSelected ? (isCorrectAnswer ? "#a5d6a7" : "#e3f2fd") : "transparent",
                      borderColor: isSelected ? (isCorrectAnswer ? "#4caf50" : "#1976d2") : "inherit"
                    },
                    // Ensure the entire area is clickable
                    "& .MuiFormControlLabel-label": {
                      width: '100%',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={(e) => {
                    // Ensure clicking anywhere on the option selects it
                    if (e.target.type !== 'radio') {
                      handleAnswerChange(currentQuestion, index);
                    }
                  }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Navigation */}
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() => setShowCancelDialog(true)}
              color="error"
              variant="outlined"
              startIcon={<CancelIcon />}
            >
              Cancel Exam
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                onClick={() => setShowConfirmDialog(true)}
                size="large"
              >
                Submit Exam
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNextQuestion}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Submit Exam</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your exam? You have answered{" "}
            {getAnsweredCount()} out of {questions.length} questions.
          </Typography>
          {getAnsweredCount() < questions.length && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have {questions.length - getAnsweredCount()} unanswered
              questions. These will be marked as incorrect.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitExam}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon color="error" />
          Cancel Exam?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this exam? Your progress will be lost and this will be recorded as a cancelled attempt.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Warning:</strong> This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>No, Continue</Button>
          <Button onClick={handleCancelExam} color="error" variant="contained">
            Yes, Cancel Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamTaking;
