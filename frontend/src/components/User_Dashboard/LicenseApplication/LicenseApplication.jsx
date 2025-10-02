import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import { Upload, Description, Delete } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const steps = [
  "Personal Information",
  "Address Details",
  "Required Documents",
  "Review & Submit",
];

const requiredDocuments = [
  {
    id: "drivingSchoolCertificate",
    name: "Training Completion Certificate",
    description:
      "Certificate from an accredited driving school certified under national standards",
    required: true,
  },
  {
    id: "nationalId",
    name: "National ID or Passport",
    description:
      "Ethiopian national ID for citizens or valid passport with residence permit for foreigners",
    required: true,
  },
  {
    id: "medicalCertificate",
    name: "Medical Fitness Certificate",
    description:
      "Mandatory health examination including vision test, blood type, and color-vision screening",
    required: true,
  },
  {
    id: "personalId",
    name: "Passport-size Photographs",
    description: "Recent passport-size photographs as per requirements",
    required: true,
  },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}));

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  marginBottom: theme.spacing(2),
  "&.MuiAlert-standardSuccess": {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    "& .MuiAlert-icon": {
      color: "#2e7d32",
    },
  },
  "&.MuiAlert-standardError": {
    backgroundColor: "#ffebee",
    color: "#c62828",
    "& .MuiAlert-icon": {
      color: "#c62828",
    },
  },
  "&.MuiAlert-standardWarning": {
    backgroundColor: "#fff3e0",
    color: "#ef6c00",
    "& .MuiAlert-icon": {
      color: "#ef6c00",
    },
  },
  "&.MuiAlert-standardInfo": {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    "& .MuiAlert-icon": {
      color: "#1565c0",
    },
  },
}));

