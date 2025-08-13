import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard,
  People,
  Assignment,
  TrendingUp,
  CheckCircle,
  Pending,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminName, setAdminName] = useState("Administrator");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Get admin name from localStorage
    const storedAdminName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedAdminName && storedAdminName !== "undefined") {
      setAdminName(storedAdminName);
    } else if (storedEmail) {
      if (storedEmail.includes("admin")) {
        setAdminName("System Administrator");
      } else {
        const emailName = storedEmail.split("@")[0];
        const formattedName =
          emailName.charAt(0).toUpperCase() + emailName.slice(1);
        setAdminName(formattedName);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: "Total Users", value: "120", icon: <People />, color: "#1976d2" },
    {
      title: "Total Applications",
      value: "85",
      icon: <Assignment />,
      color: "#388e3c",
    },
    {
      title: "Pending Applications",
      value: "32",
      icon: <Pending />,
      color: "#f57c00",
    },
    {
      title: "Approved Applications",
      value: "45",
      icon: <CheckCircle />,
      color: "#4caf50",
    },
  ];

  const quickActions = [
    { title: "Manage Users", path: "/admin/users", icon: <People /> },
    {
      title: "Applications",
      path: "/admin/applications",
      icon: <Assignment />,
    },
    {
      title: "Generate Report",
      path: "/admin/generate-report",
      icon: <TrendingUp />,
    },
    { title: "Dashboard", path: "/admin/dashboard", icon: <Dashboard /> },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading Admin Dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 400 }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error Loading Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setError(null);
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ color: "white" }}
            >
              Welcome back, {adminName}!
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Monitor and manage your driving license management system
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 56,
              height: 56,
              fontSize: "1.5rem",
            }}
          >
            {adminName ? adminName.charAt(0).toUpperCase() : "A"}
          </Avatar>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                color: "white",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ fontSize: 40, opacity: 0.8 }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "translateY(-5px)" },
                cursor: "pointer",
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Box sx={{ fontSize: 48, color: "#1976d2", mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" component="div" fontWeight="bold">
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Logout Button */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
