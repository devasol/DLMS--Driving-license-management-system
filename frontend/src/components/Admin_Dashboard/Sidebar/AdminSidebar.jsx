import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Dashboard,
  People,
  Assignment,
  EventNote,
  Warning,
  Settings,
  ChevronLeft,
  Logout,
  Quiz,
  Assessment,
  Payment,
  CardMembership,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const AdminSidebar = ({ open, toggleDrawer }) => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    setShowLogoutDialog(false);
    // Redirect to login
    navigate("/signin");
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <StyledDrawer variant="permanent" open={open}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            display: open ? "block" : "none",
            fontWeight: "bold",
            color: "primary.main",
          }}
        >
          Admin Panel
        </Typography>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigation("/admin/dashboard")}>
          <ListItemIcon>
            <Dashboard color="primary" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ color: "text.primary" }} />
        </ListItem>
        <ListItem button onClick={() => handleNavigation("/admin/users")}>
          <ListItemIcon>
            <People color="primary" />
          </ListItemIcon>
          <ListItemText primary="Users" sx={{ color: "text.primary" }} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleNavigation("/admin/applications")}
        >
          <ListItemIcon>
            <Assignment color="primary" />
          </ListItemIcon>
          <ListItemText primary="Applications" sx={{ color: "text.primary" }} />
        </ListItem>
        <ListItem button onClick={() => handleNavigation("/admin/exams")}>
          <ListItemIcon>
            <EventNote color="primary" />
          </ListItemIcon>
          <ListItemText primary="Exams" sx={{ color: "text.primary" }} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleNavigation("/admin/trial-questions")}
        >
          <ListItemIcon>
            <Quiz color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Trial Questions"
            sx={{ color: "text.primary" }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => handleNavigation("/admin/trial-results")}
        >
          <ListItemIcon>
            <Assessment color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Trial Results"
            sx={{ color: "text.primary" }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => handleNavigation("/admin/payments")}
        >
          <ListItemIcon>
            <Payment color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Payment Management"
            sx={{ color: "text.primary" }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => handleNavigation("/admin/licenses")}
        >
          <ListItemIcon>
            <CardMembership color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="License Management"
            sx={{ color: "text.primary" }}
          />
        </ListItem>
        <ListItem button onClick={() => handleNavigation("/admin/violations")}>
          <ListItemIcon>
            <Warning color="primary" />
          </ListItemIcon>
          <ListItemText primary="Violations" sx={{ color: "text.primary" }} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigation("/admin/settings")}>
          <ListItemIcon>
            <Settings color="primary" />
          </ListItemIcon>
          <ListItemText primary="Settings" sx={{ color: "text.primary" }} />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout color="primary" />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: "text.primary" }} />
        </ListItem>
      </List>

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
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.3rem",
            color: "text.primary",
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to log out? You will need to sign in again to
            access the admin panel.
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
    </StyledDrawer>
  );
};

export default AdminSidebar;
