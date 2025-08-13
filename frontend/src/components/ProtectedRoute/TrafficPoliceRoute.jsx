import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

const TrafficPoliceRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const userType = localStorage.getItem("userType");
      const userId = localStorage.getItem("userId");

      // Check both new and old authentication methods
      if ((!token || !user) && (!userId || userType !== "traffic_police")) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // If userType is set to traffic_police, allow access
      if (userType === "traffic_police" && userId) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check the user data from token-based auth
      if (user) {
        try {
          const userData = JSON.parse(user);

          // Check if user is traffic police
          if (userData.role === "traffic_police") {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verifying credentials...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default TrafficPoliceRoute;
