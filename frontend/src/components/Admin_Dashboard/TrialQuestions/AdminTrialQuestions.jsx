import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Fab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import axios from "axios";

const AdminTrialQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "General Knowledge",
    difficulty: "Medium",
    explanation: "",
    tags: "",
  });

  const categories = [
    "Traffic Rules",
    "Road Signs",
    "Safety",
    "Vehicle Knowledge",
    "Emergency Procedures",
    "General Knowledge",
  ];

  const difficulties = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/trial/admin/questions");
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      showSnackbar("Error fetching questions", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
        explanation: question.explanation || "",
        tags: question.tags?.join(", ") || "",
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "General Knowledge",
        difficulty: "Medium",
        explanation: "",
        tags: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, ""],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer:
          formData.correctAnswer >= newOptions.length
            ? 0
            : formData.correctAnswer,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.question.trim()) {
        showSnackbar("Question is required", "error");
        return;
      }

      const validOptions = formData.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        showSnackbar("At least 2 options are required", "error");
        return;
      }

      if (formData.correctAnswer >= validOptions.length) {
        showSnackbar("Please select a valid correct answer", "error");
        return;
      }

      const questionData = {
        question: formData.question.trim(),
        options: validOptions,
        correctAnswer: formData.correctAnswer,
        category: formData.category,
        difficulty: formData.difficulty,
        explanation: formData.explanation.trim(),
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
        createdBy: localStorage.getItem("userId") || "admin",
      };

      let response;
      if (editingQuestion) {
        response = await axios.put(
          `/api/trial/admin/questions/${editingQuestion._id}`,
          questionData
        );
      } else {
        response = await axios.post("/api/trial/admin/questions", questionData);
      }

      if (response.data.success) {
        showSnackbar(
          editingQuestion
            ? "Question updated successfully"
            : "Question created successfully"
        );
        fetchQuestions();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error saving question:", error);
      showSnackbar(
        error.response?.data?.message || "Error saving question",
        "error"
      );
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await axios.delete(
          `/api/trial/admin/questions/${questionId}`
        );
        if (response.data.success) {
          showSnackbar("Question deleted successfully");
          fetchQuestions();
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        showSnackbar("Error deleting question", "error");
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "success";
      case "Medium":
        return "warning";
      case "Hard":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Trial Questions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Question
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <QuizIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {questions.filter((q) => q.difficulty === "Easy").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Easy Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {questions.filter((q) => q.difficulty === "Medium").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medium Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {questions.filter((q) => q.difficulty === "Hard").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hard Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Questions Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>
                  <strong>Question</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell>
                  <strong>Difficulty</strong>
                </TableCell>
                <TableCell>
                  <strong>Options</strong>
                </TableCell>
                <TableCell>
                  <strong>Created</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                    Loading questions...
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                    No questions found. Add your first question!
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question._id} hover>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap>
                        {question.question}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={question.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={question.difficulty}
                        size="small"
                        color={getDifficultyColor(question.difficulty)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {question.options.length} options
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(question)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(question._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Question Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add New Question"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question"
                multiline
                rows={3}
                value={formData.question}
                onChange={(e) => handleInputChange("question", e.target.value)}
                placeholder="Enter your question here..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  handleInputChange("difficulty", e.target.value)
                }
              >
                {difficulties.map((difficulty) => (
                  <MenuItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Answer Options
              </Typography>
              {formData.options.map((option, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <TextField
                    fullWidth
                    label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant={
                      formData.correctAnswer === index
                        ? "contained"
                        : "outlined"
                    }
                    color={
                      formData.correctAnswer === index ? "success" : "default"
                    }
                    onClick={() => handleInputChange("correctAnswer", index)}
                    sx={{ mr: 1, minWidth: 80 }}
                  >
                    {formData.correctAnswer === index ? "Correct" : "Mark"}
                  </Button>
                  {formData.options.length > 2 && (
                    <IconButton
                      color="error"
                      onClick={() => removeOption(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {formData.options.length < 6 && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addOption}
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Explanation (Optional)"
                multiline
                rows={2}
                value={formData.explanation}
                onChange={(e) =>
                  handleInputChange("explanation", e.target.value)
                }
                placeholder="Explain why this is the correct answer..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (Optional)"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="Enter tags separated by commas (e.g., traffic, signs, safety)"
                helperText="Tags help categorize and search questions"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingQuestion ? "Update" : "Create"} Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTrialQuestions;
