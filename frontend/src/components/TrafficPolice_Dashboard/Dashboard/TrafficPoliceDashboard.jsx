import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Divider,
  Chip,
  useTheme,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LocalPolice as PoliceIcon,
  Search as SearchIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
  AccountCircle,
  Logout,
  Settings,
  Gavel as ViolationIcon,
  DirectionsCar as CarIcon,
  Warning as WarningIcon,
  TrendingUp,
  Today,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LicenseSearch from "../LicenseSearch/LicenseSearch";
import ViolationForm from "../ViolationForm/ViolationForm";
import ViolationHistory from "../ViolationHistory/ViolationHistory";

const TrafficPoliceDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    todayViolations: 0,
    weekViolations: 0,
    monthViolations: 0,
    totalViolations: 0,
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const userType = localStorage.getItem("userType");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    if (userData) {
      setUser(JSON.parse(userData));
    } else if (userType === "traffic_police" && userId && userName) {
      // Fallback for old authentication method
      setUser({
        id: userId,
        fullName: userName,
        role: "traffic_police",
        // Set default values for missing fields
        badgeNumber: "N/A",
        department: "Traffic Police",
        rank: "Officer",
        jurisdiction: "N/A",
      });
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear all authentication-related localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    navigate("/signin");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      description: "Overview and statistics",
    },
    {
      id: "search",
      label: "License Search",
      icon: <SearchIcon />,
      description: "Search license by number",
    },
    {
      id: "add-violation",
      label: "Add Violation",
      icon: <AddIcon />,
      description: "Record new violation",
    },
    {
      id: "history",
      label: "Violation History",
      icon: <HistoryIcon />,
      description: "View recorded violations",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "search":
        return (
          <LicenseSearch
            onViolationAdd={() => setActiveSection("add-violation")}
          />
        );
      case "add-violation":
        return <ViolationForm onSuccess={() => setActiveSection("history")} />;
      case "history":
        return <ViolationHistory />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Welcome Card */}
      <Grid item xs={12}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  width: 60,
                  height: 60,
                }}
              >
                <PoliceIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Welcome, {user?.rank} {user?.fullName}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Badge: {user?.badgeNumber} | {user?.department}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Jurisdiction: {user?.jurisdiction}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Grid>

      {/* Statistics Cards */}
      <Grid item xs={12} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Today />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.todayViolations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Violations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.weekViolations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <ViolationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.monthViolations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.totalViolations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Violations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    onClick={() => setActiveSection("search")}
                    sx={{ py: 2 }}
                  >
                    Search License
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setActiveSection("add-violation")}
                    sx={{ py: 2 }}
                  >
                    Add Violation
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => setActiveSection("history")}
                    sx={{ py: 2 }}
                  >
                    View History
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CarIcon />}
                    sx={{ py: 2 }}
                  >
                    License Verification
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Grid>
  );

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <PoliceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Traffic Police Dashboard
          </Typography>

          {/* Navigation Menu */}
          <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.id}
                color="inherit"
                startIcon={item.icon}
                onClick={() => setActiveSection(item.id)}
                sx={{
                  bgcolor:
                    activeSection === item.id
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default TrafficPoliceDashboard;
