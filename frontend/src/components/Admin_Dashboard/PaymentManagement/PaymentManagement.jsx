import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Receipt as ReceiptIcon,
  CardMembership as LicenseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle,
  Cancel,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [licenseClass, setLicenseClass] = useState("B");
  const [processing, setProcessing] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Clear all demo payments
  const clearDemoPayments = () => {
    try {
      localStorage.removeItem("demoPayments");
      fetchAllPayments(); // Refresh the list
      setSnackbar({
        open: true,
        message: "✅ All demo payments cleared successfully",
        severity: "success",
      });
      console.log("🗑️ Cleared all demo payments");
    } catch (error) {
      console.log("Failed to clear demo payments:", error);
    }
  };

  // Debug function to check localStorage
  const debugLocalStorage = () => {
    try {
      const storedPayments = localStorage.getItem("demoPayments");
      console.log("🔍 Debug - Raw localStorage demoPayments:", storedPayments);
      if (storedPayments) {
        const parsedPayments = JSON.parse(storedPayments);
        console.log("🔍 Debug - Parsed payments:", parsedPayments);
        alert(
          `Found ${
            parsedPayments.length
          } demo payments in localStorage:\n\n${parsedPayments
            .map((p) => `${p.userName} - ${p.transactionId} - ${p.status}`)
            .join("\n")}`
        );
      } else {
        alert("No demo payments found in localStorage");
      }
    } catch (error) {
      console.log("❌ Debug error:", error);
      alert("Error reading localStorage: " + error.message);
    }
  };

  useEffect(() => {
    fetchAllPayments();

    // Also set up a periodic refresh to catch new payments
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing payments...");
      fetchAllPayments();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from the real backend first
      console.log("🔄 Fetching all payments from backend...");

      const response = await axios.get(
        "http://localhost:5004/api/payments/all",
        {
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setPayments(response.data.payments);
        setServerAvailable(true);
        console.log(
          `✅ Loaded ${response.data.payments.length} payments from backend`
        );
        setSnackbar({
          open: true,
          message: `✅ Loaded ${response.data.payments.length} payments from database`,
          severity: "success",
        });
        return;
      }
    } catch (error) {
      console.error("❌ Error fetching payments:", error);

      if (error.response) {
        // Server responded with error
        if (error.response.status === 404) {
          // Route not found - try fallback to pending payments
          console.log(
            "🔄 /all route not found, falling back to pending payments"
          );
          try {
            const fallbackResponse = await axios.get(
              "http://localhost:5004/api/payments/pending",
              {
                timeout: 10000,
              }
            );
            if (fallbackResponse.data.success) {
              setPayments(fallbackResponse.data.payments);
              setServerAvailable(true);
              console.log(
                `✅ Loaded ${fallbackResponse.data.payments.length} pending payments (fallback)`
              );
              setSnackbar({
                open: true,
                message:
                  "⚠️ Backend route /api/payments/all not found. Please add the getAllPayments route to paymentRoutes.js. Showing pending payments only.",
                severity: "warning",
              });
              return;
            }
          } catch (fallbackError) {
            console.log("Fallback to pending also failed");
          }
        }
        setError(
          `Server error (${error.response.status}): ${
            error.response.data?.message || "Unknown error"
          }`
        );
        setServerAvailable(false);
      } else if (error.request) {
        // Network error
        setError("Cannot connect to server. Please check your connection.");
        setServerAvailable(false);

        // Load demo data for testing - include all statuses
        const baseDemoPayments = [
          {
            _id: "demo_payment_1",
            userName: "Alemayehu Tadesse",
            userId: {
              email: "alemayehu.tadesse@gmail.com",
              phone: "+251911234567",
              firstName: "Alemayehu",
              lastName: "Tadesse",
              dateOfBirth: "1995-03-15",
              address: "Bole, Addis Ababa",
            },
            amount: 500,
            currency: "ETB",
            paymentMethod: "telebirr",
            transactionId: "TB123456789",
            paymentDate: new Date(
              Date.now() - 1000 * 60 * 60 * 2
            ).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            receiptImage: "uploads/demo_receipt_1.jpg",
            status: "pending",
          },
          {
            _id: "demo_payment_2",
            userName: "Meron Bekele",
            userId: {
              email: "meron.bekele@yahoo.com",
              phone: "+251922345678",
              firstName: "Meron",
              lastName: "Bekele",
              dateOfBirth: "1992-08-22",
              address: "Piassa, Addis Ababa",
            },
            amount: 500,
            currency: "ETB",
            paymentMethod: "bank_transfer",
            transactionId: "BT987654321",
            paymentDate: new Date(
              Date.now() - 1000 * 60 * 60 * 4
            ).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            receiptImage: "uploads/demo_receipt_2.jpg",
            status: "verified",
            reviewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            adminNotes: "Payment verified and license issued",
          },
          {
            _id: "demo_payment_3",
            userName: "Dawit Haile",
            userId: {
              email: "dawit.haile@outlook.com",
              phone: "+251933456789",
              firstName: "Dawit",
              lastName: "Haile",
              dateOfBirth: "1988-12-10",
              address: "Kazanchis, Addis Ababa",
            },
            amount: 500,
            currency: "ETB",
            paymentMethod: "cbe_birr",
            transactionId: "CBE445566778",
            paymentDate: new Date(
              Date.now() - 1000 * 60 * 60 * 6
            ).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            receiptImage: "uploads/demo_receipt_3.jpg",
            status: "rejected",
            reviewedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            adminNotes: "Receipt image unclear, please resubmit",
          },
          {
            _id: "demo_payment_4",
            userName: "Hanan Mohammed",
            userId: {
              email: "hanan.mohammed@gmail.com",
              phone: "+251944567890",
              firstName: "Hanan",
              lastName: "Mohammed",
              dateOfBirth: "1997-05-18",
              address: "Megenagna, Addis Ababa",
            },
            amount: 500,
            currency: "ETB",
            paymentMethod: "telebirr",
            transactionId: "TB998877665",
            paymentDate: new Date(
              Date.now() - 1000 * 60 * 60 * 8
            ).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            receiptImage: "uploads/demo_receipt_4.jpg",
            status: "verified",
            reviewedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            adminNotes: "Payment approved, Class B license issued",
          },
          {
            _id: "demo_payment_5",
            userName: "Yohannes Girma",
            userId: {
              email: "yohannes.girma@hotmail.com",
              phone: "+251955678901",
              firstName: "Yohannes",
              lastName: "Girma",
              dateOfBirth: "1990-11-03",
              address: "Gerji, Addis Ababa",
            },
            amount: 500,
            currency: "ETB",
            paymentMethod: "bank_transfer",
            transactionId: "BT556677889",
            paymentDate: new Date(
              Date.now() - 1000 * 60 * 60 * 12
            ).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            receiptImage: "uploads/demo_receipt_5.jpg",
            status: "pending",
          },
        ];

        // Check for user-submitted demo payments in localStorage
        const userSubmittedPayments = [];
        try {
          const storedPayments = localStorage.getItem("demoPayments");
          console.log("🔍 Raw localStorage demoPayments:", storedPayments);
          if (storedPayments) {
            const parsedPayments = JSON.parse(storedPayments);
            userSubmittedPayments.push(...parsedPayments);
            console.log(
              `📋 Found ${parsedPayments.length} user-submitted demo payments:`,
              parsedPayments
            );
          } else {
            console.log("📋 No demoPayments found in localStorage");
          }
        } catch (error) {
          console.log("❌ Error parsing user-submitted payments:", error);
        }

        // Combine base demo payments with user-submitted payments
        const demoPayments = [...baseDemoPayments, ...userSubmittedPayments];
        setPayments(demoPayments);
        console.log("🔄 Loaded demo payment data with all statuses");
      } else {
        setError("Unexpected error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailDialog(true);
  };

  const handleApprove = (payment) => {
    console.log("🔄 Preparing to approve payment:", payment);
    setSelectedPayment(payment);
    setAdminNotes("");
    setLicenseClass("B");
    setShowApprovalDialog(true);
  };

  const handleReject = (payment) => {
    setSelectedPayment(payment);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleDelete = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setProcessing(true);
      const adminId = localStorage.getItem("userId");

      if (!serverAvailable) {
        // Demo mode
        console.log("🔄 Demo mode: Deleting payment", selectedPayment._id);

        // Remove from localStorage if it's a user-submitted demo payment
        try {
          const storedPayments = JSON.parse(
            localStorage.getItem("demoPayments") || "[]"
          );
          const updatedPayments = storedPayments.filter(
            (p) => p._id !== selectedPayment._id
          );
          localStorage.setItem("demoPayments", JSON.stringify(updatedPayments));
          console.log("💾 Removed deleted payment from localStorage");
        } catch (error) {
          console.log("Failed to update localStorage:", error);
        }

        setPayments((prev) =>
          prev.filter((p) => p._id !== selectedPayment._id)
        );
        setShowDeleteDialog(false);
        setSnackbar({
          open: true,
          message: "✅ Payment deleted successfully (Demo Mode)",
          severity: "success",
        });
        return;
      }

      const response = await axios.delete(
        `http://localhost:5004/api/payments/delete/${selectedPayment._id}`,
        {
          data: { adminId },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        await fetchAllPayments(); // Refresh list
        setShowDeleteDialog(false);
        setSnackbar({
          open: true,
          message: "✅ Payment deleted successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "❌ Failed to delete payment: " + response.data.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error deleting payment:", error);

      if (error.response) {
        setSnackbar({
          open: true,
          message: `❌ Server error (${error.response.status}): ${
            error.response.data?.message || "Unknown error"
          }`,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "❌ Cannot connect to server. Please check your connection.",
          severity: "error",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessing(true);
      const adminId = localStorage.getItem("userId");

      if (!serverAvailable) {
        // Demo mode
        console.log("🔄 Demo mode: Rejecting payment", selectedPayment._id);

        // Remove from localStorage if it's a user-submitted demo payment
        try {
          const storedPayments = JSON.parse(
            localStorage.getItem("demoPayments") || "[]"
          );
          const updatedPayments = storedPayments.filter(
            (p) => p._id !== selectedPayment._id
          );
          localStorage.setItem("demoPayments", JSON.stringify(updatedPayments));
          console.log("💾 Removed rejected payment from localStorage");
        } catch (error) {
          console.log("Failed to update localStorage:", error);
        }

        setPayments((prev) =>
          prev.filter((p) => p._id !== selectedPayment._id)
        );
        setShowRejectDialog(false);
        setSnackbar({
          open: true,
          message: "✅ Payment rejected successfully (Demo Mode)",
          severity: "success",
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5004/api/payments/reject/${selectedPayment._id}`,
        {
          adminId,
          adminNotes: rejectReason,
        },
        { timeout: 10000 }
      );

      if (response.data.success) {
        await fetchPendingPayments(); // Refresh list
        setShowRejectDialog(false);
        setSnackbar({
          open: true,
          message: "✅ Payment rejected successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "❌ Failed to reject payment: " + response.data.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error rejecting payment:", error);

      if (error.response) {
        setSnackbar({
          open: true,
          message: `❌ Server error (${error.response.status}): ${
            error.response.data?.message || "Unknown error"
          }`,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "❌ Cannot connect to server. Please check your connection.",
          severity: "error",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  // Test payment data before approval
  const testPaymentData = async (paymentId) => {
    try {
      console.log("🧪 Testing payment data for:", paymentId);
      const response = await axios.get(
        `http://localhost:5004/api/payments/all`
      );
      const payment = response.data.payments?.find((p) => p._id === paymentId);
      console.log("📋 Payment data found:", payment);
      return payment;
    } catch (error) {
      console.error("❌ Error testing payment data:", error);
      return null;
    }
  };

  const handleConfirmApproval = async () => {
    try {
      setProcessing(true);
      const adminId = localStorage.getItem("userId");

      // Validate required data
      if (!selectedPayment || !selectedPayment._id) {
        setSnackbar({
          open: true,
          message: "❌ No payment selected for approval",
          severity: "error",
        });
        return;
      }

      // Test payment data
      await testPaymentData(selectedPayment._id);

      if (!adminId) {
        setSnackbar({
          open: true,
          message: "❌ Admin ID not found. Please login again.",
          severity: "error",
        });
        return;
      }

      if (!licenseClass) {
        setSnackbar({
          open: true,
          message: "❌ Please select a license class",
          severity: "error",
        });
        return;
      }

      if (!serverAvailable) {
        // Demo mode
        console.log(
          "🔄 Demo mode: Approving payment and issuing license",
          selectedPayment._id
        );

        // Remove from localStorage if it's a user-submitted demo payment
        try {
          const storedPayments = JSON.parse(
            localStorage.getItem("demoPayments") || "[]"
          );
          const updatedPayments = storedPayments.filter(
            (p) => p._id !== selectedPayment._id
          );
          localStorage.setItem("demoPayments", JSON.stringify(updatedPayments));
          console.log("💾 Removed approved payment from localStorage");
        } catch (error) {
          console.log("Failed to update localStorage:", error);
        }

        setPayments((prev) =>
          prev.filter((p) => p._id !== selectedPayment._id)
        );
        setShowApprovalDialog(false);
        setSnackbar({
          open: true,
          message: `✅ Payment approved and ${licenseClass} class license issued successfully! (Demo Mode)`,
          severity: "success",
        });
        return;
      }

      console.log("🔄 Approving payment:", {
        paymentId: selectedPayment._id,
        adminId,
        licenseClass,
        adminNotes: adminNotes || "No notes",
      });

      const response = await axios.put(
        `http://localhost:5004/api/payments/verify/${selectedPayment._id}`,
        {
          adminId,
          adminNotes: adminNotes || "",
          licenseClass,
        },
        {
          timeout: 15000, // Longer timeout for license issuance
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📡 Payment approval response:", response.data);

      if (response.data.success) {
        await fetchPendingPayments(); // Refresh list
        setShowApprovalDialog(false);
        setSnackbar({
          open: true,
          message: `✅ Payment approved and ${licenseClass} class license issued successfully!`,
          severity: "success",
        });
        console.log("✅ License issued:", response.data.license);
      } else {
        console.error("❌ Payment approval failed:", response.data);
        setSnackbar({
          open: true,
          message:
            "❌ Failed to approve payment: " +
            (response.data.message || "Unknown error"),
          severity: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error approving payment:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        let message = "Unknown error";

        if (typeof errorData === "string") {
          message = errorData;
        } else if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.error) {
          message = errorData.error;
        }

        // Handle specific error cases
        if (status === 404) {
          message = "Payment not found. It may have been already processed.";
        } else if (status === 400) {
          message =
            errorData?.message ||
            "Invalid request. Please check the payment details.";
        } else if (status === 500) {
          message =
            "Server error occurred. Please try again or contact support.";
        }

        setSnackbar({
          open: true,
          message: `❌ Server error (${status}): ${message}`,
          severity: "error",
        });
      } else if (error.code === "ECONNABORTED") {
        setSnackbar({
          open: true,
          message:
            "❌ Request timeout. The server is taking too long to respond.",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "❌ Cannot connect to server. Please check your connection.",
          severity: "error",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      bank_transfer: "primary",
      telebirr: "success",
      cbe_birr: "info",
      cash: "warning",
    };
    return colors[method] || "default";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      verified: "success",
      rejected: "error",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <PaymentIcon />;
      case "verified":
        return <CheckCircle />;
      case "rejected":
        return <Cancel />;
      default:
        return <PaymentIcon />;
    }
  };

  // Filter payments based on search term, payment method, and status
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPaymentMethod =
      paymentMethodFilter === "all" ||
      payment.paymentMethod === paymentMethodFilter;

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesPaymentMethod && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        💳 Payment Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and manage all license payments - pending, approved, and rejected
      </Typography>

      {/* Demo Mode Status */}
      {!serverAvailable && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            🎯 Demo Mode Active
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Status:</strong> Running in demonstration mode with full
            functionality
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Features Available:</strong>
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>✅ View all payment types (pending, approved, rejected)</li>
            <li>✅ User-submitted payments from "Get License" page</li>
            <li>✅ Approve and reject payments</li>
            <li>✅ Search and filter functionality</li>
            <li>✅ Payment statistics and analytics</li>
            <li>✅ Complete admin workflow testing</li>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: "success.main" }}
          >
            All payment management features work perfectly in demo mode! 🎉
          </Typography>
        </Alert>
      )}

      {error && serverAvailable && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>❌ Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethodFilter}
                label="Payment Method"
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="telebirr">TeleBirr</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="cbe_birr">CBE Birr</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={fetchAllPayments}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
              fullWidth
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </Grid>
          <Grid item xs={12} md={1}>
            {!serverAvailable && (
              <Button
                variant="outlined"
                color="warning"
                onClick={clearDemoPayments}
                fullWidth
                size="small"
                title="Clear all demo payments"
              >
                Clear Demo
              </Button>
            )}
          </Grid>
          <Grid item xs={12} md={1}>
            {!serverAvailable && (
              <Button
                variant="outlined"
                color="info"
                onClick={debugLocalStorage}
                fullWidth
                size="small"
                title="Debug localStorage payments"
              >
                Debug
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Filter Status */}
        {(searchTerm ||
          paymentMethodFilter !== "all" ||
          statusFilter !== "all") && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
            <Typography variant="body2" color="info.dark">
              <strong>Active Filters:</strong>
              {searchTerm && ` Search: "${searchTerm}"`}
              {searchTerm &&
                (paymentMethodFilter !== "all" || statusFilter !== "all") &&
                " • "}
              {statusFilter !== "all" &&
                ` Status: ${
                  statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
                }`}
              {statusFilter !== "all" && paymentMethodFilter !== "all" && " • "}
              {paymentMethodFilter !== "all" &&
                ` Payment Method: ${paymentMethodFilter
                  .replace("_", " ")
                  .toUpperCase()}`}
              {" • "}
              Showing {filteredPayments.length} of {payments.length} payments
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setPaymentMethodFilter("all");
                  setStatusFilter("all");
                }}
                sx={{ ml: 2, textTransform: "none" }}
              >
                Clear Filters
              </Button>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <PaymentIcon
                sx={{ fontSize: 32, color: "warning.main", mb: 1 }}
              />
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {payments.filter((p) => p.status === "pending").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <CheckCircle
                sx={{ fontSize: 32, color: "success.main", mb: 1 }}
              />
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {payments.filter((p) => p.status === "verified").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Cancel sx={{ fontSize: 32, color: "error.main", mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {payments.filter((p) => p.status === "rejected").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <SearchIcon sx={{ fontSize: 32, color: "info.main", mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="info.main">
                {filteredPayments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {payments
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()}{" "}
                ETB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <Alert severity="info">
          No payments found. Payments will appear here when users submit license
          payment requests.
        </Alert>
      ) : filteredPayments.length === 0 ? (
        <Alert severity="warning">
          No payments match your search criteria. Try adjusting your search
          terms or filters.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {payment.userName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {payment.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.userId?.email || "No email"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {payment.amount} {payment.currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.paymentMethod
                        .replace("_", " ")
                        .toUpperCase()}
                      color={getPaymentMethodColor(payment.paymentMethod)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {payment.transactionId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(payment.status)}
                      label={
                        payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)
                      }
                      color={getStatusColor(payment.status)}
                      size="small"
                      variant={
                        payment.status === "pending" ? "outlined" : "filled"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.paymentDate), "PPP")}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Tooltip title="View payment details and receipt">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewDetails(payment)}
                        >
                          View
                        </Button>
                      </Tooltip>
                      {payment.status === "pending" && (
                        <>
                          <Tooltip title="Approve payment and issue license">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleApprove(payment)}
                              disabled={processing}
                            >
                              Approve
                            </Button>
                          </Tooltip>
                          <Tooltip title="Reject payment with reason">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<RejectIcon />}
                              onClick={() => handleReject(payment)}
                              disabled={processing}
                            >
                              Reject
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete payment (only pending payments can be deleted)">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(payment)}
                              disabled={processing}
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </>
                      )}
                      {payment.status === "verified" && (
                        <Chip
                          label="License Issued"
                          color="success"
                          size="small"
                          icon={<LicenseIcon />}
                        />
                      )}
                      {payment.status === "rejected" && (
                        <>
                          {payment.adminNotes && (
                            <Tooltip
                              title={`Rejection reason: ${payment.adminNotes}`}
                            >
                              <Chip
                                label="View Reason"
                                color="error"
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          )}
                          <Tooltip title="Delete rejected payment">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(payment)}
                              disabled={processing}
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={3}>
              {/* User Profile Section */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar sx={{ width: 64, height: 64, fontSize: "1.5rem" }}>
                    {selectedPayment.userName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedPayment.userName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      License Payment Request
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* User Information */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  sx={{ mb: 2 }}
                >
                  👤 User Information
                </Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Full Name:</strong> {selectedPayment.userName}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Email:</strong>{" "}
                    {selectedPayment.userId?.email || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone:</strong>{" "}
                    {selectedPayment.userId?.phone || "N/A"}
                  </Typography>
                  {selectedPayment.userId?.dateOfBirth && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Date of Birth:</strong>{" "}
                      {format(
                        new Date(selectedPayment.userId.dateOfBirth),
                        "PPP"
                      )}
                    </Typography>
                  )}
                  {selectedPayment.userId?.address && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Address:</strong> {selectedPayment.userId.address}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Payment Information */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ mb: 2 }}
                >
                  💳 Payment Information
                </Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Amount:</strong> {selectedPayment.amount}{" "}
                    {selectedPayment.currency}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Method:</strong>
                    <Chip
                      label={selectedPayment.paymentMethod
                        .replace("_", " ")
                        .toUpperCase()}
                      color={getPaymentMethodColor(
                        selectedPayment.paymentMethod
                      )}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Transaction ID:</strong>
                    <Typography
                      component="span"
                      fontFamily="monospace"
                      sx={{
                        ml: 1,
                        bgcolor: "grey.100",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {selectedPayment.transactionId}
                    </Typography>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Payment Date:</strong>{" "}
                    {format(new Date(selectedPayment.paymentDate), "PPP")}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Submitted:</strong>{" "}
                    {format(new Date(selectedPayment.createdAt), "PPp")}
                  </Typography>
                </Box>
              </Grid>

              {/* Receipt Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="info.main"
                  sx={{ mb: 2 }}
                >
                  🧾 Payment Receipt
                </Typography>
                <Box sx={{ pl: 1 }}>
                  {selectedPayment.receiptImage ? (
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Button
                        variant="contained"
                        startIcon={<ReceiptIcon />}
                        onClick={() =>
                          window.open(
                            `http://localhost:5004/${selectedPayment.receiptImage}`,
                            "_blank"
                          )
                        }
                        sx={{ textTransform: "none" }}
                      >
                        View Receipt Image
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        Click to open receipt in new tab
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="warning">No receipt image available</Alert>
                  )}
                </Box>
              </Grid>

              {/* Status Information */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Status:</strong> This payment is pending admin
                    review. Please verify the payment details and receipt before
                    approving or rejecting.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Payment & Issue License</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>✅ Approval Action:</strong> This will approve the payment
              and automatically issue a driving license to the user.
            </Typography>
          </Alert>

          {/* User Summary */}
          {selectedPayment && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Approving payment for:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {selectedPayment.userName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedPayment.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPayment.userId?.email} • {selectedPayment.amount}{" "}
                    {selectedPayment.currency}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>License Class *</InputLabel>
            <Select
              value={licenseClass}
              label="License Class *"
              onChange={(e) => setLicenseClass(e.target.value)}
              required
            >
              <MenuItem value="A">
                Class A - Motorcycle (Two-wheeled vehicles)
              </MenuItem>
              <MenuItem value="B">
                Class B - Car (Private vehicles up to 3,500kg)
              </MenuItem>
              <MenuItem value="C">
                Class C - Truck (Heavy vehicles over 3,500kg)
              </MenuItem>
              <MenuItem value="D">
                Class D - Bus (Passenger vehicles with more than 8 seats)
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Admin Notes (Optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes about this approval (e.g., special conditions, remarks)..."
            helperText="These notes will be included in the license record"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmApproval}
            variant="contained"
            color="success"
            disabled={processing}
          >
            {processing ? (
              <CircularProgress size={20} />
            ) : (
              "Approve & Issue License"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Payment</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This will reject the payment and notify the user. The user will need
            to resubmit their payment.
          </Alert>

          {selectedPayment && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Rejecting payment from:{" "}
                <strong>{selectedPayment.userName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount:{" "}
                <strong>
                  {selectedPayment.amount} {selectedPayment.currency}
                </strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction ID: <strong>{selectedPayment.transactionId}</strong>
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a clear reason for rejecting this payment..."
            required
            error={!rejectReason.trim() && rejectReason !== ""}
            helperText={
              !rejectReason.trim() && rejectReason !== ""
                ? "Reason is required"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            color="error"
            disabled={processing || !rejectReason.trim()}
          >
            {processing ? <CircularProgress size={20} /> : "Reject Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>⚠️ Warning:</strong> This action cannot be undone. The
              payment record will be permanently deleted from the system.
            </Typography>
          </Alert>

          {selectedPayment && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Payment to be deleted:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {selectedPayment.userName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedPayment.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPayment.amount} {selectedPayment.currency} •{" "}
                    {selectedPayment.transactionId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: <Chip label={selectedPayment.status} size="small" />
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this payment? This action is
            irreversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={processing}
          >
            {processing ? <CircularProgress size={20} /> : "Delete Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentManagement;
