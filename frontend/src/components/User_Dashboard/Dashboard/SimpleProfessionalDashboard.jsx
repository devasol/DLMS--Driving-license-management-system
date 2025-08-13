import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment,
  School,
  DirectionsCar,
  Menu as MenuIcon,
  Person,
  Notifications,
  Logout,
  Settings,
  AccountCircle,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// Styled Components
const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
}));

const StatsCard = styled(motion(Card))(({ theme, color = "#3b82f6" }) => ({
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: color,
  },
}));

const drawerWidth = 280;

// Sample Data
const applicationData = [
  { month: "Jan", applications: 65 },
  { month: "Feb", applications: 78 },
  { month: "Mar", applications: 90 },
  { month: "Apr", applications: 81 },
  { month: "May", applications: 95 },
  { month: "Jun", applications: 88 },
];

const licenseData = [
  { name: "Regular", value: 45, color: "#3b82f6" },
  { name: "Commercial", value: 25, color: "#10b981" },
  { name: "Motorcycle", value: 20, color: "#f59e0b" },
  { name: "Special", value: 10, color: "#8b5cf6" },
];

const examData = [
  { month: "Jan", passed: 45, failed: 15 },
  { month: "Feb", passed: 52, failed: 18 },
  { month: "Mar", passed: 48, failed: 22 },
  { month: "Apr", passed: 51, failed: 19 },
  { month: "May", passed: 62, failed: 23 },
  { month: "Jun", passed: 58, failed: 20 },
];

const SimpleProfessionalDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dropdown states
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);

  // Sample notifications data
  const [notifications] = useState([
    {
      id: 1,
      title: "Application Approved",
      message: "Your license application has been approved",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Exam Scheduled",
      message: "Your driving exam is scheduled for tomorrow",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      title: "Document Required",
      message: "Please upload additional documents",
      time: "3 days ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "applications", label: "Applications", icon: <Assignment /> },
    { id: "exams", label: "Exams", icon: <School /> },
    { id: "licenses", label: "Licenses", icon: <DirectionsCar /> },
  ];

  const statsData = [
    {
      title: "Total Applications",
      value: "1,234",
      change: "+12%",
      color: "#3b82f6",
      icon: <Assignment />,
    },
    {
      title: "Approved Licenses",
      value: "856",
      change: "+8%",
      color: "#10b981",
      icon: <DirectionsCar />,
    },
    {
      title: "Pending Reviews",
      value: "42",
      change: "-5%",
      color: "#f59e0b",
      icon: <School />,
    },
    {
      title: "Exam Pass Rate",
      value: "87%",
      change: "+3%",
      color: "#8b5cf6",
      icon: <Person />,
    },
  ];

  const drawer = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar sx={{ mr: 2, bgcolor: "#3b82f6" }}>JD</Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            John Doe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Premium User
          </Typography>
        </Box>
      </Box>

      <List>
        {navigationItems.map((item) => (
          <Tooltip
            key={item.id}
            title={`Go to ${item.label}`}
            placement="right"
          >
            <ListItem
              button
              sx={{
                borderRadius: "12px",
                mb: 1,
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  transform: "translateX(4px)",
                },
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              <ListItemIcon sx={{ color: "#3b82f6" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <MainContainer>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          color: "#333",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Professional Dashboard
          </Typography>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationMenuOpen}
              sx={{
                color: "#667eea",
                mr: 1,
                position: "relative",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    right: -8,
                    top: 8,
                    border: "2px solid white",
                    padding: "0 4px",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    zIndex: 1001,
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                    transform: "scale(1) translate(0, 0)",
                  },
                }}
              >
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
          <Tooltip title="Account Menu">
            <Avatar
              onClick={handleUserMenuOpen}
              sx={{
                ml: 1,
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "2px solid rgba(102, 126, 234, 0.3)",
                cursor: "pointer",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  background: "linear-gradient(135deg, #764ba2, #667eea)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.3s ease",
              }}
            >
              JD
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
            zIndex: 9999,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.5 }}>
          <AccountCircle sx={{ mr: 2, color: "#667eea" }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.5 }}>
          <Settings sx={{ mr: 2, color: "#667eea" }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "#ef4444" }}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu Dropdown */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            maxWidth: "350px",
            maxHeight: "400px",
            zIndex: 9999,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleNotificationMenuClose}
              sx={{
                py: 2,
                px: 2,
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                "&:last-child": { borderBottom: "none" },
                opacity: notification.read ? 0.7 : 1,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {notification.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Notifications
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 4, color: "white", fontWeight: 600 }}
        >
          Welcome to Your Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <StatsCard
                color={stat.color}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "12px",
                        bgcolor: `${stat.color}15`,
                        color: stat.color,
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: stat.change.startsWith("+")
                        ? "#10b981"
                        : "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    {stat.change} from last month
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                height: "400px",
              }}
            >
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Application Trends
                </Typography>
                <Box sx={{ height: "320px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={applicationData}>
                      <defs>
                        <linearGradient
                          id="colorApplications"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#colorApplications)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                height: "400px",
              }}
            >
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  License Distribution
                </Typography>
                <Box sx={{ height: "320px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={licenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {licenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Charts */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                height: "400px",
              }}
            >
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Exam Results Overview
                </Typography>
                <Box sx={{ height: "320px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={examData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="passed"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="failed"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainContainer>
  );
};

export default SimpleProfessionalDashboard;
