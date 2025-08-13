import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Grid,
  Paper,
  Chip,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Palette,
  Language,
  Notifications,
  Security,
  AccountCircle,
  Visibility,
  VisibilityOff,
  Save,
  RestartAlt,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";

const Settings = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  // Settings state
  const [settings, setSettings] = useState({
    theme: localStorage.getItem("dlms-theme") || "light",
    language: currentLanguage,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    autoSave: true,
    compactView: false,
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // UI state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Load settings from localStorage for now
      const savedSettings = localStorage.getItem(`dlms-settings-${userId}`);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      // Save to localStorage
      localStorage.setItem(`dlms-settings-${userId}`, JSON.stringify(settings));
      localStorage.setItem("dlms-theme", settings.theme);

      // Apply theme change
      if (settings.theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }

      // Apply language change
      if (settings.language !== currentLanguage) {
        changeLanguage(settings.language);
      }

      setSnackbar({
        open: true,
        message: "Settings saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setSnackbar({
        open: true,
        message: "Failed to save settings. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      theme: "light",
      language: "en",
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      autoSave: true,
      compactView: false,
    });
    setSnackbar({
      open: true,
      message: "Settings reset to defaults",
      severity: "info",
    });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords do not match",
        severity: "error",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: "Password must be at least 6 characters long",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `http://localhost:5004/api/users/change-password/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (response.ok) {
        setPasswordDialogOpen(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setSnackbar({
          open: true,
          message: "Password changed successfully!",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || "Failed to change password",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setSnackbar({
        open: true,
        message: "Failed to change password. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const settingSections = [
    {
      title: "Appearance",
      icon: <Palette />,
      items: [
        {
          type: "select",
          label: "Theme",
          key: "theme",
          options: [
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ],
        },
        {
          type: "switch",
          label: "Compact View",
          key: "compactView",
          description: "Use a more compact layout to fit more content",
        },
      ],
    },
    {
      title: "Language & Region",
      icon: <Language />,
      items: [
        {
          type: "select",
          label: "Language",
          key: "language",
          options: [
            { value: "en", label: "English" },
            { value: "am", label: "አማርኛ (Amharic)" },
          ],
        },
      ],
    },
    {
      title: "Notifications",
      icon: <Notifications />,
      items: [
        {
          type: "switch",
          label: "Email Notifications",
          key: "emailNotifications",
          description: "Receive notifications via email",
        },
        {
          type: "switch",
          label: "SMS Notifications",
          key: "smsNotifications",
          description: "Receive notifications via SMS",
        },
        {
          type: "switch",
          label: "Push Notifications",
          key: "pushNotifications",
          description: "Receive browser push notifications",
        },
      ],
    },
    {
      title: "General",
      icon: <SettingsIcon />,
      items: [
        {
          type: "switch",
          label: "Auto Save",
          key: "autoSave",
          description: "Automatically save form data as you type",
        },
      ],
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          <SettingsIcon sx={{ mr: 2, verticalAlign: "middle" }} />
          Settings
        </Typography>

        <Grid container spacing={3}>
          {settingSections.map((section, index) => (
            <Grid item xs={12} md={6} key={section.title}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {section.icon}
                      <Typography
                        variant="h6"
                        sx={{ ml: 1, fontWeight: "bold" }}
                      >
                        {section.title}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {section.items.map((item) => (
                      <Box key={item.key} sx={{ mb: 2 }}>
                        {item.type === "switch" ? (
                          <Box>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={settings[item.key]}
                                  onChange={(e) =>
                                    setSettings((prev) => ({
                                      ...prev,
                                      [item.key]: e.target.checked,
                                    }))
                                  }
                                />
                              }
                              label={item.label}
                            />
                            {item.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {item.description}
                              </Typography>
                            )}
                          </Box>
                        ) : item.type === "select" ? (
                          <FormControl fullWidth>
                            <InputLabel>{item.label}</InputLabel>
                            <Select
                              value={settings[item.key]}
                              label={item.label}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  [item.key]: e.target.value,
                                }))
                              }
                            >
                              {item.options.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : null}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}

          {/* Account Security Section */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Security />
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                      Account Security
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Button
                    variant="outlined"
                    startIcon={<Security />}
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{ mr: 2 }}
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={resetSettings}
            disabled={isLoading}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveSettings}
            disabled={isLoading}
            sx={{
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
              },
            }}
          >
            Save Settings
          </Button>
        </Box>
      </motion.div>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.current ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={isLoading}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
