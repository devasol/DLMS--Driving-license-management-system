import React, { useState, useEffect, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Drawer,
  ListItemIcon,
  CssBaseline,
  Collapse,
  TextField,
  MenuItem,
  InputAdornment,
  Menu as MuiMenu,
  Paper,
  Alert,
  LinearProgress,
  CircularProgress,
  Fab,
  Tooltip,
  Switch,
  FormControlLabel,
  Skeleton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Notifications,
  Mail,
  Menu as MenuIcon,
  CheckCircle,
  Error,
  FileDownload,
  Schedule,
  Payment,
  Gavel,
  Refresh,
  Person,
  CameraAlt,
  DirectionsCar,
  Home,
  HowToReg,
  School,
  History,
  Settings,
  ExpandMore,
  ExpandLess,
  Assignment,
  ContactSupport,
  ExitToApp,
  HelpOutline as Help,
  Delete,
  Close,
  Edit,
  Logout,
  Visibility,
  VisibilityOff,
  Quiz,
  DarkMode,
  LightMode,
  Speed,
  TrendingUp,
  Timeline,
  Analytics,
  Dashboard as DashboardIcon,
  Add,
  NavigateNext,
  DriveEta,
  CardMembership,
  ArrowForward,
  Warning,
  CloudUpload,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { styled, keyframes } from "@mui/system";
// Performance optimizations applied via CSS classes
import axios from "axios";
import LicenseApplication from "../LicenseApplication/LicenseApplication";
import ExamSchedule from "../ExamSchedule/ExamSchedule";
import ApplicationStatus from "../ApplicationStatus/ApplicationStatus";
import TrialExam from "../TrialExam/TrialExam";
import AvailableExams from "../AvailableExams/AvailableExams";
import PracticalExamResults from "../PracticalExamResults/PracticalExamResults";
import GetLicense from "../GetLicense/GetLicense";
import LicenseReplacement from "../LicenseReplacement/LicenseReplacement";
import ViolationsSection from "../ViolationsSection/ViolationsSection";
import HistorySection from "../HistorySection/HistorySection";
import LicenseRenewal from "../LicenseRenewal/LicenseRenewal";
import SettingsComponent from "../Settings/Settings";
import SupportComponent from "../Support/Support";
// import NewsFeed from "../NewsFeed/NewsFeed"; // Removed - moved to home page
import { useNavigate } from "react-router-dom";

// Keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const floatParticles = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-15px) translateX(5px) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) translateX(-5px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-20px) translateX(3px) rotate(270deg);
    opacity: 0.9;
  }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Enhanced styled components with glassmorphism and modern design
const GlassCard = styled(motion(Card))(({ theme, variant = "default" }) => ({
  borderRadius: "20px",
  background:
    variant === "glass"
      ? "rgba(255, 255, 255, 0.1)"
      : "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow:
    variant === "glass"
      ? "0 8px 32px rgba(0, 0, 0, 0.1)"
      : "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow:
      "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    background:
      variant === "glass"
        ? "rgba(255, 255, 255, 0.15)"
        : "linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9))",
  },
}));

const AnimatedCard = styled(GlassCard)`
  cursor: pointer;
  &:active {
    transform: translateY(-4px) scale(0.98);
  }
`;

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: "bold",
  padding: theme.spacing(0.5, 1.5),
  borderRadius: "20px",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    transition: "left 0.5s",
  },
  "&:hover::before": {
    left: "100%",
  },
  ...(status === "Valid" && {
    background: "linear-gradient(135deg, #4caf50, #66bb6a)",
    color: "white",
    boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
  }),
  ...(status === "Expired" && {
    background: "linear-gradient(135deg, #f44336, #ef5350)",
    color: "white",
    boxShadow: "0 4px 15px rgba(244, 67, 54, 0.3)",
  }),
  ...(status === "Pending" && {
    background: "linear-gradient(135deg, #ff9800, #ffb74d)",
    color: "white",
    boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
  }),
}));

const GradientBackground = styled(Box)({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  backgroundSize: "400% 400%",
  animation: `${gradientShift} 20s ease infinite`,
  minHeight: "100vh",
  position: "relative",
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
    animation: `${gradientShift} 12s ease-in-out infinite`,
    opacity: 0.6,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>\')',
    opacity: 0.4,
    pointerEvents: "none",
  },
});

// Enhanced modern card components
const ModernCard = styled(motion(Card))(({ theme }) => ({
  background:
    "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(245, 247, 250, 0.9))",
  backdropFilter: "blur(25px)",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)",
    "&::before": {
      opacity: 1,
    },
  },
}));

