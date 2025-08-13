import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
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
  Paper,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  Timer as TimerIcon,
  Quiz as QuizIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import axios from "axios";

const EnhancedExamTaking = ({ examId, onComplete, onCancel }) => {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("english");
  const [showLanguageDialog, setShowLanguageDialog] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [error, setError] = useState("");

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchExamQuestions = async (selectedLanguage) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5004/api/exams/take/${examId}?language=${selectedLanguage}`
      );

      if (response.data.success) {
        setExam(response.data.exam);
        setQuestions(response.data.questions);
        setLanguage(selectedLanguage);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      setError("Failed to load exam questions");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setShowLanguageDialog(false);
    fetchExamQuestions(selectedLanguage);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: parseInt(answer),
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Unknown User";

      // Convert answers to array format
      const answersArray = questions.map((question) => 
        answers[question._id] || 0
      );

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

      if (response.data.success) {
        setExamResult(response.data.result);
        setShowResultDialog(true);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      setError("Failed to submit exam");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelExam = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Unknown User";

      const response = await axios.post(
        `http://localhost:5004/api/exams/${examId}/submit`,
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
        onCancel && onCancel();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error cancelling exam:", error);
      setError("Failed to cancel exam");
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading && !showLanguageDialog) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>Loading exam...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} disableEscapeKeyDown>
        <DialogTitle sx={{ textAlign: "center" }}>
          <LanguageIcon sx={{ mr: 1 }} />
          Select Exam Language
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
            Please choose your preferred language for the theory exam:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => handleLanguageSelect("english")}
                sx={{ py: 2 }}
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
                sx={{ py: 2 }}
              >
                🇪🇹 አማርኛ (Amharic)
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Cancel Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this exam? Your progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>No, Continue</Button>
          <Button onClick={handleCancelExam} color="error" variant="contained">
            Yes, Cancel Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} disableEscapeKeyDown>
        <DialogTitle sx={{ textAlign: "center" }}>
          <CheckIcon 
            sx={{ 
              mr: 1, 
              color: examResult?.passed ? "success.main" : "error.main" 
            }} 
          />
          Exam Results
        </DialogTitle>
        <DialogContent>
          {examResult && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {examResult.score}%
              </Typography>
              <Alert 
                severity={examResult.passed ? "success" : "error"} 
                sx={{ mb: 2 }}
              >
                {examResult.passed 
                  ? "🎉 Congratulations! You passed the exam!" 
                  : "😔 You didn't pass. You need at least 74% to pass."}
              </Alert>
              <Typography variant="body1">
                Correct Answers: {examResult.correctAnswers} / {examResult.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time Spent: {formatTime(timeSpent)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => onComplete && onComplete(examResult)} 
            variant="contained"
            fullWidth
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exam Header */}
      {!showLanguageDialog && exam && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">
                  📝 Theory Exam
                </Typography>
                <Chip 
                  label={language === "english" ? "🇺🇸 English" : "🇪🇹 አማርኛ"} 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TimerIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Time: {formatTime(timeSpent)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  Progress: {getAnsweredCount()} / {questions.length} answered
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgress()} 
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Question Card */}
          {currentQuestion && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
                  {currentQuestion.question}
                </Typography>

                <FormControl component="fieldset">
                  <RadioGroup
                    value={answers[currentQuestion._id] || ""}
                    onChange={(e) => 
                      handleAnswerChange(currentQuestion._id, e.target.value)
                    }
                  >
                    {currentQuestion.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={index}
                        control={<Radio />}
                        label={option}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outlined"
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

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon />}
                  disabled={getAnsweredCount() < questions.length}
                >
                  Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  variant="contained"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          {/* Question Overview */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Question Overview:
            </Typography>
            <Grid container spacing={1}>
              {questions.map((_, index) => (
                <Grid item key={index}>
                  <Button
                    size="small"
                    variant={
                      index === currentQuestionIndex 
                        ? "contained" 
                        : answers[questions[index]._id] !== undefined 
                        ? "outlined" 
                        : "text"
                    }
                    onClick={() => setCurrentQuestionIndex(index)}
                    sx={{ minWidth: 40 }}
                  >
                    {index + 1}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default EnhancedExamTaking;
