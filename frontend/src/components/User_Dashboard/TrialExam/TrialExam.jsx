import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
} from "@mui/material";
import {
  Timer as TimerIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "axios";

const TrialExam = ({ onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examCompleted) {
      handleSubmitExam();
    }
  }, [timeLeft, examStarted, examCompleted]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/trial/questions?limit=20");
      if (response.data.success) {
        setQuestions(response.data.questions);
        setTimeStarted(new Date());
        setExamStarted(true);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Error loading questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
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

      if (!userId) {
        alert("User not found. Please login again.");
        return;
      }

      // Prepare answers for submission
      const submissionAnswers = questions.map((question) => ({
        questionId: question._id,
        userAnswer:
          answers[question._id] !== undefined ? answers[question._id] : -1,
        timeSpent: 0, // Could be enhanced to track individual question time
      }));

      const submissionData = {
        userId,
        answers: submissionAnswers,
        timeStarted: timeStarted.toISOString(),
        timeCompleted: new Date().toISOString(),
      };

      const response = await axios.post("/api/trial/submit", submissionData);

      if (response.data.success) {
        setResult(response.data.result);
        setExamCompleted(true);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Error submitting exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!examStarted) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <QuizIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Trial Driving Exam
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Test your knowledge with 20 questions. You have 20 minutes to complete
          the exam. Passing score is 70%.
        </Typography>

        <Card sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Exam Instructions:
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "left" }}>
              • 20 multiple choice questions
              <br />
              • 20 minutes time limit
              <br />
              • 70% passing score (14/20 correct)
              <br />
              • You can navigate between questions
              <br />• Submit before time runs out
            </Typography>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          onClick={fetchQuestions}
          disabled={loading}
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          {loading ? "Loading Questions..." : "Start Exam"}
        </Button>
      </Box>
    );
  }

  if (examCompleted && result) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        {result.result === "Pass" ? (
          <CheckIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        ) : (
          <CancelIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
        )}

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Exam {result.result}!
        </Typography>

        <Typography
          variant="h2"
          fontWeight="bold"
          color={result.result === "Pass" ? "success.main" : "error.main"}
          sx={{ mb: 3 }}
        >
          {result.percentage}%
        </Typography>

        <Grid container spacing={2} sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                  {result.totalQuestions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Questions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {result.correctAnswers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Correct
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {result.wrongAnswers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wrong
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                  {Math.floor(result.totalTimeSpent / 60)}m
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Taken
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert
          severity={result.result === "Pass" ? "success" : "error"}
          sx={{ maxWidth: 600, mx: "auto", mb: 3 }}
        >
          {result.result === "Pass"
            ? "Congratulations! You passed the trial exam. You're ready for the real test!"
            : "Don't worry! Keep studying and try again. You need 70% to pass."}
        </Alert>

        <Button
          variant="contained"
          onClick={onClose}
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Timer and Progress */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<TimerIcon />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? "error" : "primary"}
              variant="outlined"
            />
            <Chip
              label={`${getAnsweredCount()}/${questions.length} Answered`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Question */}
      {currentQuestion && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, lineHeight: 1.6 }}>
            {currentQuestion.question}
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={
                answers[currentQuestion._id] !== undefined
                  ? answers[currentQuestion._id]
                  : ""
              }
              onChange={(e) =>
                handleAnswerChange(
                  currentQuestion._id,
                  parseInt(e.target.value)
                )
              }
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={
                    <Typography variant="body1" sx={{ py: 1 }}>
                      {option}
                    </Typography>
                  }
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    mb: 1,
                    mx: 0,
                    px: 2,
                    "&:hover": {
                      bgcolor: "#f5f5f5",
                    },
                    "&.Mui-checked": {
                      bgcolor: "#e3f2fd",
                      borderColor: "#2196f3",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
      )}

      {/* Navigation */}
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
          disabled={currentQuestionIndex === 0}
          sx={{ borderRadius: 2 }}
        >
          Previous
        </Button>

        <Box sx={{ display: "flex", gap: 2 }}>
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowConfirmDialog(true)}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNextQuestion}
              sx={{ borderRadius: 2 }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Question Navigator */}
      <Paper sx={{ p: 2, mt: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Question Navigator:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={
                currentQuestionIndex === index ? "contained" : "outlined"
              }
              size="small"
              onClick={() => setCurrentQuestionIndex(index)}
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: 1,
                bgcolor:
                  answers[questions[index]._id] !== undefined
                    ? currentQuestionIndex === index
                      ? "primary.main"
                      : "success.light"
                    : currentQuestionIndex === index
                    ? "primary.main"
                    : "transparent",
                color:
                  answers[questions[index]._id] !== undefined &&
                  currentQuestionIndex !== index
                    ? "success.dark"
                    : undefined,
              }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Confirm Submit Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Submit Exam?</DialogTitle>
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
          <Button onClick={() => setShowConfirmDialog(false)}>
            Continue Exam
          </Button>
          <Button
            onClick={handleSubmitExam}
            variant="contained"
            color="success"
          >
            Submit Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrialExam;