const StatsCard = styled(ModernCard)(({ theme }) => ({
  cursor: "default",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05)",
  },
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
  animation: `${float} 3s ease-in-out infinite`,
  "&:hover": {
    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
    transform: "scale(1.1)",
    boxShadow: "0 12px 35px rgba(102, 126, 234, 0.6)",
  },
}));

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const ModernSidebar = styled(Drawer)(({ theme, collapsed }) => ({
  width: collapsed ? collapsedDrawerWidth : drawerWidth,
  flexShrink: 0,
  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "& .MuiDrawer-paper": {
    width: collapsed ? collapsedDrawerWidth : drawerWidth,
    boxSizing: "border-box",
    background:
      "linear-gradient(180deg, rgba(245, 247, 250, 0.98) 0%, rgba(195, 207, 226, 0.95) 100%)",
    backdropFilter: "blur(25px)",
    border: "none",
    borderRight: "none",
    boxShadow: "none",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "auto",
    overflowX: "hidden",
    // Hide scrollbar completely
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
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(240, 147, 251, 0.05) 0%, transparent 50%)
      `,
      pointerEvents: "none",
      zIndex: 0,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "3px",
      height: "100%",
      background: "linear-gradient(180deg, #667eea, #764ba2, #f093fb)",
      opacity: 0.8,
      zIndex: 1,
    },
    "& > *": {
      position: "relative",
      zIndex: 2,
    },
  },
}));

const RightSidebar = styled(Paper)(({ theme }) => ({
  width: 280, // Slightly reduced width for better content space
  height: "calc(100vh - 80px)",
  position: "fixed",
  right: 0,
  top: 80,
  padding: theme.spacing(2.5), // Reduced padding
  paddingTop: theme.spacing(2),
  background:
    "linear-gradient(180deg, rgba(245, 247, 250, 0.98) 0%, rgba(195, 207, 226, 0.95) 100%)",
  backdropFilter: "blur(25px)",
  borderLeft: "none",
  overflowY: "auto",
  // Hide scrollbar completely
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
  boxShadow: "none",
  zIndex: 1000,
  [theme.breakpoints.down("xl")]: {
    display: "none", // Hide on screens smaller than xl (1536px)
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: "3px",
    height: "100%",
    background: "linear-gradient(180deg, #667eea, #764ba2, #f093fb)",
    opacity: 0.8,
  },
  [theme.breakpoints.down("lg")]: {
    position: "relative",
    width: "100%",
    height: "auto",
    marginTop: theme.spacing(2),
    borderLeft: "none",
    borderTop: "none",
    borderRadius: "20px 20px 0 0",
  },
}));

const ProfilePicture = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: "50%",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  position: "relative",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "3px",
  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
  "& img": {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid white",
    display: "block",
  },
}));

const ProgressRing = styled(Box)(
  ({ theme, progress = 0, color = "#667eea" }) => ({
    position: "relative",
    width: "80px",
    height: "80px",
    margin: "0 auto",
    "& .progress-ring": {
      transform: "rotate(-90deg)",
    },
    "& .progress-ring__circle": {
      stroke: color,
      strokeLinecap: "round",
      strokeWidth: "4",
      fill: "transparent",
      strokeDasharray: `${progress * 2.51} 251.2`,
      transition: "stroke-dasharray 0.5s ease-in-out",
    },
    "& .progress-ring__background": {
      stroke: "rgba(0, 0, 0, 0.1)",
      strokeWidth: "4",
      fill: "transparent",
    },
  })
);

const NotificationItem = styled(motion(Box))(({ theme, isUnread }) => ({
  padding: theme.spacing(1.5),
  borderRadius: "12px",
  marginBottom: theme.spacing(1),
  background: isUnread
    ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))"
    : "rgba(255, 255, 255, 0.5)",
  border: `1px solid ${
    isUnread ? "rgba(102, 126, 234, 0.2)" : "rgba(255, 255, 255, 0.3)"
  }`,
  backdropFilter: "blur(10px)",
  cursor: "pointer",
  position: "relative",
  "&:hover": {
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
    transform: "translateX(4px)",
  },
}));

const Dashboard = () => {
  // Ensure no body margins/padding
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";

    // Add global scrollbar hiding styles
    const style = document.createElement("style");
    style.textContent = `
      /* Hide scrollbars globally and prevent horizontal overflow */
      * {
        scrollbar-width: none !important; /* Firefox */
        -ms-overflow-style: none !important; /* IE and Edge */
        overflow-x: hidden !important; /* Hide horizontal overflow globally */
      }
      *::-webkit-scrollbar {
        display: none !important; /* Chrome, Safari, Opera */
      }
      *::-webkit-scrollbar-track {
        display: none !important;
      }
      *::-webkit-scrollbar-thumb {
        display: none !important;
      }
      body, html {
        overflow-x: hidden !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.overflow = "auto";
      document.head.removeChild(style);
    };
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const [applicationStatus, setApplicationStatus] = useState(null);
  const [examSchedule, setExamSchedule] = useState(null);
  const [renewalStatus, setRenewalStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [examData, setExamData] = useState({
    type: "theory",
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  const [renewalDialog, setRenewalDialog] = useState(false);
  const [renewalData, setRenewalData] = useState({
    reason: "",
    documents: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplicationStatus, setShowApplicationStatus] = useState(false);
  const [showTrialExam, setShowTrialExam] = useState(false);
  const [showAvailableExams, setShowAvailableExams] = useState(false);
  const [showPracticalExamResults, setShowPracticalExamResults] =
    useState(false);
  const [showGetLicense, setShowGetLicense] = useState(false);
  const [showViolations, setShowViolations] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [showReplacementForm, setShowReplacementForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  // Removed showNewsFeed state - news feed moved to home page
  const [userProfile, setUserProfile] = useState({
    fullName: localStorage.getItem("userName") || "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    nic: "",
    nationality: "",
    bloodType: "",
    profilePicture: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = React.useRef(null);

  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [canScheduleExam, setCanScheduleExam] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userNotifications, setUserNotifications] = useState([]);

  // License state
  const [userLicense, setUserLicense] = useState(null);
  const [hasLicense, setHasLicense] = useState(false);

  // Enhanced state for new features
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    completedExams: 0,
    pendingTasks: 0,
    licenseScore: 85,
  });

  const navigate = useNavigate();

  // Utility functions for UI (removing duplicates, keeping the ones defined later in the file)

  // Optimized animation variants for better performance
  const pageVariants = {
    initial: { opacity: 0, y: 10, transform: "translate3d(0, 10px, 0)" },
    in: { opacity: 1, y: 0, transform: "translate3d(0, 0, 0)" },
    out: { opacity: 0, y: -10, transform: "translate3d(0, -10px, 0)" },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.3, // Reduced from 0.5 for better performance
  };

  // Utility functions
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("dlms-theme", !isDarkMode ? "dark" : "light");
  };

  const triggerAnimation = () => {
    setAnimationKey((prev) => prev + 1);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };

  // Enhanced loading and initialization
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);

      const storedUser = localStorage.getItem("userName");
      const storedUserId = localStorage.getItem("userId");
      const userType = localStorage.getItem("userType");
      const savedTheme = localStorage.getItem("dlms-theme");

      // Set theme
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }

      console.log("Dashboard initialization:", {
        storedUser,
        storedUserId,
        userType,
      });

      // Check for inconsistent data - if userName is "Administrator" but userType is not "admin"
      if (storedUser === "Administrator" && userType !== "admin") {
        console.warn("Inconsistent user data detected - clearing localStorage");
        localStorage.clear();
        navigate("/signin");
        return;
      }

      // Check if this is actually a user (not admin) session
      if (userType === "admin") {
        console.error("Admin user trying to access user dashboard");
        navigate("/admin/dashboard");
        return;
      }

      // If no userType is set, assume it's a user (for backward compatibility)
      if (!userType && storedUser && storedUserId) {
        console.log(
          "No userType found, setting to 'user' for backward compatibility"
        );
        localStorage.setItem("userType", "user");
      }

      if (!storedUser || !storedUserId) {
        console.error("No user information found in localStorage");
        navigate("/signin");
        return;
      }

      // Set initial user name from localStorage
      setUserName(storedUser);
      setUserId(storedUserId);

      console.log("Setting initial userName:", storedUser);

      try {
        // Fetch all data concurrently for better performance
        await Promise.all([
          fetchUserProfile(),
          fetchNotifications(storedUserId),
          checkUserLicense(),
          fetchApplicationStatus(),
        ]);
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        // Reduced loading delay for faster perceived performance
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Reduced from 1000ms to 500ms
      }
    };

    initializeDashboard();
  }, [navigate]);

  const fetchApplicationStatus = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("No user ID found for application status check");
        return;
      }

      console.log("🔄 Fetching application status for user:", userId);
      console.log(
        "🔄 API URL:",
        `http://localhost:5004/api/license/applications/user/${userId}`
      );

      const response = await axios.get(
        `http://localhost:5004/api/license/applications/user/${userId}`
      );

      console.log("📥 Raw API response:", response);
      console.log("📥 Application data:", response.data);

      if (response.data && response.data.length > 0) {
        // Sort applications by date (most recent first)
        const sortedApplications = response.data.sort(
          (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
        );

        // Get the most recent application
        const mostRecentApplication = sortedApplications[0];

        console.log("🎯 Most recent application:", mostRecentApplication);
        console.log("🎯 Application status:", mostRecentApplication.status);
        console.log("🎯 Status message:", mostRecentApplication.statusMessage);
        console.log("🎯 Last updated:", mostRecentApplication.lastUpdated);

        // Set hasActiveApplication to true if there's any application (not just pending/under_review)
        setHasActiveApplication(!!mostRecentApplication);
        setApplicationStatus(mostRecentApplication);

        // Check if user can schedule exam (application must be approved)
        const canSchedule = mostRecentApplication.status === "approved";
        setCanScheduleExam(canSchedule);

        console.log("✅ Updated state:", {
          hasActiveApplication: !!mostRecentApplication,
          applicationStatus: mostRecentApplication,
          statusInState: mostRecentApplication.status,
          canScheduleExam: canSchedule,
          isApproved: mostRecentApplication.status === "approved",
        });
      } else {
        console.log("No applications found for user");
        setHasActiveApplication(false);
        setApplicationStatus(null);
        setCanScheduleExam(false);
      }
    } catch (error) {
      console.error("Error fetching application status:", error);
      setHasActiveApplication(false);
      setApplicationStatus(null);
      setCanScheduleExam(false);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5004/api/notifications/user/${userId}`
      );
      if (response.data && Array.isArray(response.data)) {
        setUserNotifications(response.data);
        const unread = response.data.filter(
          (notification) => !notification.seen
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setUserNotifications([]);
      setUnreadCount(0);
    }
  };

  const markNotificationAsSeen = async (notificationId) => {
    try {
      await axios.patch(
        `http://localhost:5004/api/notifications/${notificationId}/seen`
      );
      setUserNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, seen: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5004/api/notifications/${notificationId}`
      );
      setUserNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
      const deletedNotification = userNotifications.find(
        (n) => n._id === notificationId
      );
      if (deletedNotification && !deletedNotification.seen) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleRenewalSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5003/api/license/renew",
        renewalData
      );
      if (response.data.success) {
        setLicenseData((prev) => ({
          ...prev,
          expiryDate: response.data.newExpiryDate,
        }));
        setRenewalDialog(false);
      }
    } catch (error) {
      console.error("Error submitting renewal:", error);
    }
  };

  const refreshData = () => {
    fetchApplicationStatus();
    checkUserLicense();
    setLastRefreshed(new Date());
  };

  // Function to check if user has a license
  const checkUserLicense = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("No user ID found for license check");
        return;
      }

      console.log("🔍 Checking if user has a license...");

      // Use the status endpoint (most reliable and complete)
      try {
        const statusResponse = await axios.get(
          `http://localhost:5004/api/license/status?userId=${userId}`
        );

        console.log("🔍 License status response:", statusResponse.data);

        if (
          statusResponse.data &&
          statusResponse.data.success &&
          statusResponse.data.hasLicense
        ) {
          console.log("✅ User has a license:", statusResponse.data.number);

          setHasLicense(true);
          setUserLicense({
            number: statusResponse.data.number,
            status: statusResponse.data.status,
            class: statusResponse.data.class,
            userName: statusResponse.data.userName,
            userEmail: statusResponse.data.userEmail,
            issueDate: statusResponse.data.issueDate,
            expiryDate: statusResponse.data.expiryDate,
          });

          // If user has license, they shouldn't see application form
          setHasActiveApplication(false);
          setApplicationStatus(null);
        } else {
          console.log("📋 User does not have a license");
          setHasLicense(false);
          setUserLicense(null);
        }
      } catch (statusError) {
        console.log(
          "Status endpoint failed, trying debug endpoint:",
          statusError.message
        );

        // Try the debug endpoint as fallback
        try {
          const debugResponse = await axios.get(
            `http://localhost:5004/api/license/debug/user/${userId}`
          );

          if (debugResponse.data && debugResponse.data.licenseExists) {
            console.log(
              "✅ User has a license (from debug endpoint):",
              debugResponse.data.licenseNumber
            );

            setHasLicense(true);
            setUserLicense({
              number: debugResponse.data.licenseNumber,
              status: debugResponse.data.licenseStatus,
              class: debugResponse.data.licenseClass || "B",
              userName: debugResponse.data.userName,
              userEmail: debugResponse.data.userEmail,
              issueDate: debugResponse.data.issueDate
                ? new Date(debugResponse.data.issueDate).toLocaleDateString()
                : "N/A",
              expiryDate: debugResponse.data.expiryDate
                ? new Date(debugResponse.data.expiryDate).toLocaleDateString()
                : "N/A",
            });
            setHasActiveApplication(false);
            setApplicationStatus(null);
          } else {
            console.log(
              "📋 User does not have a license (from debug endpoint)"
            );
            setHasLicense(false);
            setUserLicense(null);
          }
        } catch (debugError) {
          console.log("Debug endpoint also failed:", debugError.message);
          // Assume no license if both endpoints fail
          setHasLicense(false);
          setUserLicense(null);
        }
      }
    } catch (error) {
      console.error("Error checking user license:", error);
      setHasLicense(false);
      setUserLicense(null);
    }
  };

  const cancelApplication = async (applicationId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5003/api/license/applications/${applicationId}`
      );

      if (response.data && response.data.success) {
        // Refresh application status after cancellation
        setHasActiveApplication(false);
        setApplicationStatus(null);
        fetchApplicationStatus();

        // Show success message
        setSuccessMessage({
          type: "success",
          message: "Application cancelled successfully!",
        });

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error(
          response.data?.message || "Failed to cancel application"
        );
      }
    } catch (error) {
      console.error("Error cancelling application:", error);
      setSuccessMessage({
        type: "error",
        message:
          error.response?.data?.message || "Failed to cancel application",
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  // Exam scheduling function
  const scheduleExam = async (data) => {
    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");

      if (!userId || !userName) {
        throw new Error("User information not found");
      }

      const response = await axios.post(
        "http://localhost:5004/api/exams/schedule",
        {
          userId,
          userName,
          examType: data.type,
          date: data.date,
          time: data.time,
          location:
            data.type === "practical"
              ? data.location || "Kality, Addis Ababa"
              : "online",
          notes: data.notes,
        }
      );

      if (response.data.success) {
        return {
          success: true,
          confirmationNumber: `EX-${Date.now()}`,
          type: data.type,
          date: data.date,
          time: data.time,
          location: data.location,
        };
      } else {
        throw new Error(response.data.message || "Failed to schedule exam");
      }
    } catch (error) {
      console.error("Error scheduling exam:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to schedule exam",
      };
    }
  };

  const renewLicense = async () => {
    // In a real app, this would call your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          newExpiryDate: "15/06/2035",
        });
      }, 800);
    });
  };

  // Handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubMenuToggle = () => {
    setOpenSubMenu(!openSubMenu);
  };

  const handleScheduleExam = async () => {
    // Check if user can schedule exam
    if (!canScheduleExam) {
      // Close dialog first, then show error outside
      setOpenExamDialog(false);
      setSuccessMessage({
        type: "error",
        message:
          "You can only schedule an exam after your license application has been approved by an admin.",
      });
      setTimeout(() => setSuccessMessage(null), 5000);
      return;
    }

    if (!examData.date) {
      setOpenExamDialog(false);
      setSuccessMessage({
        type: "error",
        message: "Please select a date for your exam.",
      });
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    if (!examData.time) {
      setOpenExamDialog(false);
      setSuccessMessage({
        type: "error",
        message: "Please select a time for your exam.",
      });
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    const result = await scheduleExam(examData);

    if (result.success) {
      setExamSchedule(result);
      setOpenExamDialog(false);

      // Show success message
      setSuccessMessage({
        type: "success",
        message: "Exam scheduled successfully!",
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // Trigger refresh of the exam schedule
      window.dispatchEvent(new Event("refresh-exam-schedule"));
    } else {
      // Close dialog first, then show error message outside
      setOpenExamDialog(false);
      setSuccessMessage({
        type: "error",
        message: result.message || "Failed to schedule exam. Please try again.",
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };

  const handleRenewLicense = () => {
    // Reset all other views
    setShowApplicationForm(false);
    setShowApplicationStatus(false);
    setShowTrialExam(false);
    setShowAvailableExams(false);
    setShowPracticalExamResults(false);
    setShowGetLicense(false);
    setShowViolations(false);
    setShowHistory(false);
    setShowReplacementForm(false);
    setShowSettings(false);
    setShowSupport(false);

    // Show renewal form
    setShowRenewalForm(true);
  };

  const handleReplaceLicense = () => {
    // Reset all other views
    setShowApplicationForm(false);
    setShowApplicationStatus(false);
    setShowTrialExam(false);
    setShowAvailableExams(false);
    setShowPracticalExamResults(false);
    setShowGetLicense(false);
    setShowViolations(false);
    setShowHistory(false);
    setShowRenewalForm(false);
    setShowSettings(false);
    setShowSupport(false);

    // Show replacement form
    setShowReplacementForm(true);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleUpdateInformation = () => {
    setShowProfileDialog(true);
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setUserName("");
    setUserId("");
    setShowLogoutDialog(false);
    window.location.href = "/";
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Optimized fetchUserProfile function with useCallback for better performance
  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      console.log("Fetching user profile for userId:", userId);

      const response = await axios.get(
        `http://localhost:5004/api/users/${userId}`
      );

      console.log("User profile response:", response.data);

      if (response.data) {
        const actualUserName =
          response.data.fullName ||
          response.data.full_name ||
          response.data.name ||
          response.data.firstName ||
          localStorage.getItem("userName") ||
          "";

        console.log("Extracted actualUserName:", actualUserName);

        // Format date of birth for display
        const formatDateForInput = (date) => {
          if (!date) return "";
          const d = new Date(date);
          return d.toISOString().split("T")[0]; // YYYY-MM-DD format
        };

        // Update both the profile state and the userName state with all available fields
        setUserProfile((prev) => ({
          ...prev,
          fullName: actualUserName,
          email: response.data.email || response.data.user_email || "",
          phone: response.data.phone || response.data.contact_no || "",
          address: response.data.address || "",
          dateOfBirth: formatDateForInput(
            response.data.dateOfBirth || response.data.dob
          ),
          gender: response.data.gender || "",
          nic: response.data.nic || "",
          nationality: response.data.nationality || "",
          bloodType: response.data.bloodType || "",
          profilePicture: response.data.profilePicture || null,
        }));

        // Update the userName state with the actual name from database
        if (actualUserName && actualUserName !== "Administrator") {
          console.log(
            "Updating userName from",
            localStorage.getItem("userName"),
            "to",
            actualUserName
          );
          setUserName(actualUserName);
          // Also update localStorage with the correct name
          localStorage.setItem("userName", actualUserName);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Set default values if API fails
      const fallbackName = localStorage.getItem("userName") || "";
      console.log("Using fallback name:", fallbackName);
      setUserProfile((prev) => ({
        ...prev,
        fullName: fallbackName,
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
      }));
    }
  }, []); // Empty dependency array since it only uses localStorage

  // Update the notifications display to fix nested p tags
  const renderNotificationContent = (notification) => (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: notification.seen ? "normal" : "bold" }}
        >
          {notification.title}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification._id);
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {notification.message}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5 }}
        >
          {new Date(notification.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Box>
  );

  // Update useEffect to check license status and application status
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const response = await axios.get(
            `http://localhost:5004/api/users/${userId}`
          );
          if (response.data) {
            setUserProfile((prev) => ({
              ...prev,
              ...response.data,
              fullName:
                response.data.fullName ||
                localStorage.getItem("userName") ||
                "",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile((prev) => ({
          ...prev,
          fullName: localStorage.getItem("userName") || "",
        }));
      }
    };
    fetchUserProfile();
    checkUserLicense();
    fetchApplicationStatus(); // Also fetch application status on mount
  }, []);

  // Debug userProfile changes
  useEffect(() => {
    console.log("🔍 USERPROFILE CHANGED:", userProfile);
    console.log("🔍 PROFILE PICTURE:", userProfile.profilePicture);
    if (userProfile.profilePicture) {
      console.log(
        "🔍 FULL IMAGE URL:",
        `http://localhost:5004/uploads/profile-pictures/${userProfile.profilePicture}`
      );
    }
  }, [userProfile]);

  // Add event listener for license registration
  useEffect(() => {
    const handleLicenseRegistration = () => {
      console.log(
        "License registration event received - refreshing license and application status"
      );
      checkUserLicense(); // Check if user now has a license
      fetchApplicationStatus(); // Also refresh application status
    };

    window.addEventListener("license-registered", handleLicenseRegistration);
    return () => {
      window.removeEventListener(
        "license-registered",
        handleLicenseRegistration
      );
    };
  }, []);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setSuccessMessage({
          type: "error",
          message: "Please select a valid image file (JPG, JPEG, PNG, or GIF).",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setSuccessMessage({
          type: "error",
          message: "File size must be less than 5MB.",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      // Set the file for upload and create preview
      setProfilePicture(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("No user ID found");
          setSuccessMessage({
            type: "error",
            message: "User session not found. Please login again.",
          });
          setTimeout(() => setSuccessMessage(null), 3000);
          return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("profilePicture", file);

        console.log("Uploading profile picture...", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          userId: userId,
        });

        // Upload to backend
        const response = await axios.post(
          `http://localhost:5004/api/users/${userId}/profile-picture`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          console.log("Profile picture uploaded successfully:", response.data);

          // Update local state with the new profile picture
          setUserProfile((prev) => ({
            ...prev,
            profilePicture: response.data.profilePicture,
          }));

          // Clear the preview since we now have the uploaded image
          setProfilePicturePreview(null);

          // Show success message
          setSuccessMessage({
            type: "success",
            message: "Profile picture updated successfully!",
          });

          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);

          // Refresh the profile data to ensure consistency
          await fetchUserProfile();
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);

        // Get more specific error message
        let errorMessage =
          "Failed to upload profile picture. Please try again.";

        if (error.response) {
          // Server responded with error status
          console.error("Server error:", error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          // Request was made but no response received
          console.error("Network error:", error.request);
          errorMessage = "Network error. Please check your connection.";
        } else {
          // Something else happened
          console.error("Error:", error.message);
          errorMessage = error.message || errorMessage;
        }

        setSuccessMessage({
          type: "error",
          message: errorMessage,
        });

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setSuccessMessage({
          type: "error",
          message: "User session not found. Please login again.",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      // Prepare the data to send to the backend - only send non-empty fields
      const updateData = {};

      if (userProfile.fullName?.trim()) {
        updateData.fullName = userProfile.fullName.trim();
        updateData.full_name = userProfile.fullName.trim(); // Support both naming conventions
      }

      if (userProfile.email?.trim()) {
        updateData.email = userProfile.email.trim();
        updateData.user_email = userProfile.email.trim();
      }

      if (userProfile.phone?.trim()) {
        updateData.phone = userProfile.phone.trim();
        updateData.contact_no = userProfile.phone.trim();
      }

      if (userProfile.address?.trim()) {
        updateData.address = userProfile.address.trim();
      }

      if (userProfile.dateOfBirth) {
        updateData.dateOfBirth = userProfile.dateOfBirth;
        updateData.dob = userProfile.dateOfBirth;
      }

      if (userProfile.gender) {
        updateData.gender = userProfile.gender;
      }

      if (userProfile.nic?.trim()) {
        updateData.nic = userProfile.nic.trim();
      }

      if (userProfile.nationality?.trim()) {
        updateData.nationality = userProfile.nationality.trim();
      }

      if (userProfile.bloodType) {
        updateData.bloodType = userProfile.bloodType;
      }

      console.log("Updating user profile with data:", updateData);

      const response = await axios.put(
        `http://localhost:5004/api/users/${userId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile update response:", response.data);

      if (response.data && response.status === 200) {
        // Update localStorage with new name if changed
        if (userProfile.fullName) {
          localStorage.setItem("userName", userProfile.fullName);
          setUserName(userProfile.fullName);
        }

        // Show success message
        setSuccessMessage({
          type: "success",
          message: "Profile updated successfully!",
        });

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        // Refresh the profile data to get the latest from server
        await fetchUserProfile();

        // Don't close dialog immediately - let user see success message
        // Dialog will be closed manually or after timeout
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", error.response?.data);

      // Get more specific error message
      let errorMessage = "Failed to update profile. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "User not found. Please login again.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      }

      // Show error message
      setSuccessMessage({
        type: "error",
        message: errorMessage,
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      // Validate password fields
      if (!passwordData.currentPassword) {
        setSuccessMessage({
          type: "error",
          message: "Please enter your current password.",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      if (!passwordData.newPassword) {
        setSuccessMessage({
          type: "error",
          message: "Please enter a new password.",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setSuccessMessage({
          type: "error",
          message: "New passwords do not match.",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setSuccessMessage({
          type: "error",
          message: "New password must be at least 6 characters long.",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      const userId = localStorage.getItem("userId");
      const response = await axios.put(
        `http://localhost:5004/api/users/${userId}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      );

      if (response.data.success) {
        setSuccessMessage({
          type: "success",
          message: "Password updated successfully!",
        });
        setTimeout(() => setSuccessMessage(null), 3000);

        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      let errorMessage = "Failed to update password. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setSuccessMessage({
        type: "error",
        message: errorMessage,
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Enhanced Sidebar navigation items
  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          minHeight: "70px !important",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
          },
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          <DirectionsCar sx={{ mr: sidebarCollapsed ? 0 : 2, fontSize: 32 }} />
          {!sidebarCollapsed && (
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              DLMS
            </Typography>
          )}
        </motion.div>
      </Toolbar>
      <Box sx={{ flex: 1, p: sidebarCollapsed ? 1 : 2 }}>
        {!sidebarCollapsed && (
          <Typography
            variant="caption"
            sx={{
              color: "rgba(0, 0, 0, 0.6)",
              fontWeight: "bold",
              mb: 2,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Main Menu
          </Typography>
        )}
        <List
          sx={{
            "& .MuiListItemButton-root": {
              borderRadius: "12px",
              mb: 1,
              cursor: "pointer",
            },
          }}
        >
          <motion.div
            whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip
              title={sidebarCollapsed ? "Dashboard" : ""}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  setShowApplicationForm(false);
                  setShowApplicationStatus(false);
                  setShowTrialExam(false);
                  setShowAvailableExams(false);
                  setShowPracticalExamResults(false);
                  setShowGetLicense(false);
                  setShowViolations(false);
                  setShowHistory(false);
                  setShowRenewalForm(false);
                  setShowReplacementForm(false);
                  setShowSettings(false);
                  setShowSupport(false);
                  // setShowNewsFeed(false); // Removed
                  setCurrentPage("dashboard");
                  window.scrollTo(0, 0);
                }}
                selected={
                  !showApplicationForm &&
                  !showApplicationStatus &&
                  !showTrialExam &&
                  !showAvailableExams &&
                  !showPracticalExamResults &&
                  !showGetLicense &&
                  !showViolations &&
                  !showHistory &&
                  !showRenewalForm
                }
                sx={{
                  background:
                    !showApplicationForm &&
                    !showApplicationStatus &&
                    !showTrialExam &&
                    !showAvailableExams &&
                    !showPracticalExamResults &&
                    !showGetLicense &&
                    !showViolations &&
                    !showHistory &&
                    !showRenewalForm
                      ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))"
                      : "transparent",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
                  },
                  border:
                    !showApplicationForm &&
                    !showApplicationStatus &&
                    !showTrialExam &&
                    !showAvailableExams &&
                    !showPracticalExamResults &&
                    !showGetLicense &&
                    !showViolations &&
                    !showHistory &&
                    !showRenewalForm
                      ? "1px solid rgba(102, 126, 234, 0.2)"
                      : "1px solid transparent",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  px: sidebarCollapsed ? 1 : 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? "auto" : "56px",
                    justifyContent: "center",
                  }}
                >
                  <DashboardIcon sx={{ color: "#667eea" }} />
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText
                    primary="Dashboard"
                    primaryTypographyProps={{
                      fontWeight:
                        !showApplicationForm &&
                        !showApplicationStatus &&
                        !showTrialExam &&
                        !showAvailableExams &&
                        !showPracticalExamResults &&
                        !showGetLicense &&
                        !showViolations &&
                        !showHistory &&
                        !showRenewalForm
                          ? "bold"
                          : "normal",
                      color:
                        !showApplicationForm &&
                        !showApplicationStatus &&
                        !showTrialExam &&
                        !showAvailableExams &&
                        !showPracticalExamResults &&
                        !showGetLicense &&
                        !showViolations &&
                        !showHistory &&
                        !showRenewalForm
                          ? "#667eea"
                          : "inherit",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </motion.div>

          <motion.div
            whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip
              title={sidebarCollapsed ? "Application Status" : ""}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  setShowApplicationForm(false);
                  setShowApplicationStatus(true);
                  setShowTrialExam(false);
                  setShowAvailableExams(false);
                  setShowPracticalExamResults(false);
                  setShowGetLicense(false);
                  setShowViolations(false);
                  setShowHistory(false);
                  setShowRenewalForm(false);
                  window.scrollTo(0, 0);
                }}
                selected={showApplicationStatus}
                sx={{
                  background: showApplicationStatus
                    ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))"
                    : "transparent",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
                  },
                  border: showApplicationStatus
                    ? "1px solid rgba(102, 126, 234, 0.2)"
                    : "1px solid transparent",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  px: sidebarCollapsed ? 1 : 2,
                  cursor: "pointer",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? "auto" : "56px",
                    justifyContent: "center",
                  }}
                >
                  <Assignment sx={{ color: "#667eea" }} />
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText
                    primary="Application Status"
                    primaryTypographyProps={{
                      fontWeight: showApplicationStatus ? "bold" : "normal",
                      color: showApplicationStatus ? "#667eea" : "inherit",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </motion.div>

          <motion.div
            whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip
              title={sidebarCollapsed ? "License Services" : ""}
              placement="right"
            >
              <ListItemButton
                onClick={handleSubMenuToggle}
                sx={{
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
                  },
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  px: sidebarCollapsed ? 1 : 2,
                  cursor: "pointer",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? "auto" : "56px",
                    justifyContent: "center",
                  }}
                >
                  <HowToReg sx={{ color: "#667eea" }} />
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <>
                    <ListItemText primary="License Services" />
                    {openSubMenu ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
            </Tooltip>
          </motion.div>
          <Collapse
            in={openSubMenu && !sidebarCollapsed}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {/* Only show Apply for New License if no active application */}
              {!hasActiveApplication && (
                <ListItemButton
                  sx={{ pl: 4, cursor: "pointer" }}
                  onClick={() => {
                    setShowApplicationForm(true);
                    setShowApplicationStatus(false);
                    setShowTrialExam(false);
                    setShowAvailableExams(false);
                    setShowPracticalExamResults(false);
                    setShowGetLicense(false);
                    setShowViolations(false);
                    setShowHistory(false);
                    setShowRenewalForm(false);
                    setShowReplacementForm(false);
                  }}
                >
                  <ListItemText primary="Apply for New License" />
                </ListItemButton>
              )}
              {/* Show Application Status if has active application */}
              {hasActiveApplication && (
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() => {
                    setShowApplicationStatus(true);
                    setShowApplicationForm(false);
                    setShowTrialExam(false);
                    setShowAvailableExams(false);
                    setShowPracticalExamResults(false);
                    setShowGetLicense(false);
                    setShowViolations(false);
                    setShowHistory(false);
                    setShowRenewalForm(false);
                    setShowReplacementForm(false);
                  }}
                >
                  <ListItemText primary="View Application Status" />
                </ListItem>
              )}
              <ListItemButton sx={{ pl: 4 }} onClick={handleRenewLicense}>
                <ListItemText primary="Renew License" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={handleReplaceLicense}>
                <ListItemText primary="Replace Lost License" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton onClick={() => setOpenExamDialog(true)}>
            <ListItemIcon>
              <School color="primary" />
            </ListItemIcon>
            <ListItemText primary="Schedule Exam" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              setShowApplicationForm(false);
              setShowApplicationStatus(false);
              setShowTrialExam(false);
              setShowAvailableExams(true);
              setShowPracticalExamResults(false);
              setShowGetLicense(false);
              setShowViolations(false);
              setShowHistory(false);
              setShowRenewalForm(false);
              setShowReplacementForm(false);
              window.scrollTo(0, 0);
            }}
            selected={showAvailableExams}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>
              <Assignment color="primary" />
            </ListItemIcon>
            <ListItemText primary="Available Exams" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              setShowApplicationForm(false);
              setShowApplicationStatus(false);
              setShowTrialExam(false);
              setShowAvailableExams(false);
              setShowPracticalExamResults(true);
              setShowGetLicense(false);
              setShowViolations(false);
              setShowHistory(false);
              setShowRenewalForm(false);
              setShowReplacementForm(false);
              window.scrollTo(0, 0);
            }}
            selected={showPracticalExamResults}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>
              <DriveEta color="primary" />
            </ListItemIcon>
            <ListItemText primary="Practical Exam Results" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              setShowApplicationForm(false);
              setShowApplicationStatus(false);
              setShowTrialExam(false);
              setShowAvailableExams(false);
              setShowPracticalExamResults(false);
              setShowGetLicense(true);
              setShowViolations(false);
              setShowHistory(false);
              setShowRenewalForm(false);
              setShowReplacementForm(false);
              window.scrollTo(0, 0);
            }}
            selected={showGetLicense}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>
              <CardMembership color="primary" />
            </ListItemIcon>
            <ListItemText primary="Get Your License" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              setShowApplicationForm(false);
              setShowApplicationStatus(false);
              setShowTrialExam(true);
              setShowAvailableExams(false);
              setShowPracticalExamResults(false);
              setShowGetLicense(false);
              setShowViolations(false);
              setShowHistory(false);
              setShowRenewalForm(false);
              setShowReplacementForm(false);
              window.scrollTo(0, 0);
            }}
            selected={showTrialExam}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>
              <Quiz color="primary" />
            </ListItemIcon>
            <ListItemText primary="Trial Exam" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              setShowApplicationForm(false);
              setShowApplicationStatus(false);
              setShowTrialExam(false);
              setShowAvailableExams(false);
              setShowPracticalExamResults(false);
              setShowGetLicense(false);
              setShowViolations(true);
              setShowHistory(false);
              setShowRenewalForm(false);
              setShowReplacementForm(false);
              window.scrollTo(0, 0);
            }}
            selected={showViolations}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>
              <Gavel color="primary" />
            </ListItemIcon>
            <ListItemText primary="Violations" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              setShowApplicationForm(false);
              setShowApplicationStatus(false);
              setShowTrialExam(false);
              setShowAvailableExams(false);
              setShowPracticalExamResults(false);
              setShowGetLicense(false);
              setShowViolations(false);
              setShowHistory(true);
              setShowRenewalForm(false);
              setShowReplacementForm(false);
              // setShowNewsFeed(false); // Removed
              window.scrollTo(0, 0);
            }}
            selected={showHistory}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>
              <History color="primary" />
            </ListItemIcon>
            <ListItemText primary="History" />
          </ListItemButton>

          {/* News Feed removed - moved to home page */}
        </List>

        {!sidebarCollapsed && (
          <Typography
            variant="caption"
            sx={{
              color: "rgba(0, 0, 0, 0.6)",
              fontWeight: "bold",
              mb: 2,
              mt: 3,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Quick Actions
          </Typography>
        )}
        <List
          sx={{
            "& .MuiListItemButton-root": {
              borderRadius: "12px",
              mb: 1,
              cursor: "pointer",
            },
          }}
        >
          <motion.div
            whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip
              title={sidebarCollapsed ? "Go to Homepage" : ""}
              placement="right"
            >
              <ListItemButton
                onClick={() => navigate("/")}
                sx={{
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  px: sidebarCollapsed ? 1 : 2,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
                  },
                  cursor: "pointer",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? "auto" : "56px",
                    justifyContent: "center",
                  }}
                >
                  <Home sx={{ color: "#667eea" }} />
                </ListItemIcon>
                {!sidebarCollapsed && <ListItemText primary="Go to Homepage" />}
              </ListItemButton>
            </Tooltip>
          </motion.div>

          <motion.div
            whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip
              title={sidebarCollapsed ? "Settings" : ""}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  setShowApplicationForm(false);
                  setShowApplicationStatus(false);
                  setShowTrialExam(false);
                  setShowAvailableExams(false);
                  setShowPracticalExamResults(false);
                  setShowGetLicense(false);
                  setShowViolations(false);
                  setShowHistory(false);
                  setShowRenewalForm(false);
                  setShowReplacementForm(false);
                  setShowSettings(true);
                  setShowSupport(false);
                  window.scrollTo(0, 0);
                }}
                selected={showSettings}
                sx={{
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  px: sidebarCollapsed ? 1 : 2,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
                  },
                  cursor: "pointer",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? "auto" : "56px",
                    justifyContent: "center",
                  }}
                >
                  <Settings sx={{ color: "#667eea" }} />
                </ListItemIcon>
                {!sidebarCollapsed && <ListItemText primary="Settings" />}
              </ListItemButton>
            </Tooltip>
          </motion.div>

          <motion.div
            whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip
              title={sidebarCollapsed ? "Support" : ""}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  setShowApplicationForm(false);
                  setShowApplicationStatus(false);
                  setShowTrialExam(false);
                  setShowAvailableExams(false);
                  setShowPracticalExamResults(false);
                  setShowGetLicense(false);
                  setShowViolations(false);
                  setShowHistory(false);
                  setShowRenewalForm(false);
                  setShowReplacementForm(false);
                  setShowSettings(false);
                  setShowSupport(true);
                  window.scrollTo(0, 0);
                }}
                selected={showSupport}
                sx={{
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  px: sidebarCollapsed ? 1 : 2,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
                  },
                  cursor: "pointer",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? "auto" : "56px",
                    justifyContent: "center",
                  }}
                >
                  <ContactSupport sx={{ color: "#667eea" }} />
                </ListItemIcon>
                {!sidebarCollapsed && <ListItemText primary="Support" />}
              </ListItemButton>
            </Tooltip>
          </motion.div>

          <motion.div
            whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip title={sidebarCollapsed ? "Logout" : ""} placement="right">
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  px: sidebarCollapsed ? 1 : 2,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(239, 83, 80, 0.1))",
                  },
                  cursor: "pointer",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? "auto" : "56px",
                    justifyContent: "center",
                  }}
                >
                  <ExitToApp sx={{ color: "#f44336" }} />
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{ color: "#f44336" }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </motion.div>
        </List>
      </Box>
    </Box>
  );

  // Loading screen component
  if (isLoading) {
    return (
      <GradientBackground>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: "white",
                mb: 3,
              }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: "bold",
                mb: 1,
                textAlign: "center",
              }}
            >
              Welcome to DLMS
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                textAlign: "center",
              }}
            >
              Loading your dashboard...
            </Typography>
          </motion.div>
        </Box>
      </GradientBackground>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        overflowX: "hidden",
        maxWidth: "100vw",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        // Hide all scrollbars
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
      <CssBaseline />

      {/* Enhanced App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            xs: "100%",
            sm: `calc(100% - ${
              sidebarCollapsed ? collapsedDrawerWidth : drawerWidth
            }px)`,
          },
          ml: {
            xs: 0,
            sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px`,
          },
          background: "rgba(245, 247, 250, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "none",
          color: "#333",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
          transition:
            "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Toolbar sx={{ minHeight: "80px !important" }}>
          {/* Mobile menu toggle */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop sidebar toggle */}
          <Tooltip
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <IconButton
              onClick={toggleSidebar}
              sx={{
                mr: 2,
                color: "#667eea",
                display: { xs: "none", sm: "flex" },
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* Breadcrumb Navigation */}
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                "& .MuiBreadcrumbs-separator": {
                  color: "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiBreadcrumbs-ol": { alignItems: "center" },
              }}
            >
              <Link
                underline="hover"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(0, 0, 0, 0.7)",
                  "&:hover": { color: "#667eea" },
                }}
                href="#"
              >
                <Home sx={{ mr: 0.5, fontSize: 20 }} />
                DLMS
              </Link>
              <Typography sx={{ color: "#333", fontWeight: "bold" }}>
                {currentPage === "dashboard"
                  ? "Dashboard"
                  : currentPage === "application"
                  ? "Application"
                  : currentPage === "exam"
                  ? "Exam"
                  : "Dashboard"}
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                mr: 1,
                color: "#667eea",
                position: "relative",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              <Badge
                badgeContent={unreadCount > 0 ? unreadCount : null}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    right: -3,
                    top: 6,
                    border: "2px solid white",
                    padding: "0 4px",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9px",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    zIndex: 9999,
                    backgroundColor: "#f44336",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(244, 67, 54, 0.4)",
                    position: "absolute",
                    transform: "none",
                  },
                }}
              >
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title="Toggle Theme">
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: "#667eea",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          {/* User Avatar */}
          {console.log("🔍 RENDERING AVATAR - userProfile:", userProfile)}
          {console.log(
            "🔍 RENDERING AVATAR - profilePicture:",
            userProfile.profilePicture
          )}
          {console.log("🔍 RENDERING AVATAR - userName:", userName)}
          <Tooltip title={`Welcome, ${userName} - Click for options`}>
            <Avatar
              onClick={handleProfileMenuOpen}
              src={
                userProfile.profilePicture
                  ? `http://localhost:5004/uploads/profile-pictures/${userProfile.profilePicture}`
                  : undefined
              }
              onError={() => {
                console.log("❌ Profile picture failed to load");
                console.log("❌ userProfile:", userProfile);
              }}
              onLoad={() => {
                console.log("✅ Profile picture loaded successfully!");
              }}
              sx={{
                ml: 2,
                background: userProfile.profilePicture
                  ? "#f5f5f5"
                  : "linear-gradient(135deg, #2c3e50, #34495e)",
                border: userProfile.profilePicture
                  ? "3px solid #2c3e50"
                  : "3px solid rgba(44, 62, 80, 0.8)",
                cursor: "pointer",
                color: userProfile.profilePicture ? "#2c3e50" : "#ffffff",
                fontWeight: "bold",
                fontSize: "18px",
                width: 42,
                height: 42,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  background: userProfile.profilePicture
                    ? "#e8e8e8"
                    : "linear-gradient(135deg, #34495e, #2c3e50)",
                  transform: "scale(1.08)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
                  border: userProfile.profilePicture
                    ? "3px solid #1a252f"
                    : "3px solid rgba(26, 37, 47, 0.9)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {!userProfile.profilePicture && getInitial(userName)}
            </Avatar>
          </Tooltip>
        </Toolbar>

        {/* Enhanced Notification Menu */}
        <MuiMenu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              width: 380,
              maxHeight: 500,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <Box>
            {userNotifications.length > 0 ? (
              <>
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: "16px 16px 0 0",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Notifications
                  </Typography>
                  <Chip
                    label={`${unreadCount} new`}
                    size="small"
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    maxHeight: 400,
                    overflowY: "auto",
                    // Hide scrollbar completely
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
                  {userNotifications.map((notification, index) => (
                    <NotificationItem
                      key={notification._id}
                      isUnread={!notification.seen}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => markNotificationAsSeen(notification._id)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", mb: 0.5 }}
                        >
                          {notification.title || "Notification"}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", opacity: 0.7 }}
                      >
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </NotificationItem>
                  ))}
                </Box>
              </>
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
          </Box>
        </MuiMenu>

        {/* Enhanced Profile Menu */}
        <MuiMenu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 200,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              mt: 1,
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={handleUpdateInformation}
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                transform: "translateX(4px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Edit sx={{ color: "#667eea" }} />
            </ListItemIcon>
            <ListItemText
              primary="Update Information"
              primaryTypographyProps={{
                fontWeight: "500",
                color: "#2d3748",
              }}
            />
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(255, 71, 87, 0.1), rgba(255, 55, 66, 0.1))",
                transform: "translateX(4px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Logout sx={{ color: "#ff4757" }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: "500",
                color: "#2d3748",
              }}
            />
          </MenuItem>
        </MuiMenu>
      </AppBar>

      {/* Enhanced Modern Sidebar */}
      <ModernSidebar
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", sm: "none" } }}
        collapsed={false}
      >
        {drawer}
      </ModernSidebar>

      <ModernSidebar
        variant="permanent"
        sx={{ display: { xs: "none", sm: "block" } }}
        open
        collapsed={sidebarCollapsed}
      >
        {drawer}
      </ModernSidebar>

      {/* Enhanced Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: {
            xs: "100%",
            sm: `calc(100% - ${
              sidebarCollapsed ? collapsedDrawerWidth : drawerWidth
            }px)`,
            xl: `calc(100% - ${
              sidebarCollapsed ? collapsedDrawerWidth : drawerWidth
            }px - 280px)`, // Account for right sidebar (280px) on xl screens and up
          },
          minHeight: "100vh",
          position: "relative",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          overflowX: "hidden",
          overflowY: "auto",
          // Hide scrollbars
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
        <Toolbar sx={{ minHeight: "80px !important" }} />

        {/* Enhanced Success/Error Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                width: "90%",
                maxWidth: "600px",
              }}
            >
              <Alert
                severity={successMessage.type}
                sx={{
                  mb: 3,
                  borderRadius: "16px",
                  background:
                    successMessage.type === "success"
                      ? "linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(102, 187, 106, 0.95))"
                      : successMessage.type === "error"
                      ? "linear-gradient(135deg, rgba(244, 67, 54, 0.95), rgba(239, 83, 80, 0.95))"
                      : "linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(255, 193, 7, 0.95))",
                  color: "white",
                  backdropFilter: "blur(20px)",
                  border:
                    successMessage.type === "error"
                      ? "2px solid rgba(244, 67, 54, 0.8)"
                      : "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow:
                    successMessage.type === "error"
                      ? "0 8px 32px rgba(244, 67, 54, 0.3)"
                      : "0 8px 32px rgba(0, 0, 0, 0.1)",
                  "& .MuiAlert-icon": { color: "white", fontSize: "1.5rem" },
                  "& .MuiAlert-message": {
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  },
                }}
                action={
                  <IconButton
                    size="small"
                    onClick={() => setSuccessMessage(null)}
                    sx={{ color: "white" }}
                  >
                    <Close />
                  </IconButton>
                }
              >
                {successMessage.message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {showApplicationForm ? (
          <LicenseApplication
            onClose={() => setShowApplicationForm(false)}
            onSuccess={() => {
              setSuccessMessage({
                type: "success",
                message: "Application submitted successfully!",
              });
              setShowApplicationForm(false);
              fetchApplicationStatus();
              checkUserLicense(); // Check if license was issued
              setTimeout(() => {
                setSuccessMessage(null);
              }, 3000);
            }}
          />
        ) : showApplicationStatus ? (
          <ApplicationStatus
            onClose={() => setShowApplicationStatus(false)}
            onCancel={cancelApplication}
          />
        ) : showTrialExam ? (
          <TrialExam onClose={() => setShowTrialExam(false)} />
        ) : showAvailableExams ? (
          <AvailableExams />
        ) : showPracticalExamResults ? (
          <PracticalExamResults
            onClose={() => setShowPracticalExamResults(false)}
          />
        ) : showGetLicense ? (
          <GetLicense />
        ) : showRenewalForm ? (
          <LicenseRenewal />
        ) : showReplacementForm ? (
          <LicenseReplacement />
        ) : showViolations ? (
          <ViolationsSection onClose={() => setShowViolations(false)} />
        ) : showHistory ? (
          <HistorySection onClose={() => setShowHistory(false)} />
        ) : showSettings ? (
          <SettingsComponent />
        ) : showSupport ? (
          <SupportComponent />
        ) : (
          <Box
            sx={{ p: { xs: 2, sm: 2, md: 3, lg: 2 } }}
            className="dashboard-optimized smooth-scroll"
          >
            <motion.div
              key={animationKey}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="hw-accelerated"
            >
              {/* Modern Welcome Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "24px",
                    p: { xs: 2, sm: 3, md: 4 },
                    mb: 3,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "700",
                          color: "white",
                          fontSize: {
                            xs: "1.8rem",
                            sm: "2.2rem",
                            md: "2.8rem",
                          },
                          textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                          mb: 1,
                        }}
                      >
                        Welcome back, {userName}! 👋
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "400",
                          textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        Here's what's happening with your driving license
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(10px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          {userName.charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </motion.div>

              {/* Modern Stats Cards */}
              <Grid
                container
                spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                sx={{ mb: 3 }}
              >
                <Grid item xs={12} sm={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "20px",
                        p: 2.5,
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                          pointerEvents: "none",
                        },
                      }}
                    >
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
                            width: 50,
                            height: 50,
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <School sx={{ fontSize: 24, color: "white" }} />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "700",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          {dashboardStats.licenseScore}%
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "600", mb: 0.5 }}
                      >
                        License Score
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                      >
                        Overall performance
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                        borderRadius: "20px",
                        p: 2.5,
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px rgba(78, 205, 196, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                          pointerEvents: "none",
                        },
                      }}
                    >
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
                            width: 50,
                            height: 50,
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <Assignment sx={{ fontSize: 24, color: "white" }} />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "700",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          {dashboardStats.totalApplications}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "600", mb: 0.5 }}
                      >
                        Applications
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                      >
                        Total submitted
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        borderRadius: "20px",
                        p: 2.5,
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px rgba(240, 147, 251, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                          pointerEvents: "none",
                        },
                      }}
                    >
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
                            width: 50,
                            height: 50,
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <Quiz sx={{ fontSize: 24, color: "white" }} />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "700",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          {dashboardStats.completedExams}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "600", mb: 0.5 }}
                      >
                        Exams Completed
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                      >
                        Successfully passed
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                        borderRadius: "20px",
                        p: 2.5,
                        color: "#2d3748",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px rgba(252, 182, 159, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                          pointerEvents: "none",
                        },
                      }}
                    >
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
                            width: 50,
                            height: 50,
                            borderRadius: "12px",
                            background: "rgba(45, 55, 72, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <Timeline sx={{ fontSize: 24, color: "#2d3748" }} />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "700",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          {dashboardStats.pendingTasks}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "600", mb: 0.5 }}
                      >
                        Pending Tasks
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.8, fontSize: "0.875rem" }}
                      >
                        Require attention
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>

              {/* Modern Action Bar */}
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "20px",
                  p: { xs: 2, sm: 2.5, md: 3 },
                  mb: 3,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: { xs: 2, sm: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={() => {
                      refreshData();
                      triggerAnimation();
                    }}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: "600",
                      px: 3,
                      py: 1.5,
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Refresh Data
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Analytics />}
                    sx={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: "600",
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#764ba2",
                        background: "rgba(102, 126, 234, 0.1)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    View Analytics
                  </Button>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#718096",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#4ade80",
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.5 },
                      },
                    }}
                  />
                  Last updated: {lastRefreshed.toLocaleTimeString()}
                </Typography>
              </Box>

              {/* Quick Actions and Recent Activity Side by Side */}
              <Grid
                container
                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                sx={{ mb: 3 }}
              >
                {/* Quick Actions Section */}
                <Grid item xs={12} md={8} lg={7} xl={8}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "700",
                        mb: 2,
                        color: "#2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 24,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: "2px",
                        }}
                      />
                      Quick Actions
                    </Typography>
                    <Grid container spacing={{ xs: 1, sm: 1.5, md: 1.5 }}>
                      {/* Apply for License - Only show if no active application and no license */}
                      {!hasActiveApplication && !hasLicense && (
                        <Grid item xs={12} sm={6} md={6}>
                          <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                          >
                            <Box
                              onClick={() => setShowApplicationForm(true)}
                              sx={{
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "16px",
                                p: 2.5,
                                color: "white",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow:
                                  "0 15px 30px rgba(102, 126, 234, 0.25)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                minHeight: "140px",
                                "&::before": {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background:
                                    "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                                  pointerEvents: "none",
                                },
                              }}
                            >
                              <Box>
                                <Box
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "12px",
                                    background: "rgba(255, 255, 255, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: 2,
                                    backdropFilter: "blur(10px)",
                                  }}
                                >
                                  <HowToReg
                                    sx={{ fontSize: 24, color: "white" }}
                                  />
                                </Box>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: "700",
                                    mb: 0.5,
                                    fontSize: "1.1rem",
                                  }}
                                >
                                  Apply for License
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    opacity: 0.9,
                                    lineHeight: 1.4,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  Start your application for a new driving
                                  license
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mt: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8 }}
                                >
                                  Get started
                                </Typography>
                                <ArrowForward sx={{ fontSize: 20 }} />
                              </Box>
                            </Box>
                          </motion.div>
                        </Grid>
                      )}

                      {/* Application Status - Show if has active application */}
                      {hasActiveApplication && (
                        <Grid item xs={12} sm={6} md={6}>
                          <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                          >
                            <Box
                              onClick={() => setShowApplicationStatus(true)}
                              sx={{
                                background:
                                  "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                                borderRadius: "24px",
                                p: 4,
                                color: "white",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow:
                                  "0 20px 40px rgba(78, 205, 196, 0.3)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                minHeight: "200px",
                                "&::before": {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background:
                                    "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                                  pointerEvents: "none",
                                },
                              }}
                            >
                              <Box>
                                <Box
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: "16px",
                                    background: "rgba(255, 255, 255, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: 3,
                                    backdropFilter: "blur(10px)",
                                  }}
                                >
                                  <Assignment
                                    sx={{ fontSize: 28, color: "white" }}
                                  />
                                </Box>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: "700", mb: 1 }}
                                >
                                  Application Status
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.9, lineHeight: 1.6 }}
                                >
                                  Check your current application progress
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mt: 3,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8 }}
                                >
                                  View status
                                </Typography>
                                <ArrowForward sx={{ fontSize: 20 }} />
                              </Box>
                            </Box>
                          </motion.div>
                        </Grid>
                      )}

                      {/* Schedule Exam */}
                      <Grid item xs={12} sm={6} md={6}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                        >
                          <Box
                            onClick={() => setOpenExamDialog(true)}
                            sx={{
                              background:
                                "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                              borderRadius: "16px",
                              p: 2.5,
                              color: "#2d3748",
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                              boxShadow:
                                "0 15px 30px rgba(252, 182, 159, 0.25)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: "140px",
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                  "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                                pointerEvents: "none",
                              },
                            }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "12px",
                                  background: "rgba(45, 55, 72, 0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mb: 2,
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                <School
                                  sx={{ fontSize: 24, color: "#2d3748" }}
                                />
                              </Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "700",
                                  mb: 0.5,
                                  fontSize: "1.1rem",
                                }}
                              >
                                Schedule Exam
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  opacity: 0.8,
                                  lineHeight: 1.4,
                                  fontSize: "0.85rem",
                                }}
                              >
                                Book your theory or practical driving test
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mt: 2,
                              }}
                            >
                              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                Book now
                              </Typography>
                              <ArrowForward sx={{ fontSize: 20 }} />
                            </Box>
                          </Box>
                        </motion.div>
                      </Grid>

                      {/* Trial Exam */}
                      <Grid item xs={12} sm={6} md={6}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                        >
                          <Box
                            onClick={() => {
                              setShowApplicationForm(false);
                              setShowApplicationStatus(false);
                              setShowTrialExam(true);
                              setShowAvailableExams(false);
                              setShowPracticalExamResults(false);
                              setShowGetLicense(false);
                              setShowViolations(false);
                              setShowHistory(false);
                              setShowRenewalForm(false);
                              window.scrollTo(0, 0);
                            }}
                            sx={{
                              background:
                                "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                              borderRadius: "16px",
                              p: 2.5,
                              color: "#2d3748",
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                              boxShadow:
                                "0 15px 30px rgba(168, 237, 234, 0.25)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: "140px",
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                  "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                                pointerEvents: "none",
                              },
                            }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "12px",
                                  background: "rgba(45, 55, 72, 0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mb: 2,
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                <Quiz sx={{ fontSize: 24, color: "#2d3748" }} />
                              </Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "700",
                                  mb: 0.5,
                                  fontSize: "1.1rem",
                                }}
                              >
                                Trial Exam
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  opacity: 0.8,
                                  lineHeight: 1.4,
                                  fontSize: "0.85rem",
                                }}
                              >
                                Practice with sample questions before the real
                                test
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mt: 2,
                              }}
                            >
                              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                Start practice
                              </Typography>
                              <ArrowForward sx={{ fontSize: 20 }} />
                            </Box>
                          </Box>
                        </motion.div>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Recent Activity Section */}
                <Grid item xs={12} md={4} lg={5} xl={4}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "700",
                        mb: 2,
                        color: "#2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 24,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: "2px",
                        }}
                      />
                      Recent Activity
                    </Typography>
                    <Box sx={{ maxHeight: "600px", overflowY: "auto" }}>
                      {userNotifications
                        .slice(0, 4)
                        .map((notification, index) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            whileHover={{ x: 4 }}
                          >
                            <Box
                              sx={{
                                background: "rgba(255, 255, 255, 0.9)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "12px",
                                p: 2,
                                mb: 2,
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                boxShadow:
                                  "0 4px 16px rgba(102, 126, 234, 0.1)",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  boxShadow:
                                    "0 8px 24px rgba(102, 126, 234, 0.15)",
                                  background: "rgba(255, 255, 255, 0.95)",
                                },
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "600",
                                  mb: 0.5,
                                  color: "#2d3748",
                                  fontSize: "0.9rem",
                                  lineHeight: 1.4,
                                }}
                              >
                                {notification.title || "Update"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#718096",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {formatDate(notification.createdAt)}
                              </Typography>
                            </Box>
                          </motion.div>
                        ))}
                      {userNotifications.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            background: "rgba(255, 255, 255, 0.7)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#718096",
                              fontSize: "0.9rem",
                              fontWeight: "500",
                            }}
                          >
                            No recent activity
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* License Information - Show if user has a license */}
              {hasLicense && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <AnimatedCard>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 3,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <DirectionsCar
                              color="primary"
                              sx={{ fontSize: 32, mr: 1.5 }}
                            />
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold" }}
                            >
                              Your Driving License
                            </Typography>
                          </Box>
                          <Chip
                            label={userLicense?.status || "Valid"}
                            color={
                              userLicense?.status === "Valid"
                                ? "success"
                                : userLicense?.status === "Expired"
                                ? "error"
                                : "warning"
                            }
                            sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
                          />
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  mb: 2,
                                  color: "primary.main",
                                }}
                              >
                                License Information
                              </Typography>
                              <DetailItem
                                label="License Number"
                                value={userLicense?.number}
                              />
                              <DetailItem
                                label="License Class"
                                value={userLicense?.class}
                              />
                              <DetailItem
                                label="Status"
                                value={userLicense?.status}
                              />
                              <DetailItem
                                label="Issue Date"
                                value={userLicense?.issueDate}
                              />
                              <DetailItem
                                label="Expiry Date"
                                value={userLicense?.expiryDate}
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  mb: 2,
                                  color: "primary.main",
                                }}
                              >
                                Holder Information
                              </Typography>
                              <DetailItem
                                label="Full Name"
                                value={userLicense?.userName}
                              />
                              <DetailItem
                                label="Email"
                                value={userLicense?.userEmail}
                              />
                            </Box>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<FileDownload />}
                            onClick={async () => {
                              try {
                                const userId = localStorage.getItem("userId");
                                if (!userId) {
                                  setSuccessMessage({
                                    type: "error",
                                    message:
                                      "User ID not found. Please log in again.",
                                  });
                                  setTimeout(
                                    () => setSuccessMessage(null),
                                    3000
                                  );
                                  return;
                                }

                                console.log(
                                  `📄 Downloading license for user ${userId}`
                                );

                                const response = await axios.get(
                                  `http://localhost:5004/api/payments/license/download/${userId}`,
                                  {
                                    responseType: "blob",
                                    timeout: 15000,
                                  }
                                );

                                // Create blob link to download
                                const url = window.URL.createObjectURL(
                                  new Blob([response.data])
                                );
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute(
                                  "download",
                                  `Ethiopian_Driving_License_${
                                    userLicense?.number || "License"
                                  }.html`
                                );
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);

                                setSuccessMessage({
                                  type: "success",
                                  message:
                                    "✅ License downloaded successfully!",
                                });
                                setTimeout(() => setSuccessMessage(null), 3000);
                              } catch (error) {
                                console.error(
                                  "Error downloading license:",
                                  error
                                );
                                setSuccessMessage({
                                  type: "error",
                                  message:
                                    "Failed to download license. Please try again.",
                                });
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }
                            }}
                          >
                            Download License
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => {
                              checkUserLicense();
                              setSuccessMessage({
                                type: "success",
                                message: "License information refreshed!",
                              });
                              setTimeout(() => setSuccessMessage(null), 2000);
                            }}
                          >
                            Refresh
                          </Button>
                        </Box>
                      </CardContent>
                    </AnimatedCard>
                  </Grid>
                </Grid>
              )}

              {/* Application Status */}
              {applicationStatus && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <AnimatedCard>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Application Status
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={() => {
                              console.log("Refreshing application status...");
                              fetchApplicationStatus();
                            }}
                          >
                            Refresh
                          </Button>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor:
                              applicationStatus.status === "approved"
                                ? "#e8f5e9"
                                : applicationStatus.status === "rejected"
                                ? "#ffebee"
                                : applicationStatus.status === "under_review"
                                ? "#e3f2fd"
                                : "#fff8e1",
                            borderRadius: "8px",
                            p: 2,
                            borderLeft: `4px solid ${
                              applicationStatus.status === "approved"
                                ? "#4caf50"
                                : applicationStatus.status === "rejected"
                                ? "#f44336"
                                : applicationStatus.status === "under_review"
                                ? "#2196f3"
                                : "#ff9800"
                            }`,
                          }}
                        >
                          <Typography>
                            Status:{" "}
                            <strong>
                              {applicationStatus.status.toUpperCase()}
                            </strong>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Last updated:{" "}
                            {new Date(
                              applicationStatus.lastUpdated
                            ).toLocaleDateString()}
                          </Typography>
                          {applicationStatus.statusMessage && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, fontStyle: "italic" }}
                            >
                              Message: {applicationStatus.statusMessage}
                            </Typography>
                          )}
                          {applicationStatus.status === "pending" && (
                            <Button variant="contained" sx={{ mt: 2 }}>
                              Check Requirements
                            </Button>
                          )}
                          {applicationStatus.status === "approved" && (
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Schedule />}
                                onClick={() => setOpenExamDialog(true)}
                              >
                                Schedule Main Exam
                              </Button>
                              <Button
                                variant="outlined"
                                color="success"
                                startIcon={<FileDownload />}
                              >
                                Download License
                              </Button>
                            </Box>
                          )}
                        </Box>

                        {/* Debug Information */}
                        <Box
                          sx={{
                            mt: 2,
                            p: 1,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 1,
                            fontSize: "0.8rem",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Debug Info: Application ID: {applicationStatus._id}{" "}
                            | User ID: {applicationStatus.userId} | Fetched at:{" "}
                            {new Date().toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </AnimatedCard>
                  </Grid>
                </Grid>
              )}

              {/* Main Exam Scheduling Dialog */}
              <Dialog
                open={openExamDialog}
                onClose={() => setOpenExamDialog(false)}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Schedule color="primary" />
                    Schedule Main Driving Exam
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        Your license application has been approved! You can now
                        schedule your main driving exam. The exam consists of
                        both theory and practical components.
                      </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label="Exam Type"
                          value={examData.type}
                          onChange={(e) =>
                            setExamData({ ...examData, type: e.target.value })
                          }
                          fullWidth
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="theory">
                            Theory Exam (Written Test)
                          </option>
                          <option value="practical">
                            Practical Exam (Field Driving Test)
                          </option>
                          <option value="both">
                            Complete Exam (Theory + Practical)
                          </option>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Preferred Date"
                          type="date"
                          value={examData.date}
                          onChange={(e) =>
                            setExamData({ ...examData, date: e.target.value })
                          }
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            min: new Date().toISOString().split("T")[0], // Today or later
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label="Preferred Time"
                          value={examData.time}
                          onChange={(e) =>
                            setExamData({ ...examData, time: e.target.value })
                          }
                          fullWidth
                          SelectProps={{
                            native: true,
                          }}
                          helperText={
                            examData.type === "practical"
                              ? "⏰ Flexible timing: You can take the exam 2 hours before or 4 hours after scheduled time"
                              : ""
                          }
                        >
                          <option value="">Select Time</option>
                          <option value="08:00">08:00 AM</option>
                          <option value="08:30">08:30 AM</option>
                          <option value="09:00">09:00 AM</option>
                          <option value="09:30">09:30 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="10:30">10:30 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="11:30">11:30 AM</option>
                          <option value="13:00">01:00 PM</option>
                          <option value="13:30">01:30 PM</option>
                          <option value="14:00">02:00 PM</option>
                          <option value="14:30">02:30 PM</option>
                          <option value="15:00">03:00 PM</option>
                          <option value="15:30">03:30 PM</option>
                          <option value="16:00">04:00 PM</option>
                          <option value="16:30">04:30 PM</option>
                          <option value="17:00">05:00 PM</option>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        {examData.type === "practical" ? (
                          <TextField
                            select
                            label="Testing Location"
                            value={examData.location || "Kality, Addis Ababa"}
                            onChange={(e) =>
                              setExamData({
                                ...examData,
                                location: e.target.value,
                              })
                            }
                            fullWidth
                            helperText="Select your preferred practical test location"
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="Kality, Addis Ababa">
                              🚗 Kality Testing Center - Addis Ababa (Main)
                            </option>
                            <option value="Debre Berhan">
                              🚗 Debre Berhan Testing Center
                            </option>
                            <option value="Mekelle">
                              🚗 Mekelle Testing Center - Tigray
                            </option>
                            <option value="Dire Dawa">
                              🚗 Dire Dawa Testing Center
                            </option>
                            <option value="Ambo">
                              🚗 Ambo Testing Center - Oromia
                            </option>
                            <option value="Debre Zeit">
                              🚗 Debre Zeit Testing Center - Oromia
                            </option>
                            <option value="Hawassa">
                              🚗 Hawassa Testing Center - SNNPR
                            </option>
                            <option value="Bahir Dar">
                              🚗 Bahir Dar Testing Center - Amhara
                            </option>
                            <option value="Jimma">
                              🚗 Jimma Testing Center - Oromia
                            </option>
                            <option value="Dessie">
                              🚗 Dessie Testing Center - Amhara
                            </option>
                            <option value="Adama">
                              🚗 Adama Testing Center - Oromia
                            </option>
                            <option value="Gondar">
                              🚗 Gondar Testing Center - Amhara
                            </option>
                          </TextField>
                        ) : (
                          <TextField
                            label="Exam Location"
                            value="Online Exam"
                            fullWidth
                            disabled
                            helperText="Theory exams are conducted online"
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        )}
                      </Grid>

                      <Grid item xs={12}>
                        {examData.type === "practical" && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>Important:</strong> Practical exams are
                            conducted at the selected testing center. You will
                            need to bring your own vehicle or use a driving
                            school vehicle. Please arrive 30 minutes before your
                            scheduled time with all required documents.
                          </Alert>
                        )}
                        <TextField
                          label="Additional Notes (Optional)"
                          value={examData.notes || ""}
                          onChange={(e) =>
                            setExamData({
                              ...examData,
                              notes: e.target.value,
                            })
                          }
                          fullWidth
                          multiline
                          rows={3}
                          placeholder={
                            examData.type === "practical"
                              ? "Any special requirements, vehicle type, or accessibility needs..."
                              : "Any special requirements or notes for your exam..."
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenExamDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleExam}
                    variant="contained"
                    disabled={!examData.date || !examData.time}
                  >
                    Schedule Exam
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Exam Scheduled Confirmation */}
              {examSchedule && (
                <Dialog
                  open={Boolean(examSchedule)}
                  onClose={() => setExamSchedule(null)}
                >
                  <DialogTitle>
                    {examSchedule.success
                      ? "Exam Scheduled"
                      : "Scheduling Error"}
                  </DialogTitle>
                  <DialogContent>
                    {examSchedule.success ? (
                      <>
                        <Typography>
                          Your exam has been scheduled successfully!
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          Confirmation number: {examSchedule.confirmationNumber}
                        </Typography>
                        <Typography variant="body2">
                          Test type:{" "}
                          {examSchedule.type === "theory"
                            ? "Theory"
                            : "Practical"}{" "}
                          Test
                        </Typography>
                      </>
                    ) : (
                      <Typography color="error">
                        {examSchedule.message}
                      </Typography>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setExamSchedule(null)}>Close</Button>
                  </DialogActions>
                </Dialog>
              )}

              {/* License Renewal Dialog */}
              <Dialog
                open={renewalDialog}
                onClose={() => setRenewalDialog(false)}
              >
                <DialogTitle>License Renewal</DialogTitle>
                <DialogContent>
                  <TextField
                    select
                    fullWidth
                    label="Renewal Reason"
                    value={renewalData.reason}
                    onChange={(e) =>
                      setRenewalData({
                        ...renewalData,
                        reason: e.target.value,
                      })
                    }
                    sx={{ mt: 2 }}
                  >
                    <MenuItem value="expiring">License Expiring</MenuItem>
                    <MenuItem value="damaged">License Damaged</MenuItem>
                    <MenuItem value="lost">License Lost</MenuItem>
                  </TextField>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setRenewalDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRenewalSubmit} variant="contained">
                    Submit Renewal
                  </Button>
                </DialogActions>
              </Dialog>

              {/* License Renewal Confirmation */}
              {renewalStatus && (
                <Dialog
                  open={Boolean(renewalStatus)}
                  onClose={() => setRenewalStatus(null)}
                >
                  <DialogTitle>
                    {renewalStatus.success
                      ? "License Renewed"
                      : "Renewal Error"}
                  </DialogTitle>
                  <DialogContent>
                    {renewalStatus.success ? (
                      <>
                        <Typography>
                          Your license has been renewed successfully!
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          New expiry date: {renewalStatus.newExpiryDate}
                        </Typography>
                      </>
                    ) : (
                      <Typography color="error">
                        {renewalStatus.message}
                      </Typography>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setRenewalStatus(null)}>
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
            </motion.div>
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setShowQuickActions(!showQuickActions)}
        sx={{ display: { lg: "none" } }}
      >
        <Add />
      </FloatingActionButton>

      {/* Enhanced Right Sidebar - Temporarily disabled for debugging */}

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={cancelLogout}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.3rem",
            color: "text.primary",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to log out? You will need to sign in again to
            access your dashboard.
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Any unsaved changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            onClick={cancelLogout}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: "500",
              borderColor: "rgba(102, 126, 234, 0.3)",
              color: "#667eea",
              "&:hover": {
                borderColor: "#667eea",
                background: "rgba(102, 126, 234, 0.05)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: "500",
              background: "linear-gradient(135deg, #ff4757, #ff3742)",
              boxShadow: "0 4px 15px rgba(255, 71, 87, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #ff3742, #ff2f3a)",
                boxShadow: "0 6px 20px rgba(255, 71, 87, 0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Update Dialog */}
      <Dialog
        open={showProfileDialog}
        onClose={() => {
          setShowProfileDialog(false);
          // Clear password fields when dialog is closed
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          // Clear profile picture preview
          setProfilePicturePreview(null);
          setProfilePicture(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))",
            backdropFilter: "blur(25px)",
            boxShadow:
              "0 32px 64px rgba(102, 126, 234, 0.12), 0 0 0 1px rgba(255,255,255,0.3)",
            border: "1px solid rgba(255,255,255,0.4)",
            overflow: "hidden",
            position: "relative",
            minHeight: "600px",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe)",
              backgroundSize: "300% 100%",
              animation: "gradientShift 3s ease infinite",
            },
            "@keyframes gradientShift": {
              "0%, 100%": { backgroundPosition: "0% 50%" },
              "50%": { backgroundPosition: "100% 50%" },
            },
          },
        }}
        TransitionProps={{
          timeout: 600,
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "700",
            fontSize: "2.2rem",
            background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            pb: 2,
            pt: 4,
            position: "relative",
            letterSpacing: "-0.02em",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
              borderRadius: "2px",
              animation: "shimmerLine 2s ease-in-out infinite",
            },
            "@keyframes shimmerLine": {
              "0%, 100%": {
                opacity: 0.6,
                transform: "translateX(-50%) scaleX(1)",
              },
              "50%": { opacity: 1, transform: "translateX(-50%) scaleX(1.1)" },
            },
          }}
        >
          ✨ Update Your Information
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={4}>
            {/* Profile Picture Upload Section */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 4,
                    p: 4,
                    border: "3px dashed transparent",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(145deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.06))",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: "20px",
                      padding: "3px",
                      background:
                        "linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)",
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                      WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      animation: "borderGlow 3s ease infinite",
                    },
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                      background:
                        "linear-gradient(145deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.08))",
                    },
                    "@keyframes borderGlow": {
                      "0%, 100%": { opacity: 0.6 },
                      "50%": { opacity: 1 },
                    },
                  }}
                >
                  {/* Floating particles effect */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "none",
                      "&::before, &::after": {
                        content: '""',
                        position: "absolute",
                        width: "6px",
                        height: "6px",
                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                        borderRadius: "50%",
                        animation: "floatParticles 4s ease-in-out infinite",
                      },
                      "&::before": {
                        top: "20%",
                        left: "15%",
                        animationDelay: "0s",
                      },
                      "&::after": {
                        top: "70%",
                        right: "20%",
                        animationDelay: "2s",
                      },
                    }}
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        fontWeight: "700",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textAlign: "center",
                        fontSize: "1.8rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      📸 Profile Picture
                    </Typography>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Box
                      sx={{
                        mb: 3,
                        p: 2.5,
                        background:
                          "linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(255, 87, 108, 0.08))",
                        borderRadius: "16px",
                        border: "2px solid rgba(211, 47, 47, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                          animation: "shimmerEffect 2s infinite",
                        },
                        "@keyframes shimmerEffect": {
                          "0%": { left: "-100%" },
                          "100%": { left: "100%" },
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#d32f2f",
                          fontWeight: "600",
                          textAlign: "center",
                          fontSize: "1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            fontSize: "1.2rem",
                            animation: "pulseWarning 2s infinite",
                            "@keyframes pulseWarning": {
                              "0%, 100%": { transform: "scale(1)" },
                              "50%": { transform: "scale(1.1)" },
                            },
                          }}
                        >
                          ⚠️
                        </Box>
                        Profile picture is MANDATORY - It will be printed on
                        your driving license ID card
                      </Typography>
                    </Box>
                  </motion.div>

                  {/* Profile Picture Preview */}
                  {profilePicturePreview || userProfile.profilePicture ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <Box
                        sx={{
                          mb: 3,
                          width: 140,
                          height: 140,
                          borderRadius: "50%",
                          overflow: "hidden",
                          position: "relative",
                          background:
                            "linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)",
                          padding: "4px",
                          boxShadow:
                            "0 20px 40px rgba(102, 126, 234, 0.3), 0 0 0 4px rgba(255,255,255,0.8)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow:
                              "0 25px 50px rgba(102, 126, 234, 0.4), 0 0 0 6px rgba(255,255,255,0.9)",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: "-2px",
                            left: "-2px",
                            right: "-2px",
                            bottom: "-2px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)",
                            animation: "rotateGradient 3s linear infinite",
                            zIndex: -1,
                          },
                          "@keyframes rotateGradient": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "white",
                          }}
                        >
                          <img
                            src={
                              profilePicturePreview ||
                              (userProfile.profilePicture
                                ? `http://localhost:5004/uploads/profile-pictures/${userProfile.profilePicture}`
                                : undefined)
                            }
                            alt="Profile Preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <Box
                        sx={{
                          mb: 3,
                          width: 140,
                          height: 140,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)",
                          padding: "4px",
                          boxShadow:
                            "0 20px 40px rgba(102, 126, 234, 0.3), 0 0 0 4px rgba(255,255,255,0.8)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow:
                              "0 25px 50px rgba(102, 126, 234, 0.4), 0 0 0 6px rgba(255,255,255,0.9)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.9)",
                            fontSize: "3rem",
                          }}
                        >
                          👤
                        </Box>
                      </Box>
                    </motion.div>
                  )}

                  {/* Upload Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleProfilePictureChange}
                    />
                    <label htmlFor="profile-picture-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <CloudUpload />
                          </motion.div>
                        }
                        sx={{
                          borderRadius: "16px",
                          px: 4,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: "600",
                          fontSize: "1.1rem",
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                          backgroundSize: "200% 200%",
                          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                          position: "relative",
                          overflow: "hidden",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            transition: "left 0.5s",
                          },
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #764ba2, #f093fb, #667eea)",
                            backgroundSize: "200% 200%",
                            animation: "gradientMove 2s ease infinite",
                            boxShadow: "0 12px 35px rgba(102, 126, 234, 0.5)",
                            transform: "translateY(-2px) scale(1.02)",
                            "&::before": {
                              left: "100%",
                            },
                          },
                          "@keyframes gradientMove": {
                            "0%, 100%": { backgroundPosition: "0% 50%" },
                            "50%": { backgroundPosition: "100% 50%" },
                          },
                        }}
                      >
                        {profilePicturePreview
                          ? "✨ Change Picture"
                          : "📸 Upload Picture"}
                      </Button>
                    </label>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        color: "#8e9aaf",
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                        background: "linear-gradient(135deg, #8e9aaf, #667eea)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      📁 Supported formats: JPG, JPEG, PNG, GIF (Max 5MB)
                    </Typography>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>

            {/* Form Inputs Section */}
            <Grid item xs={12} md={7}>
              <Box sx={{ pl: { md: 3 } }}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: "1.3rem",
                    }}
                  >
                    📝 Personal Information
                  </Typography>
                </motion.div>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <TextField
                        fullWidth
                        label="👤 Full Name"
                        value={userProfile.fullName || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <TextField
                        fullWidth
                        label="📧 Email"
                        type="email"
                        value={userProfile.email || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <TextField
                        fullWidth
                        label="📱 Phone Number"
                        value={userProfile.phone || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        variant="outlined"
                        placeholder="e.g., +1234567890"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <TextField
                        fullWidth
                        label="📅 Date of Birth"
                        type="date"
                        value={userProfile.dateOfBirth || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <TextField
                        fullWidth
                        select
                        label="⚧ Gender"
                        value={userProfile.gender || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value="male">👨 Male</MenuItem>
                        <MenuItem value="female">👩 Female</MenuItem>
                        <MenuItem value="other">⚧ Other</MenuItem>
                      </TextField>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <TextField
                        fullWidth
                        label="🆔 National ID (NIC)"
                        value={userProfile.nic || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            nic: e.target.value,
                          }))
                        }
                        variant="outlined"
                        placeholder="Enter your National ID number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <TextField
                        fullWidth
                        label="🏠 Address"
                        value={userProfile.address || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        variant="outlined"
                        multiline
                        rows={3}
                        placeholder="Enter your full address"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>

                  {/* Nationality Field */}
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                    >
                      <TextField
                        fullWidth
                        label="🌍 Nationality"
                        value={userProfile.nationality || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            nationality: e.target.value,
                          }))
                        }
                        variant="outlined"
                        placeholder="Enter your nationality"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>

                  {/* Blood Type Field */}
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <TextField
                        fullWidth
                        select
                        label="🩸 Blood Type"
                        value={userProfile.bloodType || ""}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            bloodType: e.target.value,
                          }))
                        }
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "2px 8px",
                            transform: "translate(14px, -12px) scale(1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                            "&.Mui-focused": {
                              color: "#667eea",
                              backgroundColor: "white",
                              transform: "translate(14px, -12px) scale(1)",
                            },
                            "&.MuiInputLabel-shrink": {
                              transform: "translate(14px, -12px) scale(1)",
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.2)",
                              "& fieldset": {
                                borderColor: "#667eea",
                                borderWidth: "2px",
                                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                              },
                            },
                            "& fieldset": {
                              borderColor: "rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Blood Type</MenuItem>
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                      </TextField>
                    </motion.div>
                  </Grid>

                  {/* Password Update Section */}
                  <Grid item xs={12}>
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 2,
                        mb: 2,
                        fontWeight: "600",
                        color: "#667eea",
                        borderBottom: "2px solid #667eea",
                        paddingBottom: 1,
                      }}
                    >
                      Change Password (Optional)
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  current: !prev.current,
                                }))
                              }
                              edge="end"
                            >
                              {showPassword.current ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#667eea",
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                            borderWidth: "2px",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  new: !prev.new,
                                }))
                              }
                              edge="end"
                            >
                              {showPassword.new ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#667eea",
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                            borderWidth: "2px",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  confirm: !prev.confirm,
                                }))
                              }
                              edge="end"
                            >
                              {showPassword.confirm ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#667eea",
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                            borderWidth: "2px",
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 3,
            p: 4,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.6))",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              onClick={() => {
                setShowProfileDialog(false);
                // Clear password fields when canceling
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                // Clear profile picture preview
                setProfilePicturePreview(null);
                setProfilePicture(null);
              }}
              variant="outlined"
              sx={{
                borderRadius: "12px",
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontWeight: "600",
                fontSize: "1rem",
                borderColor: "rgba(102, 126, 234, 0.4)",
                color: "#667eea",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  borderColor: "#667eea",
                  background: "rgba(102, 126, 234, 0.08)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.15)",
                },
              }}
            >
              ❌ Cancel
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Button
              onClick={async () => {
                try {
                  let profileUpdateSuccess = false;
                  let passwordUpdateSuccess = false;

                  // Update profile information
                  try {
                    await handleProfileUpdate();
                    profileUpdateSuccess = true;
                  } catch (error) {
                    console.error("Profile update failed:", error);
                  }

                  // Update password if any password field is filled
                  if (
                    passwordData.currentPassword ||
                    passwordData.newPassword ||
                    passwordData.confirmPassword
                  ) {
                    try {
                      await handlePasswordUpdate();
                      passwordUpdateSuccess = true;
                    } catch (error) {
                      console.error("Password update failed:", error);
                    }
                  } else {
                    passwordUpdateSuccess = true; // No password update needed
                  }

                  // Close dialog only if both operations succeeded
                  if (profileUpdateSuccess && passwordUpdateSuccess) {
                    setTimeout(() => {
                      setShowProfileDialog(false);
                    }, 2000); // Give time to see success message
                  }
                } catch (error) {
                  console.error("Error in save operation:", error);
                }
              }}
              variant="contained"
              sx={{
                borderRadius: "12px",
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontWeight: "600",
                fontSize: "1rem",
                background:
                  "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                backgroundSize: "200% 200%",
                boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  transition: "left 0.5s",
                },
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2, #f093fb, #667eea)",
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 2s ease infinite",
                  boxShadow: "0 12px 35px rgba(102, 126, 234, 0.5)",
                  transform: "translateY(-2px) scale(1.02)",
                  "&::before": {
                    left: "100%",
                  },
                },
                "@keyframes gradientShift": {
                  "0%, 100%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                },
              }}
            >
              ✨ Save Changes
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Reusable components
const DetailItem = ({ label, value }) => {
  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        borderRadius: 1,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          minWidth: "100px",
          color: "text.secondary",
          fontWeight: "bold",
        }}
      >
        {label}:
      </Typography>
      <Typography
        variant="body1"
        sx={{
          flex: 1,
          color:
            !value || value === "Not provided"
              ? "text.disabled"
              : "text.primary",
          fontStyle: !value || value === "Not provided" ? "italic" : "normal",
        }}
      >
        {value || "Not provided"}
      </Typography>
    </Box>
  );
};

export default Dashboard;
