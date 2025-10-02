import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import axios from "axios";

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/admin/exams");
        setExams(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Using mock data (database connection issue)");

        // Use mock data when database connection fails
        const mockExams = [
          {
            _id: "1",
            title: "Written Test - Class B",
            date: new Date(),
            location: "Test Center A",
            status: "scheduled",
          },
          {
            _id: "2",
            title: "Practical Test - Class A",
            date: new Date(Date.now() + 86400000), // Tomorrow
            location: "Test Center B",
            status: "completed",
          },
        ];

        setExams(mockExams);
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const getStatusChip = (status) => {
    let color = "default";
    switch (status) {
      case "scheduled":
        color = "primary";
        break;
      case "completed":
        color = "success";
        break;
      case "cancelled":
        color = "error";
        break;
      case "no-show":
        color = "warning";
        break;
      default:
        color = "default";
    }
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Exams
      </Typography>
      <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          sx={{ alignSelf: "flex-end", mb: 2 }}
        >
          Schedule New Exam
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exam Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : exams && exams.length > 0 ? (
                exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>
                      {new Date(exam.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{exam.location}</TableCell>
                    <TableCell>{getStatusChip(exam.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small">
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No exams found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminExams;
