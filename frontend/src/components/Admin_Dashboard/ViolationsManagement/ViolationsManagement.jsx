import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  Chip,
  Card,
  CardContent,
  Divider,
  useTheme,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Refresh,
  ArrowBack as BackIcon,
  Search as SearchIcon,
  Gavel as ViolationIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

const ViolationsManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get("userId");
  const [violations, setViolations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newViolation, setNewViolation] = useState({
    userId: "",
    violationType: "",
    points: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
  });

  const violationTypes = [
    { value: "Speeding", label: "Speeding", points: 3 },
    { value: "Running Red Light", label: "Running Red Light", points: 4 },
    { value: "Illegal Parking", label: "Illegal Parking", points: 2 },
    { value: "Reckless Driving", label: "Reckless Driving", points: 6 },
    { value: "DUI", label: "Driving Under Influence", points: 12 },
    { value: "No License", label: "Driving Without License", points: 8 },
    { value: "Expired License", label: "Expired License", points: 4 },
    { value: "No Insurance", label: "No Insurance", points: 5 },
    {
      value: "Mobile Phone Use",
      label: "Mobile Phone Use While Driving",
      points: 3,
    },
    { value: "Seatbelt Violation", label: "Seatbelt Violation", points: 2 },
  ];

  useEffect(() => {
    fetchViolations();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId && users.length > 0) {
      const user = users.find((u) => u._id === selectedUserId);
      if (user) {
        setSelectedUser(user);
        setNewViolation((prev) => ({ ...prev, userId: selectedUserId }));
      }
    }
  }, [selectedUserId, users]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5004/api/admin/violations";
      if (selectedUserId) {
        url = `http://localhost:5004/api/admin/violations/user/${selectedUserId}`;
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (selectedUserId) {
        // For user-specific violations, we need to format the data differently
        const userViolations = response.data.map((violation) => ({
          ...violation,
          userId: {
            _id: selectedUserId,
            fullName: selectedUser?.fullName || "Unknown User",
          },
          licenseNumber: "N/A", // Will be populated if needed
        }));
        setViolations(userViolations);
      } else {
        setViolations(response.data);
      }
    } catch (error) {
      console.error("Error fetching violations:", error);
      setSnackbar({
        open: true,
        message: "Error fetching violations",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5004/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddViolation = async () => {
    try {
      if (
        !newViolation.userId ||
        !newViolation.violationType ||
        !newViolation.points
      ) {
        setSnackbar({
          open: true,
          message: "Please fill in all required fields",
          severity: "error",
        });
        return;
      }

      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5004/api/admin/violations",
        newViolation,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: "Violation added successfully",
        severity: "success",
      });

      setOpenAddDialog(false);
      setNewViolation({
        userId: "",
        violationType: "",
        points: "",
        description: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
      });

      fetchViolations();
    } catch (error) {
      console.error("Error adding violation:", error);

      // Get more specific error message
      let errorMessage = "Error adding violation";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "User or license not found";
      } else if (error.response?.status === 400) {
        errorMessage = "Please check all required fields";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleEditViolation = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5004/api/admin/violations/${selectedViolation._id}`,
        selectedViolation,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: "Violation updated successfully",
        severity: "success",
      });

      setOpenEditDialog(false);
      setSelectedViolation(null);
      fetchViolations();
    } catch (error) {
      console.error("Error updating violation:", error);
      setSnackbar({
        open: true,
        message: "Error updating violation",
        severity: "error",
      });
    }
  };

  const handleDeleteViolation = async (violationId) => {
    if (window.confirm("Are you sure you want to delete this violation?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5004/api/admin/violations/${violationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSnackbar({
          open: true,
          message: "Violation deleted successfully",
          severity: "success",
        });

        fetchViolations();
      } catch (error) {
        console.error("Error deleting violation:", error);
        setSnackbar({
          open: true,
          message: "Error deleting violation",
          severity: "error",
        });
      }
    }
  };

  const handleViolationTypeChange = (value, isEdit = false) => {
    const selectedType = violationTypes.find((type) => type.value === value);
    if (isEdit) {
      setSelectedViolation({
        ...selectedViolation,
        type: value,
        points: selectedType ? selectedType.points : selectedViolation.points,
      });
    } else {
      setNewViolation({
        ...newViolation,
        violationType: value,
        points: selectedType ? selectedType.points : "",
      });
    }
  };

  const filteredViolations = violations.filter(
    (violation) =>
      violation.userId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      violation.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (points) => {
    if (points >= 8) return "error";
    if (points >= 4) return "warning";
    return "info";
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate("/admin/dashboard")}
              sx={{ color: "white" }}
            >
              <BackIcon />
            </IconButton>
            <ViolationIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {selectedUser
                  ? `${selectedUser.fullName}'s Violations`
                  : "Violations Management"}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {selectedUser
                  ? `Manage violations for ${selectedUser.fullName}`
                  : "Manage traffic violations and demerit points"}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddDialog(true)}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
            }}
          >
            Add Violation
          </Button>
        </Box>
      </Paper>

      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold">
              All Violations ({filteredViolations.length})
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
              <IconButton onClick={fetchViolations} color="primary">
                <Refresh />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>User</strong>
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
                      <strong>Recorded By</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredViolations.map((violation) => (
                    <TableRow key={violation._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {violation.userId?.fullName || "Unknown User"}
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
                            {violation.date && !isNaN(new Date(violation.date))
                              ? format(new Date(violation.date), "MMM dd, yyyy")
                              : "Invalid date"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {violation.recordedBy?.fullName || "System"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Violation">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedViolation(violation);
                                setOpenEditDialog(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Violation">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteViolation(violation._id)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredViolations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No violations found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Violation Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <ViolationIcon color="primary" />
            <Typography variant="h6">Add New Violation</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={newViolation.userId}
                  onChange={(e) =>
                    setNewViolation({ ...newViolation, userId: e.target.value })
                  }
                  label="Select User"
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.fullName} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Violation Type</InputLabel>
                <Select
                  value={newViolation.violationType}
                  onChange={(e) => handleViolationTypeChange(e.target.value)}
                  label="Violation Type"
                >
                  {violationTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label} ({type.points} pts)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Demerit Points"
                type="number"
                value={newViolation.points}
                onChange={(e) =>
                  setNewViolation({
                    ...newViolation,
                    points: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Date"
                type="date"
                value={newViolation.date}
                onChange={(e) =>
                  setNewViolation({ ...newViolation, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newViolation.location}
                onChange={(e) =>
                  setNewViolation({ ...newViolation, location: e.target.value })
                }
                placeholder="e.g., Main Street, Downtown"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newViolation.description}
                onChange={(e) =>
                  setNewViolation({
                    ...newViolation,
                    description: e.target.value,
                  })
                }
                placeholder="Additional details about the violation..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddViolation}>
            Add Violation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Violation Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Edit color="primary" />
            <Typography variant="h6">Edit Violation</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedViolation && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Violation Type</InputLabel>
                  <Select
                    value={selectedViolation.type}
                    onChange={(e) =>
                      handleViolationTypeChange(e.target.value, true)
                    }
                    label="Violation Type"
                  >
                    {violationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label} ({type.points} pts)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Demerit Points"
                  type="number"
                  value={selectedViolation.points}
                  onChange={(e) =>
                    setSelectedViolation({
                      ...selectedViolation,
                      points: parseInt(e.target.value),
                    })
                  }
                  inputProps={{ min: 1, max: 12 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Date"
                  type="date"
                  value={
                    selectedViolation.date
                      ? selectedViolation.date.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedViolation({
                      ...selectedViolation,
                      date: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={selectedViolation.location || ""}
                  onChange={(e) =>
                    setSelectedViolation({
                      ...selectedViolation,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g., Main Street, Downtown"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={selectedViolation.description || ""}
                  onChange={(e) =>
                    setSelectedViolation({
                      ...selectedViolation,
                      description: e.target.value,
                    })
                  }
                  placeholder="Additional details about the violation..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditViolation}>
            Update Violation
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ViolationsManagement;
