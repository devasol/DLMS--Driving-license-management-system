import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Badge,
  Paper,
  Tooltip,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person,
  DirectionsCar,
  Assignment,
  School,
  History,
  Notifications,
  Settings,
  Home,
  BarChart,
  PieChart,
  ShowChart,
  Map,
  People,
  Traffic,
  Assessment,
  Visibility,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { styled, keyframes } from "@mui/system";

// Animation keyframes
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled components
const drawerWidth = 280;

const MainContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
});

const ModernDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    borderRight: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
});

const StyledAppBar = styled(AppBar)({
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 1px 20px rgba(0, 0, 0, 0.08)",
  color: "#1a202c",
  borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
});

const StatsCard = styled(motion(Card))(({ theme, color = "#3b82f6" }) => ({
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
  },
}));

const ChartCard = styled(motion(Card))({
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
  },
});

const UserProfile = styled(Box)({
  padding: "24px",
  textAlign: "center",
  borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
});

const NavItem = styled(ListItem)(({ active }) => ({
  borderRadius: "12px",
  margin: "4px 16px",
  transition: "all 0.2s ease",
  background: active
    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    : "transparent",
  color: active ? "white" : "#64748b",
  "&:hover": {
    background: active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "rgba(102, 126, 234, 0.08)",
    transform: "translateX(4px)",
  },
  "& .MuiListItemIcon-root": {
    color: active ? "white" : "#64748b",
    minWidth: "40px",
  },
}));

// Sample data for charts
const applicationData = [
  { month: "Jan", applications: 65, approved: 45, rejected: 8 },
  { month: "Feb", applications: 78, approved: 52, rejected: 12 },
  { month: "Mar", applications: 90, approved: 68, rejected: 10 },
  { month: "Apr", applications: 81, approved: 61, rejected: 9 },
  { month: "May", applications: 95, approved: 75, rejected: 8 },
  { month: "Jun", applications: 88, approved: 70, rejected: 7 },
];

const licenseTypeData = [
  { name: "Category A", value: 35, color: "#3b82f6" },
  { name: "Category B", value: 45, color: "#10b981" },
  { name: "Category C", value: 15, color: "#f59e0b" },
  { name: "Category D", value: 5, color: "#ef4444" },
];

const examResultsData = [
  { month: "Jan", passed: 42, failed: 18 },
  { month: "Feb", passed: 48, failed: 22 },
  { month: "Mar", passed: 55, failed: 25 },
  { month: "Apr", passed: 51, failed: 19 },
  { month: "May", passed: 62, failed: 23 },
  { month: "Jun", passed: 58, failed: 20 },
];

const ProfessionalDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [userName, setUserName] = useState("John Doe");

  // Debug log
  console.log("ProfessionalDashboard is rendering...");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "applications", label: "Applications", icon: <Assignment /> },
    { id: "exams", label: "Exams", icon: <School /> },
    { id: "licenses", label: "Licenses", icon: <DirectionsCar /> },
    { id: "profile", label: "Profile", icon: <Person /> },
    { id: "history", label: "History", icon: <History /> },
    { id: "settings", label: "Settings", icon: <Settings /> },
  ];

  const statsData = [
    {
      title: "Total Applications",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      color: "#3b82f6",
      icon: <Assignment />,
    },
    {
      title: "Approved Licenses",
      value: "892",
      change: "+8.2%",
      trend: "up",
      color: "#10b981",
      icon: <DirectionsCar />,
    },
    {
      title: "Pending Reviews",
      value: "156",
      change: "-5.1%",
      trend: "down",
      color: "#f59e0b",
      icon: <Assessment />,
    },
    {
      title: "Exam Pass Rate",
      value: "78.5%",
      change: "+3.2%",
      trend: "up",
      color: "#8b5cf6",
      icon: <School />,
    },
  ];

  return (
    <MainContainer>
      <CssBaseline />

      {/* App Bar */}
      <StyledAppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            Blue Chips Chicago
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit" sx={{ position: "relative" }}>
              <Badge
                badgeContent={4}
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
            <Avatar sx={{ bgcolor: "#667eea", width: 40, height: 40 }}>
              {userName.charAt(0)}
            </Avatar>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <ModernDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", sm: "none" } }}
        >
          <UserProfile>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: "0 auto 16px",
                bgcolor: "#667eea",
              }}
            >
              {userName.charAt(0)}
            </Avatar>
            <Typography variant="h6" fontWeight="600">
              {userName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Premium User
            </Typography>
          </UserProfile>

          <List sx={{ px: 1, py: 2 }}>
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                button
                active={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </NavItem>
            ))}
          </List>
        </ModernDrawer>

        <ModernDrawer
          variant="permanent"
          sx={{ display: { xs: "none", sm: "block" } }}
          open
        >
          <UserProfile>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: "0 auto 16px",
                bgcolor: "#667eea",
              }}
            >
              {userName.charAt(0)}
            </Avatar>
            <Typography variant="h6" fontWeight="600">
              {userName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Premium User
            </Typography>
          </UserProfile>

          <List sx={{ px: 1, py: 2 }}>
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                button
                active={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </NavItem>
            ))}
          </List>
        </ModernDrawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "70px",
        }}
      >
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatsCard
                color={stat.color}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: `${stat.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        bgcolor: stat.trend === "up" ? "#dcfce7" : "#fef2f2",
                        color: stat.trend === "up" ? "#16a34a" : "#dc2626",
                        fontWeight: 600,
                      }}
                      icon={
                        stat.trend === "up" ? (
                          <ArrowUpward />
                        ) : (
                          <ArrowDownward />
                        )
                      }
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Application Trends Chart */}
          <Grid item xs={12} lg={8}>
            <ChartCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight="600">
                    Application Trends
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Chip label="6 months" size="small" variant="outlined" />
                    <Chip label="This year" size="small" />
                  </Box>
                </Box>
                <Box sx={{ height: 300 }}>
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
                        <linearGradient
                          id="colorApproved"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
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
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorApplications)"
                        name="Applications"
                      />
                      <Area
                        type="monotone"
                        dataKey="approved"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorApproved)"
                        name="Approved"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </ChartCard>
          </Grid>

          {/* License Types Distribution */}
          <Grid item xs={12} lg={4}>
            <ChartCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                  License Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={licenseTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {licenseTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {licenseTypeData.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="600">
                        {item.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Additional Analytics */}
        <Grid container spacing={3}>
          {/* Exam Results Chart */}
          <Grid item xs={12} md={6}>
            <ChartCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                  Exam Results
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={examResultsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="passed"
                        fill="#10b981"
                        name="Passed"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="failed"
                        fill="#ef4444"
                        name="Failed"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </ChartCard>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <ChartCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                  Recent Activity
                </Typography>
                <Box sx={{ height: 250, overflowY: "auto" }}>
                  {[
                    {
                      action: "New application submitted",
                      time: "2 minutes ago",
                      type: "application",
                    },
                    {
                      action: "License approved for John Smith",
                      time: "15 minutes ago",
                      type: "approval",
                    },
                    {
                      action: "Exam scheduled for tomorrow",
                      time: "1 hour ago",
                      type: "exam",
                    },
                    {
                      action: "Payment received",
                      time: "2 hours ago",
                      type: "payment",
                    },
                    {
                      action: "Document uploaded",
                      time: "3 hours ago",
                      type: "document",
                    },
                    {
                      action: "Profile updated",
                      time: "5 hours ago",
                      type: "profile",
                    },
                  ].map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        p: 2,
                        borderRadius: "8px",
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor:
                            activity.type === "approval"
                              ? "#10b981"
                              : activity.type === "exam"
                              ? "#3b82f6"
                              : activity.type === "payment"
                              ? "#f59e0b"
                              : "#64748b",
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>
      </Box>
    </MainContainer>
  );
};

export default ProfessionalDashboard;
