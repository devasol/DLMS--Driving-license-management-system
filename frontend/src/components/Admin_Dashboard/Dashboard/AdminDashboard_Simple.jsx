import React from "react";
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
              Welcome back, Admin!
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
            A
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
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>{stat.icon}</Box>
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
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: "#1976d2",
                    color: "white",
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {action.title}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(action.path)}
                  sx={{ mt: 1 }}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Back to Home */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button variant="outlined" onClick={() => navigate("/")} sx={{ mr: 2 }}>
          Back to Home
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
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
