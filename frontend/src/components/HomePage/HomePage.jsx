import React from "react";
import { Box, Button, Container, Typography, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Driving License Management System
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Apply, manage, and renew your driving license online
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate("/signin")}
              sx={{ mx: 1, mb: 2 }}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => navigate("/signup")}
              sx={{ mx: 1, mb: 2 }}
            >
              Register
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Our Services
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                License Application
              </Typography>
              <Typography>
                Apply for a new driving license online. Submit your documents
                and track your application status in real-time.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                License Renewal
              </Typography>
              <Typography>
                Renew your existing license with just a few clicks. Get
                notifications before your license expires.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                Exam Scheduling
              </Typography>
              <Typography>
                Schedule your driving tests online. Choose from available slots
                and get reminders for your upcoming exams.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1" align="center">
            © {new Date().getFullYear()} Federal Democratic Republic of Ethiopia
            - Ministry of Transport and Logistics
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 1, opacity: 0.7 }}
          >
            🇪🇹 Driving License Management System
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
