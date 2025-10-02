import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import QRCode from "qrcode";
import { format, parseISO, parse, isValid } from "date-fns";
import axios from "axios";

const LicenseView = ({ licenseNumber }) => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // Build QR code (encode user/license info JSON) when license loads
  useEffect(() => {
    const buildQr = async () => {
      if (!license) return;
      try {
        const dobDate = getDOBDate(license);
        const qrFullName =
          license?.userId?.fullName ||
          license?.userId?.full_name ||
          license?.userId?.user_name ||
          license?.userName ||
          null;
        const payload = {
          licenseNumber: license.number,
          fullName: qrFullName,
          class: license.class,
          dob: dobDate ? format(dobDate, "dd/MM/yyyy") : null,
          age: dobDate ? calcAge(dobDate) : null,
          bloodType: getBloodType(license),
          address: license.userId?.address || null,
          issued: license.issueDate
            ? format(new Date(license.issueDate), "dd/MM/yyyy")
            : null,
          expires: license.expiryDate
            ? format(new Date(license.expiryDate), "dd/MM/yyyy")
            : null,
          status: license.status,
        };
        const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
          width: 160,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrDataUrl(dataUrl);
      } catch (e) {
        console.error("QR generation failed", e);
      }
    };
    buildQr();
  }, [license]);

  const calcAge = (dobInput) => {
    try {
      if (!dobInput) return null;
      const dob = dobInput instanceof Date ? dobInput : new Date(dobInput);
      if (!isValid(dob)) return null;
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      return age;
    } catch {
      return null;
    }
  };
  const tryParseDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isValid(val) ? val : null;
    if (typeof val === "number")
      return isValid(new Date(val)) ? new Date(val) : null;
    if (typeof val === "string") {
      // Try ISO
      const iso = parseISO(val);
      if (isValid(iso)) return iso;
      // Common formats we see in this app
      const ymd = parse(val, "yyyy-MM-dd", new Date());
      if (isValid(ymd)) return ymd;
      const mdy = parse(val, "MM/dd/yyyy", new Date());
      if (isValid(mdy)) return mdy;
      const dmy = parse(val, "dd/MM/yyyy", new Date());
      if (isValid(dmy)) return dmy;
    }
    return null;
  };

  const getDOBDate = (lic) => {
    if (!lic) return null;
    const u = lic.userId || {};
    return (
      tryParseDate(u.dateOfBirth) ||
      tryParseDate(u.dob) ||
      tryParseDate(lic.dateOfBirth) ||
      null
    );
  };

  const getBloodType = (lic) => {
    if (!lic) return null;
    const u = lic.userId || {};
    const bt =
      u.bloodType || u.blood_group || lic.bloodType || lic.bloodGroup || null;
    return bt ? String(bt).toUpperCase().trim() : null;
  };
  const getPhotoUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (typeof profilePicture !== "string") return null;
    // Absolute URL provided
    if (profilePicture.startsWith("http")) return profilePicture;
    // Already a correct absolute path on our origin
    if (profilePicture.startsWith("/uploads")) {
      return profilePicture; // Let Vite proxy or server handle it
    }
    // Sometimes saved without leading slash
    if (profilePicture.startsWith("uploads/")) {
      return `/${profilePicture}`;
    }
    // Otherwise assume it's a filename stored by the uploader
    // Use relative path so it works in dev (Vite proxy) and production
    return `/uploads/profile-pictures/${profilePicture}`;
  };

  useEffect(() => {
    if (licenseNumber) {
      fetchLicense();
    }
  }, [licenseNumber]);

  const fetchLicense = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const response = await axios.get(`/api/payments/license/${userId}`);

      if (response.data.success) {
        // Always fetch full user profile to ensure DOB/age/blood/address/photo are correct
        try {
          const uid = userId;
          const userRes = await axios.get(`/api/users/${uid}`);
          // Merge any existing fields from license.userId (if populated) with user profile
          response.data.license.userId = {
            ...(response.data.license.userId || {}),
            ...userRes.data,
          };
        } catch (e) {
          console.warn("Could not fetch user profile for license view");
        }
        setLicense(response.data.license);
      } else {
        setError("License not found");
      }
    } catch (error) {
      console.error("Error fetching license:", error);
      setError("Error loading license");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!license) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No license found</Alert>
      </Box>
    );
  }

  // Derived fields for rendering (name, DOB, age, blood)
  const renderDOB = getDOBDate(license);
  const renderAge = renderDOB ? calcAge(renderDOB) : null;
  const renderBlood = getBloodType(license);
  const renderFullName = (
    license?.userId?.fullName ||
    license?.userId?.full_name ||
    license?.userId?.user_name ||
    license?.userName ||
    ""
  ).toUpperCase();

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* License Cards Container */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          justifyContent: "center",
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        {/* FRONT SIDE - Clean ID Card Layout */}
        <Box
          sx={{
            width: 350,
            height: 220,
            background: "linear-gradient(135deg, #4a6fa5 0%, #5a7fb8 100%)",
            borderRadius: "8px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            position: "relative",
            color: "white",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: "rgba(255,255,255,0.1)",
              height: "55px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              px: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Ethiopian Flag */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  background: "#FFD700",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                🇪🇹
              </Box>

              {/* Ministry Text */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "10px", fontWeight: "bold", lineHeight: 1.1 }}
                >
                  MINISTRY OF TRANSPORT
                  <br />
                  AND LOGISTICS
                </Typography>
                <Typography sx={{ fontSize: "7px", opacity: 0.9 }}>
                  Federal Democratic Republic of Ethiopia
                </Typography>
                <Typography
                  sx={{ fontSize: "11px", fontWeight: "bold", mt: 0.5 }}
                >
                  DRIVING LICENSE
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: "flex", height: "165px", p: "8px" }}>
            {/* Left - Photo Section */}
            <Box sx={{ width: "28%", pr: 1 }}>
              {/* Photo */}
              <Box
                sx={{
                  width: "100%",
                  height: "90px",
                  background: "#f5f5f5",
                  border: "1px solid white",
                  borderRadius: "3px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 0.5,
                }}
              >
                {license.userId?.profilePicture ? (
                  <img
                    src={getPhotoUrl(license.userId.profilePicture)}
                    alt="User"
                    onError={(e) => {
                      const pp = license.userId?.profilePicture;
                      if (!pp) return;
                      const fallbacks = [];
                      if (typeof pp === "string") {
                        if (pp.startsWith("http")) fallbacks.push(pp);
                        if (pp.startsWith("/uploads")) fallbacks.push(pp);
                        if (pp.startsWith("uploads/")) fallbacks.push(`/${pp}`);
                        // Prefer relative paths; Vite proxies /uploads and /api
                        fallbacks.push(`/uploads/profile-pictures/${pp}`);
                        fallbacks.push(`/api/users/profile-picture/${pp}`);
                      }
                      // Try next valid fallback different from current src
                      const current = e.currentTarget.src;
                      const next = fallbacks.find((u) => u && u !== current);
                      if (next) {
                        e.currentTarget.src = next;
                      } else {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "";
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box sx={{ color: "#666", fontSize: "18px" }}>No Photo</Box>
                )}
              </Box>

              {/* Signature */}
              <Box
                sx={{
                  width: "100%",
                  height: "15px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "5px",
                  fontWeight: "bold",
                }}
              >
                SIGNATURE
              </Box>
            </Box>

            {/* Right - Details Section */}
            <Box sx={{ flex: 1, pl: 1 }}>
              {/* License Number */}
              <Box sx={{ mb: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#FFD700",
                  }}
                >
                  {license.number}
                </Typography>
              </Box>

              {/* Details */}
              <Box
                sx={{
                  fontSize: "7px",
                  lineHeight: 1.15,
                  "& .MuiTypography-root": { fontSize: "7px" },
                }}
              >
                {/* NAME */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    mb: 0.35,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    NAME:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {renderFullName || "N/A"}
                  </Typography>
                </Box>
                {/* CLASS */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    mb: 0.35,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    CLASS:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {license.class || "N/A"}
                  </Typography>
                </Box>
                {/* DOB */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    mb: 0.35,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    DOB:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {renderDOB ? format(renderDOB, "dd/MM/yyyy") : "--/--/----"}
                  </Typography>
                </Box>
                {/* AGE */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    mb: 0.35,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    AGE:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {renderAge ?? "N/A"}
                  </Typography>
                </Box>
                {/* BLOOD */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    mb: 0.35,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    BLOOD:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {renderBlood ?? "N/A"}
                  </Typography>
                </Box>
                {/* ADDRESS */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    mb: 0.35,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    ADDRESS:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {(license.userId?.address || "ADDIS ABABA").toUpperCase()}
                  </Typography>
                </Box>
                {/* ISSUED */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    mb: 0.35,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    ISSUED:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {license.issueDate
                      ? format(new Date(license.issueDate), "dd/MM/yyyy")
                      : "--/--/----"}
                  </Typography>
                </Box>
                {/* EXPIRES */}
                <Box sx={{ display: "grid", gridTemplateColumns: "70px 1fr" }}>
                  <Typography sx={{ fontWeight: "bold", opacity: 0.9 }}>
                    EXPIRES:
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {license.expiryDate
                      ? format(new Date(license.expiryDate), "dd/MM/yyyy")
                      : "--/--/----"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* BACK SIDE - Clean QR Code Layout */}
        <Box
          sx={{
            width: 350,
            height: 220,
            background: "linear-gradient(135deg, #4a6fa5 0%, #5a7fb8 100%)",
            borderRadius: "8px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            position: "relative",
            color: "white",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "rgba(255,255,255,0.1)",
              height: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography sx={{ fontSize: "10px", fontWeight: "bold" }}>
              VERIFICATION & SECURITY
            </Typography>
            <Typography sx={{ fontSize: "6px", opacity: 0.9 }}>
              Scan QR code to verify authenticity
            </Typography>
          </Box>

          {/* QR Code Area */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100% - 65px)",
              px: 2,
            }}
          >
            {/* QR Code */}
            <Box
              sx={{
                width: 120,
                height: 120,
                background: "white",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                border: "1px solid rgba(255,255,255,0.3)",
                overflow: "hidden",
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  style={{ width: 110, height: 110, display: "block" }}
                />
              ) : (
                <Box sx={{ width: 110, height: 110, bgcolor: "#eee" }} />
              )}
            </Box>

            {/* Instructions */}
            <Typography
              sx={{
                fontSize: "8px",
                textAlign: "center",
                lineHeight: 1.2,
                mb: 0.5,
                opacity: 0.9,
              }}
            >
              Scan this QR code to view and verify
              <br />
              license details and authenticity
            </Typography>

            <Typography
              sx={{ fontSize: "7px", fontWeight: "bold", color: "#FFD700" }}
            >
              {`${window.location.host}/verify/${license.number}`}
            </Typography>

            <Typography
              sx={{ fontSize: "7px", fontWeight: "bold", color: "#FFD700" }}
            >
              dlms.gov.et/verify
            </Typography>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.4)",
              height: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 1,
            }}
          >
            <Typography
              sx={{ fontSize: "5px", opacity: 0.8, textAlign: "center" }}
            >
              SECURITY FEATURES: Holographic elements • Microprinting • Digital
              signature • Biometric data
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Card Labels (optional) */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 2 }}>
        <Typography
          sx={{
            fontWeight: "bold",
            color: "text.secondary",
            width: 350,
            textAlign: "center",
          }}
        >
          FRONT
        </Typography>
        <Typography
          sx={{
            fontWeight: "bold",
            color: "text.secondary",
            width: 350,
            textAlign: "center",
          }}
        >
          BACK
        </Typography>
      </Box>
    </Box>
  );
};

export default LicenseView;
