import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  LocationOn as LocationIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";

const ViolationHistory = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/api/traffic-police/violations/my-records",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setViolations(response.data);
    } catch (error) {
      console.error("Error fetching violations:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError("Error fetching violation history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (points) => {
    if (points >= 8) return "error";
    if (points >= 4) return "warning";
    return "info";
  };

  const filteredViolations = violations.filter(
    (violation) =>
      violation.userId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      violation.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.licenseNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      violation.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: "info.main" }}>
              <HistoryIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              My Violation Records
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            View all violations you have recorded as a traffic police officer
          </Typography>
        </Paper>
      </motion.div>

      {/* Search and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight="bold">
                Violation Records ({filteredViolations.length})
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search violations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 300 }}
                />
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchViolations} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Divider />
          </CardContent>
        </Card>
      </motion.div>

      {/* Violations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredViolations.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Driver</strong>
                      </TableCell>
                      <TableCell>
                        <strong>License #</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Violation Type</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Points</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Location</strong>
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
                    {filteredViolations.map((violation, index) => (
                      <TableRow key={violation._id || index} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon color="action" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {violation.userId?.fullName || "Unknown Driver"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {violation.userId?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {violation.licenseNumber || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={violation.type}
                            color={getSeverityColor(violation.points)}
                            size="small"
                            icon={<WarningIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${violation.points} pts`}
                            color={getSeverityColor(violation.points)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {violation.location || "Not specified"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <DateIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {violation.date &&
                              !isNaN(new Date(violation.date))
                                ? format(
                                    new Date(violation.date),
                                    "MMM dd, yyyy"
                                  )
                                : "Invalid date"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                {searchTerm
                  ? `No violations found matching "${searchTerm}"`
                  : "No violations recorded yet. Start by searching for a license and adding violations."}
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ViolationHistory;
