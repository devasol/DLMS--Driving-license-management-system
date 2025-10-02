import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Quiz as QuizIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Language as LanguageIcon,
  Timer as TimerIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const TheoryExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [editForm, setEditForm] = useState({
    score: "",
    passed: false,
    correctAnswers: "",
    totalQuestions: "",
    timeSpent: "",
  });

  useEffect(() => {
    fetchTheoryExamResults();
  }, []);

  const fetchTheoryExamResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/exams/results");

      // Filter only theory exam results
      const theoryResults = response.data.filter(
        (result) => result.examType === "theory"
      );
      setResults(theoryResults);
    } catch (error) {
      console.error("Error fetching theory exam results:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.userId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "passed" && result.passed) ||
      (filterStatus === "failed" && !result.passed) ||
      (filterStatus === "cancelled" && result.cancelled);

    const matchesLanguage =
      filterLanguage === "all" || result.language === filterLanguage;

    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusChip = (result) => {
    if (result.cancelled) {
      return <Chip label="Cancelled" color="warning" size="small" />;
    }
    return (
      <Chip
        label={result.passed ? "Passed" : "Failed"}
        color={result.passed ? "success" : "error"}
        size="small"
        icon={result.passed ? <PassIcon /> : <FailIcon />}
      />
    );
  };

  const getLanguageChip = (language) => {
    return (
      <Chip
        label={language === "english" ? "🇺🇸 English" : "🇪🇹 አማርኛ"}
        size="small"
        variant="outlined"
      />
    );
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailDialog(true);
  };

  const handleEditResult = (result) => {
    setEditingResult(result);
    setEditForm({
      score: result.score || 0,
      passed: result.passed || false,
      correctAnswers: result.correctAnswers || 0,
      totalQuestions: result.totalQuestions || 10,
      timeSpent: result.timeSpent || 0,
    });
    setShowEditDialog(true);
  };

  const handleDeleteResult = (result) => {
    setSelectedResult(result);
    setShowDeleteDialog(true);
  };

  const handleUpdateResult = async () => {
    try {
      const response = await axios.put(
        `/api/exams/results/${editingResult._id}`,
        editForm
      );

      if (response.data.success) {
        // Update the result in the local state
        setResults((prev) =>
          prev.map((result) =>
            result._id === editingResult._id
              ? { ...result, ...editForm }
              : result
          )
        );
        setShowEditDialog(false);
        setEditingResult(null);
        alert("Exam result updated successfully!");
      }
    } catch (error) {
      console.error("Error updating exam result:", error);
      alert(
        "Failed to update exam result: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/exams/results/${selectedResult._id}`
      );

      if (response.data.success) {
        // Remove the result from local state
        setResults((prev) =>
          prev.filter((result) => result._id !== selectedResult._id)
        );
        setShowDeleteDialog(false);
        setSelectedResult(null);
        alert("Exam result deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting exam result:", error);
      alert(
        "Failed to delete exam result: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const getStatistics = () => {
    const total = results.length;
    const passed = results.filter((r) => r.passed && !r.cancelled).length;
    const failed = results.filter((r) => !r.passed && !r.cancelled).length;
    const cancelled = results.filter((r) => r.cancelled).length;
    const english = results.filter((r) => r.language === "english").length;
    const amharic = results.filter((r) => r.language === "amharic").length;

    return { total, passed, failed, cancelled, english, amharic };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📚 Theory Exam Results
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <QuizIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Exams
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <PassIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.passed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Passed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <FailIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.cancelled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cancelled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                🇺🇸 English: {stats.english}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🇪🇹 አማርኛ: {stats.amharic}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.total > 0
                  ? Math.round((stats.passed / stats.total) * 100)
                  : 0}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pass Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="passed">Passed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={filterLanguage}
                label="Language"
                onChange={(e) => setFilterLanguage(e.target.value)}
              >
                <MenuItem value="all">All Languages</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="amharic">አማርኛ (Amharic)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchTheoryExamResults}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <Alert severity="info">
          No theory exam results found matching your criteria.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Date Taken</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time Spent</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {result.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {result.userId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {result.dateTaken && !isNaN(new Date(result.dateTaken))
                      ? format(new Date(result.dateTaken), "PPp")
                      : "Invalid date"}
                  </TableCell>
                  <TableCell>{getLanguageChip(result.language)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={result.passed ? "success.main" : "error.main"}
                    >
                      {result.score}%
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(result)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TimerIcon sx={{ fontSize: 16 }} />
                      {result.timeSpent || 0} min
                    </Box>
                  </TableCell>
                  <TableCell>
                    {result.correctAnswers || 0} / {result.totalQuestions || 50}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(result)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditResult(result)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteResult(result)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Theory Exam Result Details</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User Information
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {selectedResult.userName}
                </Typography>
                <Typography variant="body1">
                  <strong>User ID:</strong> {selectedResult.userId}
                </Typography>
                <Typography variant="body1">
                  <strong>Date Taken:</strong>{" "}
                  {format(new Date(selectedResult.dateTaken), "PPp")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Exam Details
                </Typography>
                <Typography variant="body1">
                  <strong>Language:</strong>{" "}
                  {selectedResult.language === "english"
                    ? "English"
                    : "አማርኛ (Amharic)"}
                </Typography>
                <Typography variant="body1">
                  <strong>Time Spent:</strong> {selectedResult.timeSpent || 0}{" "}
                  minutes
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong>{" "}
                  {selectedResult.cancelled
                    ? "Cancelled"
                    : selectedResult.passed
                    ? "Passed"
                    : "Failed"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Results
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={selectedResult.passed ? "success.main" : "error.main"}
                >
                  {selectedResult.score}%
                </Typography>
                <Typography variant="body1">
                  <strong>Correct Answers:</strong>{" "}
                  {selectedResult.correctAnswers || 0} out of{" "}
                  {selectedResult.totalQuestions || 50}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passing score: 74%
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Exam Result</DialogTitle>
        <DialogContent>
          {editingResult && (
            <Box sx={{ pt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Editing result for: {editingResult.userName}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Score (%)"
                    type="number"
                    value={editForm.score}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        score: parseInt(e.target.value) || 0,
                        passed: parseInt(e.target.value) >= 74,
                      }))
                    }
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time Spent (minutes)"
                    type="number"
                    value={editForm.timeSpent}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        timeSpent: parseInt(e.target.value) || 0,
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Correct Answers"
                    type="number"
                    value={editForm.correctAnswers}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        correctAnswers: parseInt(e.target.value) || 0,
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Questions"
                    type="number"
                    value={editForm.totalQuestions}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        totalQuestions: parseInt(e.target.value) || 10,
                      }))
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Status: {editForm.passed ? "✅ Passed" : "❌ Failed"}
                    {editForm.score >= 74 ? " (Score ≥ 74%)" : " (Score < 74%)"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateResult}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete this exam result?
              </Typography>
              <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>User:</strong> {selectedResult.userName}
                </Typography>
                <Typography variant="body2">
                  <strong>Score:</strong> {selectedResult.score}%
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {format(new Date(selectedResult.dateTaken), "PPp")}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong>{" "}
                  {selectedResult.passed ? "Passed" : "Failed"}
                </Typography>
              </Box>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                ⚠️ This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Result
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TheoryExamResults;
