import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Login, Info } from "@mui/icons-material";

const AuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const getServiceName = () => {
    const path = location.pathname;
    if (path.includes("apply") || path.includes("application")) {
      return {
        en: "License Application",
        am: "የፈቃድ ማመልከቻ",
      };
    } else if (path.includes("exam")) {
      return {
        en: "Driving Exams",
        am: "የመንዳት ፈተናዎች",
      };
    } else if (path.includes("renewal")) {
      return {
        en: "License Renewal",
        am: "የፈቃድ እድሳት",
      };
    } else if (path.includes("violations")) {
      return {
        en: "Traffic Violations",
        am: "የትራፊክ ጥሰቶች",
      };
    } else if (path.includes("status")) {
      return {
        en: "Application Status",
        am: "የማመልከቻ ሁኔታ",
      };
    } else {
      return {
        en: "DLMS Services",
        am: "የDLMS አገልግሎቶች",
      };
    }
  };

  const serviceName = getServiceName();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate("/signin", { 
        state: { 
          from: location.pathname,
          message: `Please sign in to access ${serviceName.en}` 
        }
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, location.pathname, serviceName.en]);

  const handleSignInClick = () => {
    navigate("/signin", { 
      state: { 
        from: location.pathname,
        message: `Please sign in to access ${serviceName.en}` 
      }
    });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8, minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Card sx={{ width: "100%", textAlign: "center", p: 3 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Info sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Authentication Required
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              የማረጋገጫ ፍላጎት
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
            <Typography variant="body1" gutterBottom>
              <strong>Service:</strong> {serviceName.en}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              <strong>አገልግሎት:</strong> {serviceName.am}
            </Typography>
          </Alert>

          <Typography variant="body1" paragraph>
            You need to sign in to access <strong>{serviceName.en}</strong>. 
            This service requires authentication to ensure security and proper access control.
          </Typography>

          <Typography variant="body2" paragraph color="text.secondary" sx={{ fontStyle: "italic" }}>
            <strong>{serviceName.am}</strong> ለመድረስ መግባት ያስፈልግዎታል። 
            ይህ አገልግሎት ደህንነትን እና ትክክለኛ የመዳረሻ ቁጥጥርን ለማረጋገጥ ማረጋገጫ ይፈልጋል።
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Redirecting to sign in page in 5 seconds...
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={handleSignInClick}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
              }}
            >
              Sign In Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleBackClick}
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            >
              Go Back
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>🇪🇹 Ethiopian Driving License Management System</strong>
              <br />
              Secure • Reliable • Government Approved
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AuthRedirect;