const LicenseApplication = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [documentDescription, setDocumentDescription] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    bloodGroup: "",
    phoneNumber: "",
    email: "",

    // Address Details
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",

    // Document Details
    documents: {
      drivingSchoolCertificate: null,
      nationalId: null,
      personalId: null,
      medicalCertificate: null,
    },

    // Additional Information
    licenseType: "",
    previousLicense: "",
    drivingExperience: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const newDocuments = Array.from(files).map((file) => ({
        file,
        description: formData.documentDescriptions[file.name] || "",
      }));

      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments],
      }));
    }
  };

  const handleDocumentDescription = (fileName, description) => {
    setFormData((prev) => ({
      ...prev,
      documentDescriptions: {
        ...prev.documentDescriptions,
        [fileName]: description,
      },
    }));
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentUpload = (documentType, event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file,
        },
      }));

      // Clear any errors for this document type
      if (errors[documentType]) {
        setErrors((prev) => ({
          ...prev,
          [documentType]: "",
        }));
      }
    }
  };

  const removeDocumentFile = (documentType) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: null,
      },
    }));
  };

  const handleDescriptionChange = (event) => {
    setDocumentDescription(event.target.value);
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName) newErrors.firstName = "First name is required";
        if (!formData.lastName) newErrors.lastName = "Last name is required";
        if (!formData.dateOfBirth)
          newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.nationality)
          newErrors.nationality = "Nationality is required";
        if (!formData.phoneNumber)
          newErrors.phoneNumber = "Phone number is required";
        if (!formData.email) newErrors.email = "Email is required";
        break;

      case 1: // Address Details
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.postalCode)
          newErrors.postalCode = "Postal code is required";
        if (!formData.country) newErrors.country = "Country is required";
        break;

      case 2: // Document Upload
        // Check required documents
        requiredDocuments.forEach((doc) => {
          if (doc.required && !formData.documents[doc.id]) {
            newErrors[doc.id] = `${doc.name} is required`;
          }
        });
        break;

      case 3: // Review & Submit
        if (!formData.licenseType)
          newErrors.licenseType = "License type is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // Clear any previous errors
    setError("");

    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector(
          '.MuiFormHelperText-root.Mui-error, .MuiTypography-caption[color="error"]'
        );
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "documents") {
          // Handle file uploads
          Object.keys(formData.documents).forEach((docType) => {
            if (formData.documents[docType]) {
              formDataToSend.append(
                `documents[${docType}]`,
                formData.documents[docType]
              );
            }
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append("userId", userId);

      const response = await axios.post(
        "/api/license/applications",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess(
          "License application submitted successfully! Redirecting to dashboard..."
        );

        // Add notification for successful application
        await axios.post(
          "https://dlms-driving-license-management-system-v1.onrender.com/api/notifications",
          {
            user_id: userId,
            title: "License Application Submitted",
            message:
              "Your driving license application has been submitted successfully. We will review it shortly.",
            type: "success",
          }
        );

        // Reset form after successful submission
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          nationality: "",
          bloodGroup: "",
          phoneNumber: "",
          email: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          documents: {
            drivingSchoolCertificate: null,
            nationalId: null,
            personalId: null,
            medicalCertificate: null,
          },
          licenseType: "",
          previousLicense: "",
          drivingExperience: "",
        });
        setUploadedDocuments([]);
        setActiveStep(0);

        // Dispatch custom event for license registration
        window.dispatchEvent(new CustomEvent("license-registered"));

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        throw new Error(
          response.data.message || "Failed to submit application"
        );
      }
    } catch (err) {
      console.error("Submission error:", err);

      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle field-specific errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const fieldErrors = {};
          errorData.errors.forEach((error) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);

          // Set general error message
          if (errorData.missingFields) {
            setError(
              `Missing required fields: ${errorData.missingFields.join(", ")}`
            );
          } else if (errorData.missingDocuments) {
            setError(
              `Missing required documents: ${errorData.missingDocuments
                .map((doc) =>
                  doc
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                )
                .join(", ")}`
            );
          } else {
            setError(errorData.message || "Please fix the errors below");
          }
        } else {
          setError(errorData.message || "Error submitting application");
        }
      } else {
        setError(
          err.message ||
            "Network error. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                error={!!errors.nationality}
                helperText={errors.nationality}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.bloodGroup}>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  label="Blood Group"
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={!!errors.state}
                helperText={errors.state}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                error={!!errors.postalCode}
                helperText={errors.postalCode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={!!errors.country}
                helperText={errors.country}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Required Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please upload all required documents for your license
                application. Accepted formats: PDF, JPG, JPEG, PNG (Max size:
                5MB each)
              </Typography>
            </Grid>

            {requiredDocuments.map((doc) => (
              <Grid item xs={12} md={6} key={doc.id}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    border: errors[doc.id]
                      ? "2px solid #f44336"
                      : "1px solid #e0e0e0",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", flex: 1 }}
                    >
                      {doc.name}
                      {doc.required && (
                        <span style={{ color: "#f44336" }}> *</span>
                      )}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {doc.description}
                  </Typography>

                  {formData.documents[doc.id] ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        bgcolor: "#e8f5e9",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <Description color="success" sx={{ mr: 1 }} />
                      <Typography
                        variant="body2"
                        sx={{ flex: 1, color: "#2e7d32" }}
                      >
                        {formData.documents[doc.id].name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeDocumentFile(doc.id)}
                        sx={{ color: "#f44336" }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Upload {doc.name}
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleDocumentUpload(doc.id, e)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </Button>
                  )}

                  {errors[doc.id] && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {errors[doc.id]}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Your Application
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.licenseType}>
                <InputLabel>License Type</InputLabel>
                <Select
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  label="License Type"
                >
                  <MenuItem value="Category1">
                    Category 1 - Motorcycle License
                  </MenuItem>
                  <MenuItem value="Category2">
                    Category 2 - Three-Wheel Motorcycle
                  </MenuItem>
                  <MenuItem value="Category3">
                    Category 3 - Automobile License
                  </MenuItem>
                  <MenuItem value="Category4-PublicI">
                    Category 4 Public I - Up to 20 seats
                  </MenuItem>
                  <MenuItem value="Category4-PublicII">
                    Category 4 Public II - Up to 45 seats
                  </MenuItem>
                  <MenuItem value="Category4-PublicIII">
                    Category 4 Public III - Beyond 45 seats
                  </MenuItem>
                  <MenuItem value="Category5-TruckI">
                    Category 5 Truck I - Up to 3,500 kg
                  </MenuItem>
                  <MenuItem value="Category5-TruckII">
                    Category 5 Truck II - Without trailers/with crane
                  </MenuItem>
                  <MenuItem value="Category5-TruckIII">
                    Category 5 Truck III - With/without trailers
                  </MenuItem>
                  <MenuItem value="Category6-FuelI">
                    Category 6 Fuel I - Up to 18,000 liters
                  </MenuItem>
                  <MenuItem value="Category6-FuelII">
                    Category 6 Fuel II - Liquid-tank vehicles
                  </MenuItem>
                  <MenuItem value="Category7">
                    Category 7 - Machinery Operator
                  </MenuItem>
                </Select>
                {errors.licenseType && (
                  <FormHelperText>{errors.licenseType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Previous License Number (if any)"
                name="previousLicense"
                value={formData.previousLicense}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driving Experience (in years)"
                name="drivingExperience"
                type="number"
                value={formData.drivingExperience}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Please review all the information before submitting:
              </Typography>
              <ul>
                <li>All personal information is correct</li>
                <li>Address details are accurate</li>
                <li>All required documents are uploaded</li>
                <li>License type is selected correctly</li>
              </ul>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: 3 }}>
      <StyledPaper>
        <Typography variant="h4" gutterBottom align="center">
          Driving License Application
        </Typography>

        {success && (
          <StyledAlert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{
              "& .MuiAlert-message": {
                color: "#2e7d32",
                fontWeight: 500,
              },
            }}
          >
            {success}
          </StyledAlert>
        )}

        {!success && (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <StyledAlert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  "& .MuiAlert-message": {
                    color: "#c62828",
                    fontWeight: 500,
                  },
                }}
              >
                {error}
              </StyledAlert>
            )}

            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Application Status Section */}
        {success && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: "#e8f5e9",
                border: "1px solid #a5d6a7",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "#2e7d32", fontWeight: 500 }}
              >
                Status: <strong>Pending Review</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#2e7d32" }}>
                Your application has been submitted and is waiting for admin
                review. You will be notified once the status changes.
              </Typography>
            </Paper>
          </Box>
        )}
      </StyledPaper>
    </Box>
  );
};

export default LicenseApplication;
