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
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Quiz as QuizIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import axios from "axios";
import { API_BASE } from "../../../config/api";

const AdminTrialResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/trial/admin/results");
      if (response.data.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = async (resultId) => {
    try {
      const response = await axios.get(`${API_BASE}/trial/admin/results/${resultId}`);
      if (response.data.success) {
        setSelectedResult(response.data.result);
        setOpenDialog(true);
      }
    } catch (error) {
      console.error("Error fetching result details:", error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

  const getResultColor = (result) => {
    return result === "Pass" ? "success" : "error";
  };

  const getStats = () => {
    const totalResults = results.length;
    const passedResults = results.filter((r) => r.result === "Pass").length;
    const failedResults = results.filter((r) => r.result === "Fail").length;
    const averageScore =
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + r.percentage, 0) / results.length
          )
        : 0;

    return { totalResults, passedResults, failedResults, averageScore };
  };

  const stats = getStats();
  const filteredResults =
    tabValue === 0
      ? results
      : tabValue === 1
      ? results.filter((r) => r.result === "Pass")
      : results.filter((r) => r.result === "Fail");

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Trial Exam Results
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <QuizIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalResults}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Attempts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <PassIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.passedResults}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Passed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <FailIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.failedResults}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <TrendingUpIcon
                sx={{ fontSize: 40, color: "info.main", mb: 1 }}
              />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.averageScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`All Results (${stats.totalResults})`} />
          <Tab label={`Passed (${stats.passedResults})`} />
          <Tab label={`Failed (${stats.failedResults})`} />
        </Tabs>

        {/* Results Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>
                  <strong>User</strong>
                </TableCell>
                <TableCell>
                  <strong>Score</strong>
                </TableCell>
                <TableCell>
                  <strong>Result</strong>
                </TableCell>
                <TableCell>
                  <strong>Questions</strong>
                </TableCell>
                <TableCell>
                  <strong>Time Taken</strong>
                </TableCell>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                    Loading results...
                  </TableCell>
                </TableRow>
              ) : filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => (
                  <TableRow key={result._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={
                            result.userId?.profilePicture
                              ? `${API_BASE}/users/profile-picture/${result.userId.profilePicture}`
                              : undefined
                          }
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          {result.userName?.charAt(0) || "U"}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">
                            {result.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Attempt #{result.attempt}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" fontWeight="bold">
                        {result.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.correctAnswers}/{result.totalQuestions}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.result}
                        color={getResultColor(result.result)}
                        icon={
                          result.result === "Pass" ? <PassIcon /> : <FailIcon />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.totalQuestions} questions
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Math.floor(result.totalTimeSpent / 60)}m{" "}
                        {result.totalTimeSpent % 60}s
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(result.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewResult(result._id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Result Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Trial Exam Result Details</Typography>
            {selectedResult && (
              <Chip
                label={selectedResult.result}
                color={getResultColor(selectedResult.result)}
                icon={
                  selectedResult.result === "Pass" ? <PassIcon /> : <FailIcon />
                }
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              {/* User Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                      src={
                        selectedResult.userId?.profilePicture
                          ? `${API_BASE}/users/profile-picture/${selectedResult.userId.profilePicture}`
                          : undefined
                      }
                      sx={{ mr: 2, width: 60, height: 60 }}
                    >
                      {selectedResult.userName?.charAt(0) || "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedResult.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedResult.userId?.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Attempt #{selectedResult.attempt} •{" "}
                        {new Date(selectedResult.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Score Summary */}
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color={
                            getResultColor(selectedResult.result) + ".main"
                          }
                        >
                          {selectedResult.percentage}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Final Score
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="success.main"
                        >
                          {selectedResult.correctAnswers}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Correct
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="error.main"
                        >
                          {selectedResult.wrongAnswers}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Wrong
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" fontWeight="bold">
                          {Math.floor(selectedResult.totalTimeSpent / 60)}m
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Time Taken
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Questions Review */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Question by Question Review
              </Typography>

              {selectedResult.questions?.map((q, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <Chip
                        label={`Q${index + 1}`}
                        size="small"
                        sx={{ mr: 2, mt: 0.5 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {q.question}
                        </Typography>

                        <Grid container spacing={1}>
                          {q.options?.map((option, optIndex) => (
                            <Grid item xs={12} key={optIndex}>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor:
                                    optIndex === q.correctAnswer
                                      ? "success.main"
                                      : optIndex === q.userAnswer &&
                                        !q.isCorrect
                                      ? "error.main"
                                      : "grey.300",
                                  bgcolor:
                                    optIndex === q.correctAnswer
                                      ? "success.light"
                                      : optIndex === q.userAnswer &&
                                        !q.isCorrect
                                      ? "error.light"
                                      : "transparent",
                                }}
                              >
                                <Typography variant="body2">
                                  {optIndex === q.correctAnswer && "✓ "}
                                  {optIndex === q.userAnswer &&
                                    !q.isCorrect &&
                                    "✗ "}
                                  {option}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Chip
                            label={q.isCorrect ? "Correct" : "Wrong"}
                            color={q.isCorrect ? "success" : "error"}
                            size="small"
                          />
                          {q.userAnswer === -1 && (
                            <Chip
                              label="Not Answered"
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTrialResults;
