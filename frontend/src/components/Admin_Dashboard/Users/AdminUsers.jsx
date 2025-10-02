import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  Avatar,
  Chip,
  Card,
  CardContent,
  Divider,
  useTheme,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Delete,
  Visibility,
  Add,
  Refresh,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  Search as SearchIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Gavel as ViolationIcon,
} from "@mui/icons-material";
import axios from "axios";
import UserDetails from "./UserDetails";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editUser, setEditUser] = useState({
    _id: "",
    fullName: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
    address: "",
    dateOfBirth: "",
    userName: "",
    gender: "",
    nic: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debug: Log users data to see profile pictures
  useEffect(() => {
    if (users.length > 0) {
      console.log("Admin Users - First user data:", users[0]);
      console.log(
        "Admin Users - Users with profile pictures:",
        users
          .filter((user) => user.profilePicture)
          .map((user) => ({
            name: user.fullName,
            profilePicture: user.profilePicture,
          }))
      );
    }
  }, [users]);

  // Filter users based on search term
  useEffect(() => {
    if (!users) return;

    const filtered = users.filter((user) => {
      const fullName = user.fullName || user.full_name || "";
      const email = user.email || user.user_email || "";
      const role = user.role || (user.isAdmin ? "admin" : "user");

      const searchLower = searchTerm.toLowerCase();
      return (
        fullName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        role.toLowerCase().includes(searchLower)
      );
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching users from API...");

      // First check if the database is connected
      let dbStatus;
      try {
        const dbStatusResponse = await axios.get("/api/db-status");
        dbStatus = dbStatusResponse.data;
        console.log("Database status:", dbStatus);

        if (!dbStatus.connected) {
          console.warn("Database not connected:", dbStatus.error);
          setSnackbar({
            open: true,
            message: `Database not connected: ${dbStatus.error}`,
            severity: "warning",
          });
        }
      } catch (dbStatusError) {
        console.error("Error checking database status:", dbStatusError);
      }

      // Try the admin users endpoint
      let response;
      const token = localStorage.getItem("token");
      try {
        response = await axios.get("/api/admin/users", {
          timeout: 10000, // 10 second timeout
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API response from admin/users:", response.data);
      } catch (adminError) {
        console.error("Error fetching from admin/users:", adminError);

        // If that fails, try the direct users endpoint
        try {
          response = await axios.get("/api/users", {
            timeout: 10000,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("API response from /api/users:", response.data);
        } catch (usersError) {
          console.error("Error fetching from /api/users:", usersError);
          throw new Error("All API endpoints failed");
        }
      }

      // Process the response data
      let userData = [];

      if (response && Array.isArray(response.data)) {
        userData = response.data;
      } else if (
        response &&
        typeof response.data === "object" &&
        response.data.users &&
        Array.isArray(response.data.users)
      ) {
        // Handle case where response has a users property that is an array
        userData = response.data.users;
      } else if (
        response &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        // Handle case where response is an object but not an array
        console.log(
          "Response is an object, not an array. Converting to array."
        );
        userData = Object.values(response.data).filter(
          (item) => typeof item === "object"
        );
      }

      if (userData.length > 0) {
        console.log(`Successfully retrieved ${userData.length} users`);
        setUsers(userData);
        setLoading(false);

        setSnackbar({
          open: true,
          message: `Successfully loaded ${userData.length} users from database`,
          severity: "success",
        });
      } else {
        console.error("No users found in response:", response?.data);
        setError("No users found in database");
        setLoading(false);
        throw new Error("No users found in response");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(`Failed to fetch users: ${err.message || "Unknown error"}`);
      setLoading(false);

      // Show error in UI
      setSnackbar({
        open: true,
        message: `Error fetching users: ${err.message}. Check server logs.`,
        severity: "error",
      });

      // Fall back to mock data for testing
      console.log("Using mock data as fallback");
      const mockUsers = [
        {
          _id: "mock1",
          fullName: "Mock User 1",
          email: "mock1@example.com",
          role: "user",
          phone: "1234567890",
          address: "123 Test St",
          dateOfBirth: new Date("1990-01-01"),
          createdAt: new Date(),
        },
        {
          _id: "mock2",
          fullName: "Mock Admin",
          email: "admin@example.com",
          role: "admin",
          phone: "0987654321",
          address: "456 Admin Ave",
          dateOfBirth: new Date("1985-05-15"),
          createdAt: new Date(),
        },
      ];

      setUsers(mockUsers);
      setSnackbar({
        open: true,
        message: "Using mock data (database connection issue)",
        severity: "warning",
      });
    }
  };

  const handleViewUser = async (user) => {
    try {
      setSelectedUser(null); // Clear previous user

      console.log(`Fetching details for user ID: ${user._id}`);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/admin/users/${user._id}`, {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User details response:", response.data);
      setSelectedUser(response.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      // Fall back to the basic user info we already have
      setSelectedUser(user);
      setSnackbar({
        open: true,
        message: "Could not fetch detailed user information",
        severity: "warning",
      });
    }
    setOpenUserDetails(true);
  };

  const handleCloseUserDetails = () => {
    setOpenUserDetails(false);
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setEditUser({
      _id: user._id,
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "user",
      phone: user.phone || "",
      address: user.address || "",
      dateOfBirth: user.dateOfBirth || "",
      password: "", // Don't pre-fill password for security
    });
    setShowEditPassword(false); // Reset password visibility
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      // Validate required fields
      const requiredFields = ["fullName", "email"];
      const missingFields = requiredFields.filter(
        (field) => !editUser[field] || editUser[field].trim() === ""
      );

      if (missingFields.length > 0) {
        setSnackbar({
          open: true,
          message: `Please fill in required fields: ${missingFields.join(
            ", "
          )}`,
          severity: "error",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editUser.email)) {
        setSnackbar({
          open: true,
          message: "Please enter a valid email address",
          severity: "error",
        });
        return;
      }

      // Validate password if provided
      if (editUser.password && editUser.password.trim() !== "") {
        if (editUser.password.length < 6) {
          setSnackbar({
            open: true,
            message: "Password must be at least 6 characters long",
            severity: "error",
          });
          return;
        }
      }

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/admin/users/${editUser._id}`,
        editUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Update the user in the local state
        setUsers(
          users.map((user) =>
            user._id === editUser._id ? { ...user, ...response.data } : user
          )
        );

        setOpenEditDialog(false);
        setSnackbar({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
      } else {
        throw new Error("Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update user";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    // Enhanced confirmation dialog
    const userToDelete = users.find((user) => user._id === userId);
    const userName =
      userToDelete?.fullName || userToDelete?.full_name || "this user";

    if (
      window.confirm(
        `Are you sure you want to permanently delete ${userName}?\n\n` +
          "This action cannot be undone and will remove:\n" +
          "- User account and profile\n" +
          "- All associated data\n" +
          "- Access permissions\n\n" +
          "Click OK to confirm deletion."
      )
    ) {
      try {
        console.log(`Deleting user with ID: ${userId}`);
        const token = localStorage.getItem("token");
        const response = await axios.delete(`/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setUsers(users.filter((user) => user._id !== userId));

          // Close the details dialog if it's open
          if (openUserDetails && selectedUser && selectedUser._id === userId) {
            setOpenUserDetails(false);
          }

          setSnackbar({
            open: true,
            message: `User ${userName} deleted successfully`,
            severity: "success",
          });
        } else {
          throw new Error("Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to delete user";
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddUser = () => {
    setNewUser({
      fullName: "",
      email: "",
      password: "",
      role: "user",
      phone: "",
      address: "",
      dateOfBirth: "",
      userName: "",
      gender: "",
      nic: "",
    });
    setShowNewPassword(false);
    setOpenAddUserDialog(true);
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveNewUser = async () => {
    try {
      // Validate required fields
      const requiredFields = ["fullName", "email", "password"];
      const missingFields = requiredFields.filter(
        (field) => !newUser[field] || newUser[field].trim() === ""
      );

      if (missingFields.length > 0) {
        setSnackbar({
          open: true,
          message: `Please fill in required fields: ${missingFields.join(
            ", "
          )}`,
          severity: "error",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        setSnackbar({
          open: true,
          message: "Please enter a valid email address",
          severity: "error",
        });
        return;
      }

      // Validate password
      if (newUser.password.length < 6) {
        setSnackbar({
          open: true,
          message: "Password must be at least 6 characters long",
          severity: "error",
        });
        return;
      }

      // Prepare user data for registration
      const userData = {
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        userName:
          newUser.userName ||
          newUser.fullName.replace(/\s+/g, "").toLowerCase(),
        phoneNumber: newUser.phone,
        gender: newUser.gender,
        nic: newUser.nic,
        role: newUser.role,
        isAdmin: newUser.role === "admin",
      };

      console.log("Creating new user:", userData);

      const token = localStorage.getItem("token");
      const response = await axios.post("/api/auth/register", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setSnackbar({
          open: true,
          message: `${
            newUser.role === "admin" ? "Admin" : "User"
          } created successfully!`,
          severity: "success",
        });

        setOpenAddUserDialog(false);

        // Refresh the users list
        fetchUsers();
      }
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create user";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  // Add a debug function to check API connection
  const checkApiConnection = async () => {
    try {
      const response = await axios.get("/api");
      console.log("API connection test:", response.data);

      setSnackbar({
        open: true,
        message: `API connection successful: ${response.data.message}`,
        severity: "success",
      });

      // Try to fetch users again
      fetchUsers();
    } catch (err) {
      console.error("API connection test failed:", err);

      setSnackbar({
        open: true,
        message: `API connection failed: ${err.message}. Make sure the server is running.`,
        severity: "error",
      });
    }
  };

  // Add a function to seed test users if none exist
  const seedTestUsers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/admin/seed-users",
        {},
        {
          timeout: 10000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Seed response:", response.data);

      setSnackbar({
        open: true,
        message: `Created ${response.data.count} test users`,
        severity: "success",
      });

      // Fetch the newly created users
      fetchUsers();
    } catch (error) {
      console.error("Error seeding test users:", error);

      setSnackbar({
        open: true,
        message: `Error seeding test users: ${error.message}`,
        severity: "error",
      });

      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f0f4f8, #d7e3fc)",
        p: 0,
        m: 0,
        position: "relative",
        top: 0,
        left: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #3a8dff 0%, #1a56e5 100%)",
          color: "white",
          p: 3,
          m: 0,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/admin/dashboard")}
            startIcon={<BackIcon />}
            sx={{
              mr: 3,
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold">
            User Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={fetchUsers}
          startIcon={<Refresh />}
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pt: 0, pb: 4, mt: 0 }}>
        {/* Search and Action Bar */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "white",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "60%" }}>
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: (theme) => theme.palette.primary.main,
                  },
                },
              }}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddUser}
              startIcon={<Add />}
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Add New User
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={checkApiConnection}
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Check API
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={seedTestUsers}
              startIcon={<PersonAddIcon />}
              sx={{ borderRadius: 2 }}
            >
              Create Test Users
            </Button>
          </Box>
        </Paper>

        {/* User Stats */}
        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              flex: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {filteredUsers.length}
            </Typography>
            <Typography variant="subtitle1">Total Users</Typography>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              flex: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {
                filteredUsers.filter(
                  (user) => !(user.role === "admin" || user.isAdmin)
                ).length
              }
            </Typography>
            <Typography variant="subtitle1">Regular Users</Typography>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              flex: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {
                filteredUsers.filter(
                  (user) => user.role === "admin" || user.isAdmin
                ).length
              }
            </Typography>
            <Typography variant="subtitle1">Administrators</Typography>
          </Paper>
        </Box>

        {/* Users Table */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          {error && (
            <Box sx={{ p: 2, bgcolor: "#ffebee" }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 60, color: "#bdbdbd" }} />
              <Typography variant="h6" color="textSecondary">
                No users found
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      sx={{
                        "&:hover": {
                          bgcolor: "#f5f9ff",
                          transition: "background-color 0.2s ease",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={
                              user.profilePicture
                                ? `/api/users/profile-picture/${user.profilePicture}`
                                : undefined
                            }
                            sx={{
                              mr: 2,
                              width: 50,
                              height: 50,
                              bgcolor:
                                user.role === "admin" || user.isAdmin
                                  ? "#9c27b0"
                                  : "#3f51b5",
                              border: user.profilePicture
                                ? "2px solid #e0e0e0"
                                : "none",
                              boxShadow: user.profilePicture
                                ? "0 2px 8px rgba(0,0,0,0.1)"
                                : "none",
                            }}
                          >
                            {!user.profilePicture &&
                              (user.fullName || user.full_name || "U").charAt(
                                0
                              )}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="medium">
                              {user.fullName || user.full_name}
                            </Typography>
                            {user.profilePicture && (
                              <Typography
                                variant="caption"
                                color="success.main"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 0.5,
                                }}
                              >
                                📷 Profile Picture
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email || user.user_email}</TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            user.role === "admin" || user.isAdmin ? (
                              <AdminIcon />
                            ) : (
                              <PersonIcon />
                            )
                          }
                          label={
                            user.role === "admin" || user.isAdmin
                              ? "Admin"
                              : "User"
                          }
                          color={
                            user.role === "admin" || user.isAdmin
                              ? "secondary"
                              : "primary"
                          }
                          size="small"
                          sx={{ fontWeight: "medium" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() => handleViewUser(user)}
                            startIcon={<Visibility />}
                            sx={{ borderRadius: 1 }}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="info"
                            onClick={() => handleEditUser(user)}
                            startIcon={<Edit />}
                            sx={{ borderRadius: 1 }}
                          >
                            Edit
                          </Button>
                          {user.role !== "admin" && !user.isAdmin && (
                            <Button
                              variant="contained"
                              size="small"
                              color="warning"
                              onClick={() =>
                                navigate(`/admin/violations?userId=${user._id}`)
                              }
                              startIcon={<ViolationIcon />}
                              sx={{ borderRadius: 1 }}
                            >
                              Violations
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user._id)}
                            startIcon={<Delete />}
                            sx={{ borderRadius: 1 }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* User Details Dialog */}
      {selectedUser && (
        <UserDetails
          open={openUserDetails}
          user={selectedUser}
          onClose={handleCloseUserDetails}
          onDelete={() => handleDeleteUser(selectedUser._id)}
        />
      )}

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={editUser.fullName}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editUser.email}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={editUser.phone}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={editUser.role}
                onChange={handleEditChange}
                select
                SelectProps={{ native: true }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={editUser.address}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={
                  editUser.dateOfBirth
                    ? editUser.dateOfBirth.substring(0, 10)
                    : ""
                }
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password (Optional)"
                name="password"
                type={showEditPassword ? "text" : "password"}
                value={editUser.password}
                onChange={handleEditChange}
                placeholder="Leave empty to keep current password"
                helperText="Minimum 6 characters. Leave empty to keep current password."
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      edge="end"
                    >
                      {showEditPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New User Dialog */}
      <Dialog
        open={openAddUserDialog}
        onClose={handleCloseAddUserDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAddIcon color="primary" />
          Add New {newUser.role === "admin" ? "Admin" : "User"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Full Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="fullName"
                label="Full Name *"
                value={newUser.fullName}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email Address *"
                type="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
              />
            </Grid>

            {/* Username */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="userName"
                label="Username"
                value={newUser.userName}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
                helperText="Leave empty to auto-generate from full name"
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="Password *"
                type={showNewPassword ? "text" : "password"}
                value={newUser.password}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Role *</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  label="Role *"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={newUser.phone}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={newUser.gender}
                  onChange={handleNewUserChange}
                  label="Gender"
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* NIC */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="nic"
                label="National ID Card"
                value={newUser.nic}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
              />
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={newUser.dateOfBirth}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={newUser.address}
                onChange={handleNewUserChange}
                fullWidth
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Required fields:</strong> Full Name, Email, and Password
              <br />
              <strong>Role:</strong> Select "Admin" to create an administrator
              account with full access
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddUserDialog}>Cancel</Button>
          <Button
            onClick={handleSaveNewUser}
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
          >
            Create {newUser.role === "admin" ? "Admin" : "User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;
