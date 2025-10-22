import { Card, CardContent, Typography, Chip } from "@mui/material";
import { CheckCircle, Warning, Error } from "@mui/icons-material";

export default function QuickStats() {
  const licenseStatus = "Valid"; // Mock data
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">License Status</Typography>
        {licenseStatus === "Valid" && (
          <Chip icon={<CheckCircle />} label="Valid" color="success" />
        )}
        {licenseStatus === "Expired" && (
          <Chip icon={<Error />} label="Expired" color="error" />
        )}
        <Typography sx={{ mt: 2 }}>Renewal Due: 15 Dec 2023</Typography>
      </CardContent>
    </Card>
  );
}
