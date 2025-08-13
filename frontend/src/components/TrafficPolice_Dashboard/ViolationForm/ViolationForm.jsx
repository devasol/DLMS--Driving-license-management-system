import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";

const ViolationForm = ({ onSuccess }) => {
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [violationData, setViolationData] = useState({
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
    { value: "Mobile Phone Use", label: "Mobile Phone Use While Driving", points: 3 },
    { value: "Seatbelt Violation", label: "Seatbelt Violation", points: 2 },
    { value: "Wrong Way Driving", label: "Wrong Way Driving", points: 5 },
    { value: "Overtaking Violation", label: "Illegal Overtaking", points: 4 },
    { value: "Lane Violation", label: "Lane Violation", points: 2 },
    { value: "Signal Violation", label: "Signal Violation", points: 3 },
    { value: "Pedestrian Violation", label: "Pedestrian Right of Way Violation", points: 4 },
  ];

  useEffect(() => {
    // Get selected license from localStorage
    const licenseData = localStorage.getItem("selectedLicense");
    if (licenseData) {
      setSelectedLicense(JSON.parse(licenseData));
    }
  }, []);

  const handleViolationTypeChange = (value) => {
    const selectedType = violationTypes.find((type) => type.value === value);
    setViolationData({
      ...violationData,
      violationType: value,
      points: selectedType ? selectedType.points : "",
    });
  };

  const handleSubmit = async () => {
    if (!selectedLicense) {
      setSnackbar({
        open: true,
        message: "No license selected. Please search for a license first.",
        severity: "error",
      });
      return;
    }

    if (!violationData.violationType || !violationData.points || !violationData.location) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields.",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5004/api/traffic-police/violations",
        {
          userId: selectedLicense.userId,
          licenseNumber: selectedLicense.number,
          violationType: violationData.violationType,
          points: violationData.points,
          description: violationData.description,
          location: violationData.location,
          date: violationData.date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: "Violation recorded successfully!",
        severity: "success",
      });

      // Reset form
      setViolationData({
        violationType: "",
        points: "",
        description: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Clear selected license
      localStorage.removeItem("selectedLicense");
      setSelectedLicense(null);

      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error("Error recording violation:", error);
      let errorMessage = "Error recording violation. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 404) {
        errorMessage = "User or license not found.";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setViolationData({
      violationType: "",
      points: "",
      description: "",
      location: "",
      date: new Date().toISOString().split("T")[0],
    });
    localStorage.removeItem("selectedLicense");
    setSelectedLicense(null);
  };

  const getSeverityColor = (points) => {
    if (points >= 8) return "error";
    if (points >= 4) return "warning";
    return "info";
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: "warning.main" }}>
              <AddIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              Record Traffic Violation
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Add a new traffic violation to the selected driver's record
          </Typography>
        </Paper>
      </motion.div>

      {selectedLicense ? (
        <Grid container spacing={3}>
          {/* Selected License Info */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Selected License
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Driver Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedLicense.userName}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      License Number
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {selectedLicense.number}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Points
                    </Typography>
                    <Chip
                      label={`${selectedLicense.points}/${selectedLicense.maxPoints}`}
                      color={getSeverityColor(selectedLicense.points)}
                      size="small"
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      License Status
                    </Typography>
                    <Chip
                      label={selectedLicense.status}
                      color={selectedLicense.status === "Valid" ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Violation Form */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <WarningIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Violation Details
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Violation Type</InputLabel>
                        <Select
                          value={violationData.violationType}
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
                        value={violationData.points}
                        onChange={(e) =>
                          setViolationData({
                            ...violationData,
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
                        label="Location"
                        value={violationData.location}
                        onChange={(e) =>
                          setViolationData({
                            ...violationData,
                            location: e.target.value,
                          })
                        }
                        placeholder="e.g., Bole Road, near Stadium"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Date"
                        type="date"
                        value={violationData.date}
                        onChange={(e) =>
                          setViolationData({
                            ...violationData,
                            date: e.target.value,
                          })
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description (Optional)"
                        value={violationData.description}
                        onChange={(e) =>
                          setViolationData({
                            ...violationData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Additional details about the violation..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleSubmit}
                          disabled={loading}
                          color="warning"
                        >
                          {loading ? "Recording..." : "Record Violation"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Alert severity="info" sx={{ mt: 2 }}>
            No license selected. Please search for a license first using the License Search feature.
          </Alert>
        </motion.div>
      )}

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
    </Box>
  );
};

export default ViolationForm;
