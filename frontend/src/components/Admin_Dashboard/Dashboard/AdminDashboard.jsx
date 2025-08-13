import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  List as MuiList,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Dashboard,
  People,
  Assignment,
  DirectionsCar,
  Payment,
  EventNote,
  CheckCircle,
  TrendingUp,
  Menu,
  Refresh,
  Delete,
  CardMembership,
  Quiz,
  Assessment,
  Description,
  Warning,
  Settings,
  Article,
  Autorenew,
  BarChart,
  Visibility,
} from "@mui/icons-material";
import { format } from "date-fns";

// Styled Components
const StyledAppBar = styled(AppBar)(() => ({
  background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  display: { xs: "block", md: "none" },
}));

const StyledDrawer = styled(Drawer)(() => ({
  width: 280,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 280,
    boxSizing: "border-box",
    background: `
      linear-gradient(135deg,
        #667eea 0%,
        #764ba2 25%,
        #f093fb 50%,
        #f5576c 75%,
        #4facfe 100%
      )
    `,
    color: "white",
    borderRight: "none",
    boxShadow: "8px 0 32px rgba(102, 126, 234, 0.3)",
    position: "relative",
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "&::-webkit-scrollbar-track": {
      display: "none",
    },
    "&::-webkit-scrollbar-thumb": {
      display: "none",
    },
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE and Edge
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
      `,
      pointerEvents: "none",
    },
  },
}));

const StyledListItem = styled(ListItem)(({ selected }) => ({
  margin: "6px 16px",
  borderRadius: "16px",
  backgroundColor: selected ? "rgba(255, 255, 255, 0.25)" : "transparent",
  backdropFilter: selected ? "blur(10px)" : "none",
  border: selected
    ? "1px solid rgba(255, 255, 255, 0.3)"
    : "1px solid transparent",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(8px)",
    transform: "translateX(8px) scale(1.02)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(255, 255, 255, 0.1)",
  },
  "&:active": {
    transform: "translateX(4px) scale(0.98)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
    transition: "left 0.6s ease",
  },
  "&:hover::before": {
    left: "100%",
  },
}));

const StyledCard = styled(Card)(() => ({
  borderRadius: 12,
  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.08)",
  height: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
  },
}));

const StatCard = styled(Card)(({ bgcolor }) => ({
  background: `linear-gradient(135deg, ${bgcolor} 0%, ${bgcolor}dd 100%)`,
  color: "white",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
  },
}));

const ActionCard = styled(Card)(() => ({
  borderRadius: 12,
  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.08)",
  height: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
  },
}));

const IconCircle = styled(Box)(({ bgcolor }) => ({
  width: 64,
  height: 64,
  borderRadius: "50%",
  backgroundColor: bgcolor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
  color: "white",
}));

const ActivityItem = styled(ListItem)(() => ({
  padding: "12px 16px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
  "&:last-child": {
    borderBottom: "none",
  },
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
}));

const ActivityAvatar = styled(Avatar)(({ bgcolor }) => ({
  backgroundColor: bgcolor,
  width: 32,
  height: 32,
  fontSize: "0.875rem",
  marginRight: 12,
}));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalApplications: 89,
    pendingExams: 23,
    approvedLicenses: 67,
  });
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      user: "John Doe",
      action: "submitted",
      type: "application",
      timestamp: new Date().toISOString(),
      description: "License application for Class B",
      details: { licenseType: "Class B" },
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "completed",
      type: "exam",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      description: "Driving test completed",
      details: { examType: "Practical" },
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "paid",
      type: "payment",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      description: "License fee payment",
    },
    {
      id: 4,
      user: "Sarah Wilson",
      action: "registered",
      type: "user",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      description: "New user registration",
    },
    {
      id: 5,
      user: "David Brown",
      action: "issued",
      type: "license",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      description: "License issued successfully",
      details: { licenseType: "Class A" },
    },
  ]);

  useEffect(() => {
    const storedAdminName =
      localStorage.getItem("userName") || localStorage.getItem("adminName");
    if (storedAdminName) {
      setAdminName(storedAdminName);
    }
  }, []);

  const deleteActivity = (activityId) => {
    setRecentActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    );
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("adminName");
    navigate("/signin");
    setShowLogoutDialog(false);
  };

  const getActivityDetails = (type, action, severity, status) => {
    const activityConfig = {
      user: { bgcolor: "#2196f3", icon: <People fontSize="small" /> },
      application: {
        bgcolor: "#ff9800",
        icon: <Assignment fontSize="small" />,
      },
      exam: { bgcolor: "#4caf50", icon: <EventNote fontSize="small" /> },
      license: {
        bgcolor: "#9c27b0",
        icon: <CardMembership fontSize="small" />,
      },
      payment: { bgcolor: "#f44336", icon: <Payment fontSize="small" /> },
    };
    return (
      activityConfig[type] || {
        bgcolor: "#757575",
        icon: <Dashboard fontSize="small" />,
      }
    );
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
    { text: "Users", icon: <People />, path: "/admin/users" },
    { text: "Applications", icon: <Assignment />, path: "/admin/applications" },
    { text: "Exams", icon: <DirectionsCar />, path: "/admin/exams" },
    {
      text: "Practical Exams",
      icon: <EventNote />,
      path: "/admin/practical-exams",
    },
    { text: "Trial Questions", icon: <Quiz />, path: "/admin/trial-questions" },
    {
      text: "Trial Results",
      icon: <Assessment />,
      path: "/admin/trial-results",
    },
    { text: "Payment Management", icon: <Payment />, path: "/admin/payments" },
    {
      text: "License Management",
      icon: <CardMembership />,
      path: "/admin/licenses",
    },
    { text: "Renewals", icon: <Autorenew />, path: "/admin/renewals" },
    { text: "Violations", icon: <Warning />, path: "/admin/violations" },
    { text: "News Management", icon: <Article />, path: "/admin/news" },
    {
      text: "Generate Report",
      icon: <BarChart />,
      path: "/admin/generate-report",
    },
    { text: "View Reports", icon: <Visibility />, path: "/admin/view-report" },
    { text: "Settings", icon: <Settings />, path: "/admin/settings" },
  ];

  const DrawerContent = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "&::-webkit-scrollbar-track": {
          display: "none",
        },
        "&::-webkit-scrollbar-thumb": {
          display: "none",
        },
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE and Edge
      }}
    >
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          background: `
            linear-gradient(135deg,
              rgba(255,255,255,0.1) 0%,
              rgba(255,255,255,0.05) 100%
            )
          `,
          backdropFilter: "blur(20px)",
          position: "relative",
          flexShrink: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at center,
                rgba(255,255,255,0.1) 0%,
                transparent 70%
              )
            `,
            pointerEvents: "none",
          },
        }}
      >
        <Typography
          variant="h4"
          fontWeight="800"
          sx={{
            color: "white",
            mb: 1,
            textShadow: "0 4px 8px rgba(0,0,0,0.3)",
            background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            position: "relative",
            zIndex: 1,
          }}
        >
          DLMS Admin
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.9)",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            fontWeight: "500",
            letterSpacing: "0.5px",
            position: "relative",
            zIndex: 1,
          }}
        >
          Management System
        </Typography>
      </Box>
      <List
        sx={{
          px: 1,
          py: 2,
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollBehavior: "smooth",
          minHeight: 0, // Important for flex scrolling
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "&::-webkit-scrollbar-track": {
            display: "none",
          },
          "&::-webkit-scrollbar-thumb": {
            display: "none",
          },
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
        }}
      >
        {menuItems.map((item) => (
          <StyledListItem
            key={item.text}
            button
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{ mb: 0.5 }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: "0.9rem",
                fontWeight: location.pathname === item.path ? "600" : "400",
              }}
            />
          </StyledListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Mobile AppBar */}
      <StyledAppBar
        position="fixed"
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            DLMS Admin
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}>
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <DrawerContent />
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          sx={{ display: { xs: "none", md: "block" } }}
          open
        >
          <DrawerContent />
        </StyledDrawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
          mt: { xs: 8, md: 0 },
          overflow: "auto",
        }}
      >
        {/* Welcome Section */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ color: "white" }}
              >
                Welcome back, {adminName || "Admin"}!
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                Monitor and manage your driving license management system
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.5)",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#1976d2">
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "white", opacity: 0.9 }}
                    >
                      Total Users
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 0.5 }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8, fontSize: "0.75rem" }}
                    >
                      <TrendingUp
                        sx={{
                          fontSize: 14,
                          verticalAlign: "text-bottom",
                          mr: 0.5,
                        }}
                      />
                      +12% from last month
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <People fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#388e3c">
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "white", opacity: 0.9 }}
                    >
                      Applications
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 0.5 }}>
                      {stats.totalApplications}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8, fontSize: "0.75rem" }}
                    >
                      <TrendingUp
                        sx={{
                          fontSize: 14,
                          verticalAlign: "text-bottom",
                          mr: 0.5,
                        }}
                      />
                      +8% from last month
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Assignment fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#f57c00">
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "white", opacity: 0.9 }}
                    >
                      Pending Exams
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 0.5 }}>
                      {stats.pendingExams}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8, fontSize: "0.75rem" }}
                    >
                      <TrendingUp
                        sx={{
                          fontSize: 14,
                          verticalAlign: "text-bottom",
                          mr: 0.5,
                        }}
                      />
                      +5% from last month
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <EventNote fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#4caf50">
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "white", opacity: 0.9 }}
                    >
                      Approved Licenses
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 0.5 }}>
                      {stats.approvedLicenses}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8, fontSize: "0.75rem" }}
                    >
                      <TrendingUp
                        sx={{
                          fontSize: 14,
                          verticalAlign: "text-bottom",
                          mr: 0.5,
                        }}
                      />
                      +18% from last month
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <CheckCircle fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Original Complex Layout */}
        <Grid container spacing={3}>
          {/* Quick Actions Section */}
          <Grid item xs={12}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ mb: 3, fontWeight: "bold" }}
            >
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <ActionCard>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <IconCircle bgcolor="#3f51b5">
                      <Assignment sx={{ fontSize: 32 }} />
                    </IconCircle>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Applications
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Process license applications
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        backgroundColor: "#3f51b5",
                        "&:hover": { backgroundColor: "#303f9f" },
                      }}
                      onClick={() => navigate("/admin/applications")}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </ActionCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ActionCard>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <IconCircle bgcolor="#f44336">
                      <People sx={{ fontSize: 32 }} />
                    </IconCircle>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Users
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Manage system users
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        backgroundColor: "#f44336",
                        "&:hover": { backgroundColor: "#d32f2f" },
                      }}
                      onClick={() => navigate("/admin/users")}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </ActionCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ActionCard>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <IconCircle bgcolor="#ff9800">
                      <EventNote sx={{ fontSize: 32 }} />
                    </IconCircle>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Exams
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Schedule driving tests
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        backgroundColor: "#ff9800",
                        "&:hover": { backgroundColor: "#f57c00" },
                      }}
                      onClick={() => navigate("/admin/exams")}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </ActionCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ActionCard>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <IconCircle bgcolor="#4caf50">
                      <Payment sx={{ fontSize: 32 }} />
                    </IconCircle>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Payments
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Review user payments
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        backgroundColor: "#4caf50",
                        "&:hover": { backgroundColor: "#388e3c" },
                      }}
                      onClick={() => navigate("/admin/payments")}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </ActionCard>
              </Grid>
            </Grid>
          </Grid>

          {/* Additional Management and Recent Activities Row */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {/* Left Side - Additional Management */}
              <Grid item xs={12} md={8}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ mb: 3, fontWeight: "bold" }}
                >
                  Additional Management
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionCard>
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                        <IconCircle bgcolor="#2196f3">
                          <CardMembership sx={{ fontSize: 32 }} />
                        </IconCircle>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Licenses
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          Manage issued licenses
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            backgroundColor: "#2196f3",
                            "&:hover": { backgroundColor: "#1976d2" },
                          }}
                          onClick={() => navigate("/admin/licenses")}
                        >
                          Manage
                        </Button>
                      </CardContent>
                    </ActionCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionCard>
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                        <IconCircle bgcolor="#9c27b0">
                          <Quiz sx={{ fontSize: 32 }} />
                        </IconCircle>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Questions
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          Manage practice questions
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            backgroundColor: "#9c27b0",
                            "&:hover": { backgroundColor: "#7b1fa2" },
                          }}
                          onClick={() => navigate("/admin/trial-questions")}
                        >
                          Manage
                        </Button>
                      </CardContent>
                    </ActionCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionCard>
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                        <IconCircle bgcolor="#00bcd4">
                          <Assessment sx={{ fontSize: 32 }} />
                        </IconCircle>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Results
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          View exam performance
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            backgroundColor: "#00bcd4",
                            "&:hover": { backgroundColor: "#0097a7" },
                          }}
                          onClick={() => navigate("/admin/trial-results")}
                        >
                          View
                        </Button>
                      </CardContent>
                    </ActionCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionCard>
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                        <IconCircle bgcolor="#607d8b">
                          <Description sx={{ fontSize: 32 }} />
                        </IconCircle>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Reports
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          Generate system reports
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            backgroundColor: "#607d8b",
                            "&:hover": { backgroundColor: "#455a64" },
                          }}
                          onClick={() => navigate("/admin/reports")}
                        >
                          Generate
                        </Button>
                      </CardContent>
                    </ActionCard>
                  </Grid>
                </Grid>
              </Grid>

              {/* Right Side - Recent Activities */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Recent Activity
                  </Typography>
                  <Button
                    size="small"
                    sx={{
                      minWidth: "auto",
                      p: 1,
                      color: "text.secondary",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Refresh fontSize="small" />
                  </Button>
                </Box>
                <StyledCard sx={{ maxHeight: 500 }}>
                  <CardContent sx={{ p: 0 }}>
                    <MuiList sx={{ p: 0, maxHeight: 450, overflowY: "auto" }}>
                      {recentActivities.map((activity) => {
                        const { bgcolor, icon } = getActivityDetails(
                          activity.type,
                          activity.action,
                          activity.severity,
                          activity.status
                        );
                        return (
                          <ActivityItem key={activity.id}>
                            <ActivityAvatar bgcolor={bgcolor}>
                              {icon}
                            </ActivityAvatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{ lineHeight: 1.3 }}
                              >
                                <strong>{activity.user}</strong>{" "}
                                {activity.action}{" "}
                                {activity.type === "user"
                                  ? ""
                                  : `a ${activity.type}`}
                              </Typography>
                              {activity.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    lineHeight: 1.2,
                                    display: "block",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {activity.description}
                                </Typography>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 0.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ lineHeight: 1.2 }}
                                >
                                  {activity.timestamp &&
                                  !isNaN(new Date(activity.timestamp))
                                    ? format(
                                        new Date(activity.timestamp),
                                        "MMM dd, HH:mm"
                                      )
                                    : "Invalid date"}
                                </Typography>
                                {activity.details?.licenseType && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      backgroundColor: bgcolor,
                                      color: "white",
                                      px: 0.5,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      fontSize: "0.65rem",
                                    }}
                                  >
                                    {activity.details.licenseType}
                                  </Typography>
                                )}
                                {activity.details?.examType && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      backgroundColor: bgcolor,
                                      color: "white",
                                      px: 0.5,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      fontSize: "0.65rem",
                                    }}
                                  >
                                    {activity.details.examType}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Button
                              size="small"
                              onClick={() => deleteActivity(activity.id)}
                              sx={{
                                minWidth: "auto",
                                width: 24,
                                height: 24,
                                p: 0,
                                color: "text.secondary",
                                opacity: 0.6,
                                "&:hover": {
                                  backgroundColor: "error.main",
                                  color: "white",
                                  opacity: 1,
                                },
                              }}
                            >
                              <Delete sx={{ fontSize: 16 }} />
                            </Button>
                          </ActivityItem>
                        );
                      })}
                    </MuiList>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "primary.main",
            pb: 1,
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to logout from the admin dashboard?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            onClick={() => setShowLogoutDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: "500",
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: "500",
              background: "linear-gradient(135deg, #ff4757, #ff3742)",
              "&:hover": {
                background: "linear-gradient(135deg, #ff3742, #ff2f3a)",
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
