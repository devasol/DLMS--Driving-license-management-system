import { Card, CardContent, Typography, Button } from "@mui/material";

export default function LicenseInfo() {
  const licenseData = {
    number: "DL-2023-12345",
    issueDate: "15/06/2020",
    expiryDate: "15/06/2030",
    class: "B",
    restrictions: "None",
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">License Details</Typography>
        <Typography>Number: {licenseData.number}</Typography>
        <Typography>Class: {licenseData.class}</Typography>
        <Typography>Expiry: {licenseData.expiryDate}</Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Download PDF
        </Button>
      </CardContent>
    </Card>
  );
}
