import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Chip,
} from "@mui/material";
import {
  Refresh as RenewIcon,
  Send as SendIcon,
  CloudUpload as UploadIcon,
  AttachFile as AttachIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  CheckCircle,
  FileDownload,
} from "@mui/icons-material";
import axios from "axios";

const LicenseRenewal = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    renewalReason: "",
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Renewal status and license information
  const [renewalStatus, setRenewalStatus] = useState(null);
  const [renewedLicense, setRenewedLicense] = useState(null);
  const [hasApprovedRenewal, setHasApprovedRenewal] = useState(false);
  const [checkingRenewal, setCheckingRenewal] = useState(true);

  // Function to check for approved renewal applications
  const checkRenewalStatus = async () => {
    try {
      setCheckingRenewal(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.warn("No user ID found for renewal check");
        return;
      }

      console.log("🔍 Checking renewal status for user:", userId);

      // Check if user has any renewal applications
      const response = await axios.get(
        `http://localhost:5004/api/renewals/user/${userId}`
      );

      console.log("📋 Renewal applications:", response.data);

      if (response.data && response.data.length > 0) {
        // Sort by submission date (most recent first)
        const sortedRenewals = response.data.sort(
          (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)
        );

        // Get the most recent renewal
        const latestRenewal = sortedRenewals[0];
        setRenewalStatus(latestRenewal);

        // Check if the latest renewal is approved and has a new license issued
        if (latestRenewal.status === "approved" && latestRenewal.newLicenseIssued) {
          console.log("✅ Found approved renewal with new license:", latestRenewal.newLicenseNumber);
          setHasApprovedRenewal(true);

          // Get the renewed license information
          await getRenewedLicense(userId);
        } else {
          console.log("📋 Renewal status:", latestRenewal.status, "License issued:", latestRenewal.newLicenseIssued);
          setHasApprovedRenewal(false);
        }
      } else {
        console.log("📋 No renewal applications found");
        setHasApprovedRenewal(false);
      }
    } catch (error) {
      console.error("Error checking renewal status:", error);
      setHasApprovedRenewal(false);
    } finally {
      setCheckingRenewal(false);
    }
  };

  // Function to get renewed license information
  const getRenewedLicense = async (userId) => {
    try {
      console.log("🔍 Getting renewed license for user:", userId);

      // Try the debug endpoint first
      const response = await axios.get(
        `http://localhost:5004/api/license/debug/user/${userId}`
      );

      console.log("🎫 License response:", response.data);

      if (response.data && response.data.licenseExists) {
        setRenewedLicense({
          number: response.data.licenseNumber,
          status: response.data.licenseStatus,
          class: response.data.licenseClass,
          userName: response.data.userName,
          userEmail: response.data.userEmail,
          issueDate: response.data.issueDate ? new Date(response.data.issueDate).toLocaleDateString() : "N/A",
          expiryDate: response.data.expiryDate ? new Date(response.data.expiryDate).toLocaleDateString() : "N/A",
        });
      }
    } catch (error) {
      console.error("Error getting renewed license:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: "error",
          text: "Please upload a valid image (JPEG, PNG, GIF) or PDF file",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "File size must be less than 10MB",
        });
        return;
      }

      setLicenseFile(file);
      setMessage({ type: "", text: "" });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validate that license file is uploaded
    if (!licenseFile) {
      setMessage({
        type: "error",
        text: "Please upload your current license document",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Submitting license renewal application:", formData);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("renewalReason", formData.renewalReason);
      formDataToSend.append("licenseDocument", licenseFile);

      const response = await axios.post(
        "http://localhost:5004/api/renewals/submit",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "License renewal application submitted successfully! Please wait for admin review.",
        });
        setFormData({
          name: "",
          email: "",
          password: "",
          renewalReason: "",
        });
        setLicenseFile(null);
        setFilePreview(null);
      }
    } catch (error) {
      console.error("Error submitting renewal application:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error submitting renewal application",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check renewal status on component mount
  useEffect(() => {
    checkRenewalStatus();
  }, []);

  // Congratulations component for approved renewal
  const CongratulationsView = () => (
    <Box sx={{ maxWidth: 800, margin: "0 auto", p: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, #4caf50 0%, #81c784 100%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircle sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              🎉 License Renewal Approved!
            </Typography>
            <Typography variant="subtitle1">
              Your license has been successfully renewed
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Congratulations Card */}
      <Card sx={{
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        mb: 3
      }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              🎊
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Your License Has Been Renewed!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Congratulations! Your renewal application has been approved and your new license is ready.
            </Typography>
          </Box>

          <Box sx={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            p: 3,
            backdropFilter: "blur(10px)"
          }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              New License Number: {renewedLicense?.number}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Your renewed license is now active and valid for driving!
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* License Details Card */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "primary.main" }}>
            Your Renewed License Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  License Information
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">License Number:</Typography>
                  <Typography variant="body2" fontWeight="medium">{renewedLicense?.number}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Class:</Typography>
                  <Typography variant="body2" fontWeight="medium">{renewedLicense?.class}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip
                    label={renewedLicense?.status}
                    color="success"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Issue Date:</Typography>
                  <Typography variant="body2" fontWeight="medium">{renewedLicense?.issueDate}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Expiry Date:</Typography>
                  <Typography variant="body2" fontWeight="medium">{renewedLicense?.expiryDate}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Holder Information
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Full Name:</Typography>
                  <Typography variant="body2" fontWeight="medium">{renewedLicense?.userName}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body2" fontWeight="medium">{renewedLicense?.userEmail}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Renewal Status:</Typography>
                  <Chip
                    label="APPROVED"
                    color="success"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownload />}
              onClick={() => {
                // Placeholder for download functionality
                alert("License download feature will be available soon!");
              }}
            >
              Download License
            </Button>
            <Button
              variant="outlined"
              startIcon={<RenewIcon />}
              onClick={() => {
                checkRenewalStatus();
              }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Important Notes:
        </Typography>
        <Typography variant="body2">
          • Your renewed license is now active and valid<br/>
          • The new expiry date extends your license validity by 5 years<br/>
          • Always carry your license while driving<br/>
          • You can download a digital copy of your license above
        </Typography>
      </Alert>
    </Box>
  );

  if (checkingRenewal) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show congratulations view if renewal is approved and license is issued
  if (hasApprovedRenewal && renewedLicense) {
    return <CongratulationsView />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: "linear-gradient(to right, #1976d2, #42a5f5)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <RenewIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              License Renewal
            </Typography>
            <Typography variant="subtitle1">
              Renew your driving license quickly and easily
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Renewal Application Form
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please fill in your details to submit a license renewal application.
              </Typography>

              {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                  {message.text}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Enter your account password for verification"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Current License Document *
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload a clear photo or scan of your current driving license (JPEG, PNG, GIF, or PDF)
                      </Typography>

                      <input
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        id="license-file-upload"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="license-file-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            borderStyle: "dashed",
                            borderWidth: 2,
                            py: 1.5,
                            px: 3,
                            mb: 2,
                          }}
                        >
                          {licenseFile ? "Change License Document" : "Upload License Document"}
                        </Button>
                      </label>

                      {licenseFile && (
                        <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            {licenseFile.type === "application/pdf" ? (
                              <PdfIcon color="error" />
                            ) : (
                              <ImageIcon color="primary" />
                            )}
                            <Typography variant="body2" fontWeight="bold">
                              {licenseFile.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Size: {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>

                          {filePreview && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={filePreview}
                                alt="License preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "200px",
                                  borderRadius: "8px",
                                  border: "1px solid #e0e0e0",
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Renewal Reason</InputLabel>
                      <Select
                        name="renewalReason"
                        value={formData.renewalReason}
                        onChange={handleInputChange}
                        label="Renewal Reason"
                      >
                        <MenuItem value="expiring">License Expiring Soon</MenuItem>
                        <MenuItem value="expired">License Already Expired</MenuItem>
                        <MenuItem value="damaged">License Damaged</MenuItem>
                        <MenuItem value="lost">License Lost/Stolen</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "1.1rem",
                      }}
                    >
                      {loading ? "Submitting..." : "Submit Renewal Application"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Renewal Process
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 1:</strong> Fill out the renewal form with your details
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 2:</strong> Admin will review your application
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 3:</strong> Upon approval, your new license will be issued
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 4:</strong> Download your renewed license
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Required Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Full Name (as on current license)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Email Address (registered with account)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Account Password for verification
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Current License Document (Image or PDF)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Reason for renewal
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LicenseRenewal;
