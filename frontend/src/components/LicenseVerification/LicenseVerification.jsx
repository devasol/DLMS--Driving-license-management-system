import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import axios from "axios";

const LicenseVerification = () => {
  const { licenseNumber } = useParams();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (licenseNumber) {
      verifyLicense();
    }
  }, [licenseNumber]);

  const verifyLicense = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Verifying license: ${licenseNumber}`);

      const response = await axios.get(`/api/license/verify/${licenseNumber}`);

      if (response.data.success) {
        setVerificationData(response.data);
        console.log("✅ License verification successful:", response.data);
      } else {
        setError(response.data.message || "License verification failed");
      }
    } catch (error) {
      console.error("❌ License verification error:", error);
      setError(
        error.response?.data?.message ||
          "Error verifying license. Please check the license number and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, isExpired) => {
    if (isExpired) return "error";
    switch (status?.toLowerCase()) {
      case "valid":
      case "active":
        return "success";
      case "suspended":
        return "warning";
      case "revoked":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status, isExpired) => {
    if (isExpired) return <WarningIcon />;
    switch (status?.toLowerCase()) {
      case "valid":
      case "active":
        return <CheckCircleIcon />;
      case "suspended":
        return <WarningIcon />;
      case "revoked":
        return <ErrorIcon />;
      default:
        return <BadgeIcon />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Verifying License...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            License Number: {licenseNumber}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ErrorIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
            <Typography variant="h4" color="error.main" gutterBottom>
              Verification Failed
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              License Number: {licenseNumber}
            </Typography>
            <Alert severity="error" sx={{ mt: 3, mb: 3 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={verifyLicense} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!verificationData) {
    return null;
  }

  const { license, holder, verification } = verificationData;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <SecurityIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              License Verification
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Ethiopian Driving License Management System
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* License Status Card */}
          <Grid item xs={12}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  {getStatusIcon(license.status, license.isExpired)}
                  <Typography variant="h5" fontWeight="bold" sx={{ ml: 2 }}>
                    License Status
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        License Number
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {license.number}
                      </Typography>
                    </Box>

                    <Chip
                      icon={getStatusIcon(license.status, license.isExpired)}
                      label={
                        license.isExpired
                          ? "EXPIRED"
                          : license.status.toUpperCase()
                      }
                      color={getStatusColor(license.status, license.isExpired)}
                      size="large"
                      sx={{ mb: 2, fontSize: "1rem", fontWeight: "bold" }}
                    />

                    {license.isExpired && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        This license has expired. Please renew immediately.
                      </Alert>
                    )}

                    {!license.isExpired && license.daysUntilExpiry <= 30 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        This license will expire in {license.daysUntilExpiry}{" "}
                        days.
                      </Alert>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <BadgeIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1">
                        <strong>Class:</strong> {license.class}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1">
                        <strong>Issue Date:</strong> {license.issueDate}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1">
                        <strong>Expiry Date:</strong> {license.expiryDate}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography variant="body1">
                        <strong>Restrictions:</strong> {license.restrictions}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1">
                        <strong>Points:</strong> {license.points}/12
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* License Holder Information */}
          <Grid item xs={12}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <PersonIcon
                    sx={{ fontSize: 32, color: "primary.main", mr: 2 }}
                  />
                  <Typography variant="h5" fontWeight="bold">
                    License Holder Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* User Photo */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: "center" }}>
                      {holder.hasPhoto && holder.photo ? (
                        <Avatar
                          src={holder.photo}
                          sx={{
                            width: 150,
                            height: 150,
                            mx: "auto",
                            mb: 2,
                            border: "4px solid",
                            borderColor: "primary.main",
                            boxShadow: 3,
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 150,
                            height: 150,
                            mx: "auto",
                            mb: 2,
                            backgroundColor: "grey.300",
                            fontSize: "4rem",
                            border: "4px solid",
                            borderColor: "grey.400",
                          }}
                        >
                          {holder.name.charAt(0)}
                        </Avatar>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {holder.hasPhoto
                          ? "Official Photo"
                          : "No Photo Available"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Personal Information */}
                  <Grid item xs={12} md={9}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Full Name
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {holder.name}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Date of Birth
                          </Typography>
                          <Typography variant="body1">
                            {holder.dateOfBirth}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {holder.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {holder.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <LocationIcon
                            sx={{ mr: 1, color: "text.secondary", mt: 0.5 }}
                          />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Address
                            </Typography>
                            <Typography variant="body1">
                              {holder.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Verification Details */}
          <Grid item xs={12}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <SecurityIcon
                    sx={{ fontSize: 32, color: "success.main", mr: 2 }}
                  />
                  <Typography variant="h5" fontWeight="bold">
                    Verification Details
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <CheckCircleIcon
                        sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Authentic
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {verification.authentic ? "YES" : "NO"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <SecurityIcon
                        sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Security Level
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {verification.securityLevel}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Verification Method
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {verification.verificationMethod}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Verified At
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {new Date(verification.verifiedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>✅ Verification Complete:</strong> This license has
                    been successfully verified against the official Ethiopian
                    Driving License Management System database. All information
                    displayed is authentic and up-to-date.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2025 Ethiopian Driving License Management System | Powered by
            Government Digital Services
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            For official inquiries, contact the relevant transport authority
            office.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LicenseVerification;
