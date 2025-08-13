import React from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import LicenseView from "../components/User_Dashboard/LicenseView/LicenseView";

const LicensePreviewPage = () => {
  const { licenseNumber } = useParams();

  return (
    <Box sx={{ p: 2 }}>
      <LicenseView licenseNumber={licenseNumber} />
    </Box>
  );
};

export default LicensePreviewPage;

