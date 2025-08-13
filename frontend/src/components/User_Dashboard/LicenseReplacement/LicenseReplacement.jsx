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
  Divider,
  FormHelperText,
} from "@mui/material";
import {
  FindReplace as ReplaceIcon,
  Send as SendIcon,
  CloudUpload as UploadIcon,
  AttachFile as AttachIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  CheckCircle,
  FileDownload,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import axios from "axios";

const LicenseReplacement = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nationalId: "",
    policeReportNumber: "",
    lossDate: "",
    lossLocation: "",
    lossCircumstances: "",
  });
  const [documents, setDocuments] = useState({
    nationalIdDocument: null,
    policeReport: null,
    affidavit: null,
    passportPhoto: null,
  });
  const [filePreviews, setFilePreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Replacement status and license information
  const [replacementStatus, setReplacementStatus] = useState(null);
  const [replacedLicense, setReplacedLicense] = useState(null);
  const [hasApprovedReplacement, setHasApprovedReplacement] = useState(false);
  const [checkingReplacement, setCheckingReplacement] = useState(true);

  // Function to check for approved replacement applications
  const checkReplacementStatus = async () => {
    try {
      setCheckingReplacement(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.warn("No user ID found for replacement check");
        return;
      }

      console.log("🔍 Checking replacement status for user:", userId);

      // Check if user has any renewal applications with "lost" reason
      const response = await axios.get(
        `http://localhost:5004/api/renewals/user/${userId}`
      );

      console.log("📋 Renewal applications:", response.data);

      if (response.data && response.data.length > 0) {
        // Filter for lost license applications
        const lostLicenseApplications = response.data.filter(
          (renewal) => renewal.renewalReason === "lost"
        );

        if (lostLicenseApplications.length > 0) {
          // Sort by submission date (most recent first)
          const sortedReplacements = lostLicenseApplications.sort(
            (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)
          );

          // Get the most recent replacement
          const latestReplacement = sortedReplacements[0];
          setReplacementStatus(latestReplacement);

          // Check if the latest replacement is approved and has a new license issued
          if (latestReplacement.status === "approved" && latestReplacement.newLicenseIssued) {
            console.log("✅ Found approved replacement with new license:", latestReplacement.newLicenseNumber);
            setHasApprovedReplacement(true);

            // Get the replaced license information
            await getReplacedLicense(userId);
          } else {
            console.log("📋 Replacement status:", latestReplacement.status, "License issued:", latestReplacement.newLicenseIssued);
            setHasApprovedReplacement(false);
          }
        } else {
          console.log("📋 No lost license replacement applications found");
          setHasApprovedReplacement(false);
        }
      } else {
        console.log("📋 No renewal applications found");
        setHasApprovedReplacement(false);
      }
    } catch (error) {
      console.error("Error checking replacement status:", error);
      setHasApprovedReplacement(false);
    } finally {
      setCheckingReplacement(false);
    }
  };

  // Function to get replaced license information
  const getReplacedLicense = async (userId) => {
    try {
      console.log("🔍 Getting replaced license for user:", userId);

      // Try the debug endpoint first
      const response = await axios.get(
        `http://localhost:5004/api/license/debug/user/${userId}`
      );

      console.log("🎫 License response:", response.data);

      if (response.data && response.data.licenseExists) {
        setReplacedLicense({
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
      console.error("Error getting replaced license:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (documentType) => (e) => {
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

      setDocuments((prev) => ({
        ...prev,
        [documentType]: file,
      }));
      setMessage({ type: "", text: "" });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreviews((prev) => ({
          ...prev,
          [documentType]: e.target.result,
        }));
        reader.readAsDataURL(file);
      } else {
        setFilePreviews((prev) => ({
          ...prev,
          [documentType]: null,
        }));
      }
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'password', 'nationalId', 'policeReportNumber', 'lossDate', 'lossLocation', 'lossCircumstances'];
    const requiredDocuments = ['nationalIdDocument', 'policeReport', 'affidavit'];

    // Check required fields
    for (const field of requiredFields) {
      if (!formData[field]) {
        setMessage({
          type: "error",
          text: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`,
        });
        return false;
      }
    }

    // Check required documents
    for (const doc of requiredDocuments) {
      if (!documents[doc]) {
        setMessage({
          type: "error",
          text: `Please upload the ${doc.replace(/([A-Z])/g, ' $1').toLowerCase()} document`,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Submitting license replacement application:", formData);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("renewalReason", "lost"); // Set as lost license
      
      // Add additional replacement-specific data as notes
      const replacementNotes = {
        nationalId: formData.nationalId,
        policeReportNumber: formData.policeReportNumber,
        lossDate: formData.lossDate,
        lossLocation: formData.lossLocation,
        lossCircumstances: formData.lossCircumstances,
      };
      formDataToSend.append("nationalId", formData.nationalId);

      // Upload the first document as the main license document (using police report)
      formDataToSend.append("licenseDocument", documents.policeReport);

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
          text: "License replacement application submitted successfully! Please wait for admin review.",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          nationalId: "",
          policeReportNumber: "",
          lossDate: "",
          lossLocation: "",
          lossCircumstances: "",
        });
        setDocuments({
          nationalIdDocument: null,
          policeReport: null,
          affidavit: null,
          passportPhoto: null,
        });
        setFilePreviews({});
      }
    } catch (error) {
      console.error("Error submitting replacement application:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error submitting replacement application",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check replacement status on component mount
  useEffect(() => {
    checkReplacementStatus();
  }, []);

  if (checkingReplacement) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show congratulations view if replacement is approved and license is issued
  if (hasApprovedReplacement && replacedLicense) {
    return (
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
                🎉 License Replacement Approved!
              </Typography>
              <Typography variant="subtitle1">
                Your lost license has been successfully replaced
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
                Your License Has Been Replaced!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Congratulations! Your replacement application has been approved and your new license is ready.
              </Typography>
            </Box>

            <Box sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              p: 3,
              backdropFilter: "blur(10px)"
            }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                New License Number: {replacedLicense?.number}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Your replacement license is now active and valid for driving!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: "linear-gradient(to right, #f44336, #ff7043)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ReplaceIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Replace Lost License
            </Typography>
            <Typography variant="subtitle1">
              Apply for a replacement of your lost or stolen driving license
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                License Replacement Application
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please provide all required information and documents to apply for a replacement license.
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Before You Begin:
                </Typography>
                <Typography variant="body2">
                  • File a police report for your lost license<br/>
                  • Prepare a notarized affidavit of loss<br/>
                  • Have your national ID and recent photo ready<br/>
                  • Ensure all documents are clear and legible
                </Typography>
              </Alert>

              {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                  {message.text}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 2 }}>
                  Personal Information
                </Typography>
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="National ID Number"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Loss Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Police Report Number"
                      name="policeReportNumber"
                      value={formData.policeReportNumber}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Report number from police station"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Loss"
                      name="lossDate"
                      type="date"
                      value={formData.lossDate}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location of Loss"
                      name="lossLocation"
                      value={formData.lossLocation}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Where did you lose your license?"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Circumstances of Loss"
                      name="lossCircumstances"
                      value={formData.lossCircumstances}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      multiline
                      rows={3}
                      helperText="Describe how you lost your license"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Required Documents
                </Typography>

                <Grid container spacing={3}>
                  {/* National ID Document */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        National ID Document *
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload a clear copy of your national ID
                      </Typography>

                      <input
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        id="national-id-upload"
                        type="file"
                        onChange={handleFileChange('nationalIdDocument')}
                      />
                      <label htmlFor="national-id-upload">
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
                            width: "100%",
                          }}
                        >
                          {documents.nationalIdDocument ? "Change National ID" : "Upload National ID"}
                        </Button>
                      </label>

                      {documents.nationalIdDocument && (
                        <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            {documents.nationalIdDocument.type === "application/pdf" ? (
                              <PdfIcon color="error" />
                            ) : (
                              <ImageIcon color="primary" />
                            )}
                            <Typography variant="body2" fontWeight="bold">
                              {documents.nationalIdDocument.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Size: {(documents.nationalIdDocument.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>

                          {filePreviews.nationalIdDocument && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={filePreviews.nationalIdDocument}
                                alt="National ID preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "150px",
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

                  {/* Police Report */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Police Report *
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload the original police report for lost license
                      </Typography>

                      <input
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        id="police-report-upload"
                        type="file"
                        onChange={handleFileChange('policeReport')}
                      />
                      <label htmlFor="police-report-upload">
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
                            width: "100%",
                          }}
                        >
                          {documents.policeReport ? "Change Police Report" : "Upload Police Report"}
                        </Button>
                      </label>

                      {documents.policeReport && (
                        <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            {documents.policeReport.type === "application/pdf" ? (
                              <PdfIcon color="error" />
                            ) : (
                              <ImageIcon color="primary" />
                            )}
                            <Typography variant="body2" fontWeight="bold">
                              {documents.policeReport.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Size: {(documents.policeReport.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>

                          {filePreviews.policeReport && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={filePreviews.policeReport}
                                alt="Police report preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "150px",
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

                  {/* Affidavit */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Affidavit of Loss *
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload notarized affidavit stating the loss
                      </Typography>

                      <input
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        id="affidavit-upload"
                        type="file"
                        onChange={handleFileChange('affidavit')}
                      />
                      <label htmlFor="affidavit-upload">
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
                            width: "100%",
                          }}
                        >
                          {documents.affidavit ? "Change Affidavit" : "Upload Affidavit"}
                        </Button>
                      </label>

                      {documents.affidavit && (
                        <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            {documents.affidavit.type === "application/pdf" ? (
                              <PdfIcon color="error" />
                            ) : (
                              <ImageIcon color="primary" />
                            )}
                            <Typography variant="body2" fontWeight="bold">
                              {documents.affidavit.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Size: {(documents.affidavit.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>

                          {filePreviews.affidavit && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={filePreviews.affidavit}
                                alt="Affidavit preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "150px",
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

                  {/* Passport Photo */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Passport Photo (Optional)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload a recent passport-size photo
                      </Typography>

                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="passport-photo-upload"
                        type="file"
                        onChange={handleFileChange('passportPhoto')}
                      />
                      <label htmlFor="passport-photo-upload">
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
                            width: "100%",
                          }}
                        >
                          {documents.passportPhoto ? "Change Photo" : "Upload Photo"}
                        </Button>
                      </label>

                      {documents.passportPhoto && (
                        <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <ImageIcon color="primary" />
                            <Typography variant="body2" fontWeight="bold">
                              {documents.passportPhoto.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Size: {(documents.passportPhoto.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>

                          {filePreviews.passportPhoto && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={filePreviews.passportPhoto}
                                alt="Passport photo preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "150px",
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
                </Grid>

                <Grid item xs={12} sx={{ mt: 3 }}>
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
                    {loading ? "Submitting..." : "Submit Replacement Application"}
                  </Button>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Replacement Process
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 1:</strong> File a police report for lost license
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 2:</strong> Fill out the replacement form
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 3:</strong> Upload required documents
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 4:</strong> Admin will review your application
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Step 5:</strong> Upon approval, your new license will be issued
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Required Documents
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • National ID Document (Copy)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Police Report (Original)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Affidavit of Loss (Notarized)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Passport Photo (Recent)
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6" fontWeight="bold">
                  Important Notes
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • You must file a police report before applying
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • All documents must be clear and legible
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Processing may take 5-10 business days
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • A replacement fee may apply
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • False information may result in application rejection
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LicenseReplacement;
