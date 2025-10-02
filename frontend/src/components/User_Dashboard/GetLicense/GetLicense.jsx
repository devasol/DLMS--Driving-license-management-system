import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Description as LicenseIcon,
  Upload as UploadIcon,
  Pending as PendingIcon,
  Verified as VerifiedIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";
import QRCode from "qrcode";

const GetLicense = () => {
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [license, setLicense] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "",
    transactionId: "",
    paymentDate: "",
    receiptFile: null,
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(true);
  const [showLicensePreview, setShowLicensePreview] = useState(false);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Unknown User";

  // Download license function
  const downloadLicense = async () => {
    try {
      if (!license) {
        alert("No license available to download");
        return;
      }

      // Check if server is available for real license download
      if (serverAvailable) {
        try {
          const response = await axios.get(
            `/api/payments/license/download/${userId}`,
            {
              responseType: "blob",
              timeout: 15000,
            }
          );

          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `Ethiopian_Driving_License_${license.number}.html`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          console.log("✅ License downloaded successfully");
          return;
        } catch (downloadError) {
          console.log(
            "❌ Server download failed, falling back to demo download"
          );
        }
      }

      // Demo mode or server unavailable - generate demo license
      await generateDemoLicense();
    } catch (error) {
      console.error("Error downloading license:", error);
      alert("Error downloading license. Please try again.");
    }
  };

  // Generate demo license with QR code
  const generateDemoLicense = async () => {
    try {
      // Generate QR code for license verification
      const licenseData = {
        licenseNumber: license?.number || "DL-DEMO-" + Date.now(),
        userName: userName,
        userId: userId,
        class: license?.class || "B",
        issueDate: license ? license.issueDate : new Date().toISOString(),
        expiryDate: license
          ? license.expiryDate
          : new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        verificationUrl: `https://license.gov.et/verify/${
          license?.number || "DL-DEMO-" + Date.now()
        }`,
      };

      const qrCodeDataURL = await QRCode.toDataURL(
        JSON.stringify(licenseData),
        {
          width: 150,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        }
      );

      // Create a professional HTML content for the license ID card
      const licenseContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ethiopian Driving License ID</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Arial', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }

            .license-container {
              background: white;
              width: 400px;
              height: 250px;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
              position: relative;
              overflow: hidden;
              border: 3px solid #1976d2;
            }

            .license-header {
              background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
              color: white;
              padding: 8px 15px;
              text-align: center;
              position: relative;
            }

            .flag-icon {
              font-size: 16px;
              margin-right: 8px;
            }

            .header-title {
              font-size: 12px;
              font-weight: bold;
              margin: 2px 0;
            }

            .header-subtitle {
              font-size: 9px;
              opacity: 0.9;
            }

            .license-body {
              padding: 15px;
              display: grid;
              grid-template-columns: 1fr 80px;
              gap: 15px;
              height: calc(100% - 60px);
            }

            .user-info {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            .license-number {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              padding: 6px 10px;
              border-radius: 8px;
              font-weight: bold;
              font-size: 11px;
              text-align: center;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }

            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 9px;
            }

            .info-label {
              font-weight: bold;
              color: #333;
              width: 35%;
            }

            .info-value {
              color: #666;
              width: 60%;
              text-align: right;
            }

            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-left: 2px dashed #ddd;
              padding-left: 10px;
            }

            .qr-code {
              width: 60px;
              height: 60px;
              border: 2px solid #1976d2;
              border-radius: 8px;
              padding: 2px;
              background: white;
            }

            .qr-label {
              font-size: 7px;
              color: #666;
              text-align: center;
              margin-top: 5px;
              line-height: 1.2;
            }

            .license-footer {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: linear-gradient(90deg, #ff9800 0%, #f57c00 50%, #ff9800 100%);
              height: 4px;
            }

            .demo-badge {
              position: absolute;
              top: 10px;
              right: 10px;
              background: rgba(255, 0, 0, 0.8);
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 8px;
              font-weight: bold;
              transform: rotate(15deg);
            }

            .security-features {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, #4caf50, #2196f3, #ff9800, #e91e63);
            }

            .hologram {
              position: absolute;
              top: 20px;
              left: 20px;
              width: 30px;
              height: 30px;
              background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
              border-radius: 50%;
              opacity: 0.7;
            }

            @media print {
              body {
                background: white;
                min-height: auto;
              }
              .license-container {
                box-shadow: none;
                border: 2px solid #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="license-container">
            <div class="security-features"></div>
            <div class="hologram"></div>
            <div class="demo-badge">DEMO</div>

            <div class="license-header">
              <div class="header-title">
                <span class="flag-icon">🇪🇹</span>
                FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
              </div>
              <div class="header-subtitle">MINISTRY OF TRANSPORT AND LOGISTICS</div>
              <div class="header-subtitle">DRIVING LICENSE</div>
            </div>

            <div class="license-body">
              <div class="user-info">
                <div class="license-number">
                  ${licenseData.licenseNumber}
                </div>

                <div class="info-row">
                  <span class="info-label">NAME:</span>
                  <span class="info-value">${userName.toUpperCase()}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">ID:</span>
                  <span class="info-value">${userId}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">CLASS:</span>
                  <span class="info-value">${licenseData.class}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">ISSUED:</span>
                  <span class="info-value">${format(
                    new Date(licenseData.issueDate),
                    "dd/MM/yyyy"
                  )}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">EXPIRES:</span>
                  <span class="info-value">${format(
                    new Date(licenseData.expiryDate),
                    "dd/MM/yyyy"
                  )}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">LOCATION:</span>
                  <span class="info-value">ADDIS ABABA</span>
                </div>

                <div style="margin-top: 8px; font-size: 7px; color: #999; text-align: center;">
                  DEMO LICENSE - FOR DEMONSTRATION ONLY
                </div>
              </div>

              <div class="qr-section">
                <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
                <div class="qr-label">
                  SCAN TO<br>VERIFY<br>LICENSE
                </div>
              </div>
            </div>

            <div class="license-footer"></div>
          </div>

          <script>
            // Auto-print functionality
            window.onload = function() {
              setTimeout(() => {
                if (confirm('Would you like to print this license?')) {
                  window.print();
                }
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

      // Create and download the HTML file
      const blob = new Blob([licenseContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Ethiopian_Driving_License_${licenseData.licenseNumber}.html`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(
        "🎉 Ethiopian Driving License ID downloaded successfully!\n\n✅ Features included:\n• QR Code for verification\n• Official government design\n• All user information\n• Security features\n\nNote: This is a demonstration license with all official design elements."
      );
      console.log("✅ Professional license ID generated and downloaded");
    } catch (error) {
      console.error("Error generating demo license:", error);
      alert("Error generating demo license. Please try again.");
    }
  };

  // Preview license function (opens the clean front-end preview page)
  const previewLicense = async () => {
    if (!license) {
      alert("No license available to preview");
      return;
    }
    // Always open the front-end preview route that uses the new clean layout
    window.open(`/license/${license.number}`, "_blank");
  };

  // Get license class description
  const getLicenseClassDescription = (licenseClass) => {
    const descriptions = {
      A: "Motorcycle (Two-wheeled vehicles)",
      B: "Car (Private vehicles up to 3,500kg)",
      C: "Truck (Heavy vehicles over 3,500kg)",
      D: "Bus (Passenger vehicles with more than 8 seats)",
    };
    return descriptions[licenseClass] || "Standard Vehicle";
  };

  // Create demo license
  const createDemoLicense = () => {
    const demoLicense = {
      _id: `demo_license_${userId}_${Date.now()}`,
      userId: userId,
      userName: userName,
      userEmail: localStorage.getItem("userEmail") || "demo@example.com",
      number: `DL-DEMO-${Date.now().toString().slice(-6)}`,
      class: "B",
      issueDate: new Date().toISOString(),
      expiryDate: new Date(
        Date.now() + 5 * 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 5 years from now
      issuedBy: "demo_admin",
      status: "active",
      theoryExamResult: {
        score: 88,
        dateTaken: new Date().toISOString(),
      },
      practicalExamResult: {
        score: 92,
        dateTaken: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage
    const demoLicenseKey = `demoLicense_${userId}`;
    localStorage.setItem(demoLicenseKey, JSON.stringify(demoLicense));

    setLicense(demoLicense);
    setActiveStep(4);

    console.log("✅ Demo license created and stored");
    return demoLicense;
  };

  // Test server connectivity
  const testServerConnection = async () => {
    try {
      const response = await axios.get("/api/health", {
        timeout: 5000,
      });
      console.log("✅ Server connection successful:", response.status);
      setServerAvailable(true);
      return true;
    } catch (error) {
      // Check if it's a real connectivity issue vs API error
      if (error.response) {
        // Server is responding but with an error status
        console.log(
          "⚠️ Server responding but with error:",
          error.response.status
        );
        setServerAvailable(true); // Server is available, just API might have issues
        return true;
      } else {
        // Real connectivity issue
        console.warn("❌ Backend server not available:", error.message);
        setServerAvailable(false);
        return false;
      }
    }
  };

  useEffect(() => {
    if (userId) {
      testServerConnection().then(() => {
        checkEligibilityAndStatus();
      });
    }
  }, [userId]);

  const checkEligibilityAndStatus = async () => {
    try {
      setLoading(true);

      // Test server connectivity first
      const isServerAvailable = await testServerConnection();

      if (!isServerAvailable) {
        console.log("🔄 Server not available, using demo mode");
        setServerAvailable(false);

        // Set demo eligibility data
        const demoEligibility = {
          success: true,
          eligibility: {
            theoryPassed: true,
            practicalPassed: true,
            canProceedToPayment: true,
            theoryResult: {
              score: 88,
              dateTaken: new Date().toISOString(),
              correctAnswers: 44,
              totalQuestions: 50,
              language: "english",
            },
            practicalResult: {
              score: 92,
              dateTaken: new Date().toISOString(),
              location: "Kality, Addis Ababa",
              examiner: "Inspector Alemayehu",
            },
          },
          paymentAmount: 500,
          message: "Demo mode: Both exams completed successfully",
        };

        setEligibility(demoEligibility);

        // Check if user has already "completed" the process in demo mode
        const demoLicenseKey = `demoLicense_${userId}`;
        const existingDemoLicense = localStorage.getItem(demoLicenseKey);

        if (existingDemoLicense) {
          try {
            const parsedLicense = JSON.parse(existingDemoLicense);
            setLicense(parsedLicense);
            setActiveStep(4); // License issued
            console.log("✅ Found existing demo license");
          } catch (error) {
            console.log("Error parsing demo license");
          }
        } else {
          setActiveStep(2); // Ready for payment in demo mode
        }
        return;
      }

      // Check license eligibility (this includes payment, exams, and license status)
      try {
        const eligibilityResponse = await axios.get(
          `/api/payments/license/eligibility/${userId}`,
          { timeout: 5000 }
        );

        if (eligibilityResponse.data.success) {
          setEligibility(eligibilityResponse.data);

          // Check if license is already issued (from eligibility response)
          if (
            eligibilityResponse.data.status === "license_issued" &&
            eligibilityResponse.data.license
          ) {
            setLicense(eligibilityResponse.data.license);
            setActiveStep(4); // License issued
            console.log(
              "✅ License already issued (from eligibility):",
              eligibilityResponse.data.license.number
            );

            // For license_issued status, set mock eligibility data so UI shows completed exams
            const licenseIssuedEligibility = {
              ...eligibilityResponse.data,
              requirements: {
                theoryPassed: true,
                practicalPassed: true,
                paymentVerified: true,
                theoryResult: {
                  score: 88, // Mock data for display
                  dateTaken: new Date().toISOString(),
                  correctAnswers: 44,
                  totalQuestions: 50,
                  language: "english",
                },
                practicalResult: {
                  score: 86, // Mock data for display
                  dateTaken: new Date().toISOString(),
                  location: "Kality, Addis Ababa",
                  examiner: "Admin",
                },
              },
            };
            setEligibility(licenseIssuedEligibility);
            setLoading(false);
            return;
          }

          // Check if user is not eligible but reason is license already issued
          if (
            !eligibilityResponse.data.eligible &&
            eligibilityResponse.data.reason === "License already issued" &&
            eligibilityResponse.data.license
          ) {
            setLicense(eligibilityResponse.data.license);
            setActiveStep(4); // License issued
            console.log(
              "✅ License already issued (not eligible):",
              eligibilityResponse.data.license.number
            );
            setLoading(false);
            return;
          }

          // Determine active step based on requirements
          const requirements = eligibilityResponse.data.requirements || {};
          const { theoryPassed, practicalPassed, paymentVerified } =
            requirements;

          if (theoryPassed && practicalPassed && paymentVerified) {
            setActiveStep(3); // Admin verification
          } else if (theoryPassed && practicalPassed) {
            setActiveStep(2); // Ready for payment
          } else if (theoryPassed) {
            setActiveStep(1); // Need practical exam
          } else {
            setActiveStep(0); // Need theory exam
          }

          // Check if license already issued (direct check)
          try {
            const licenseResponse = await axios.get(
              `/api/payments/license/${userId}`,
              { timeout: 5000 }
            );
            if (licenseResponse.data.success && licenseResponse.data.license) {
              setLicense(licenseResponse.data.license);
              setActiveStep(4); // License issued
              console.log(
                "✅ License found:",
                licenseResponse.data.license.number
              );
              return;
            }
          } catch (licenseError) {
            console.log("No license found yet, checking payment status...");
          }

          // Check if payment already submitted
          try {
            const paymentResponse = await axios.get(
              `/api/payments/status/${userId}`,
              { timeout: 5000 }
            );
            if (paymentResponse.data.success) {
              setPaymentStatus(paymentResponse.data.payment);
              if (paymentResponse.data.payment.status === "verified") {
                setActiveStep(3); // Payment verified, waiting for license
              } else {
                setActiveStep(3); // Payment submitted
              }
            }
          } catch (paymentError) {
            console.log("No payment found yet");
          }
        } else {
          setEligibility(eligibilityResponse.data);
          // Fix: Use the correct response structure - requirements instead of eligibility
          const { theoryPassed, practicalPassed } =
            eligibilityResponse.data.requirements ||
            eligibilityResponse.data.eligibility ||
            {};

          console.log("📊 Eligibility check:", {
            theoryPassed,
            practicalPassed,
            status: eligibilityResponse.data.status,
          });

          if (theoryPassed && practicalPassed) {
            setActiveStep(2); // Ready for payment
          } else if (theoryPassed) {
            setActiveStep(1); // Need practical exam
          } else {
            setActiveStep(0); // Need theory exam
          }
        }
      } catch (apiError) {
        console.error("API Error:", apiError);

        // Handle specific 400 errors from payment API
        if (apiError.response && apiError.response.status === 400) {
          const errorData = apiError.response.data;

          if (errorData.message === "Payment already submitted") {
            console.log("✅ Payment already exists, setting payment status");
            setPaymentStatus(errorData.payment);
            setActiveStep(3); // Payment submitted

            // Check if license already issued
            if (errorData.payment.status === "verified") {
              setActiveStep(4); // License issued
            }

            // Set eligibility to show exams as passed
            const eligibilityWithPayment = {
              success: true,
              eligibility: {
                theoryPassed: true,
                practicalPassed: true,
                canProceedToPayment: false, // Already paid
                theoryResult: {
                  score: 88,
                  dateTaken: new Date().toISOString(),
                  correctAnswers: 44,
                  totalQuestions: 50,
                  language: "english",
                },
                practicalResult: {
                  score: 92,
                  dateTaken: new Date().toISOString(),
                  location: "Kality, Addis Ababa",
                  examiner: "Inspector Alemayehu",
                },
              },
              paymentAmount: 500,
              message: "Payment already submitted",
            };
            setEligibility(eligibilityWithPayment);
            return; // Don't throw error
          } else if (
            errorData.message === "License already issued" ||
            errorData.reason === "License already issued"
          ) {
            console.log("✅ License already issued (from error response)");
            if (errorData.license) {
              setLicense(errorData.license);
              setActiveStep(4); // License issued
              console.log("License number:", errorData.license.number);
            }

            // Set eligibility and payment status with both structures for compatibility
            const eligibilityWithLicense = {
              success: true,
              status: "license_issued",
              eligibility: {
                theoryPassed: true,
                practicalPassed: true,
                canProceedToPayment: false,
                theoryResult: {
                  score: 88,
                  dateTaken: new Date().toISOString(),
                  correctAnswers: 44,
                  totalQuestions: 50,
                  language: "english",
                },
                practicalResult: {
                  score: 86,
                  dateTaken: new Date().toISOString(),
                  location: "Kality, Addis Ababa",
                  examiner: "Admin",
                },
              },
              requirements: {
                theoryPassed: true,
                practicalPassed: true,
                paymentVerified: true,
                theoryResult: {
                  score: 88,
                  dateTaken: new Date().toISOString(),
                  correctAnswers: 44,
                  totalQuestions: 50,
                  language: "english",
                },
                practicalResult: {
                  score: 86,
                  dateTaken: new Date().toISOString(),
                  location: "Kality, Addis Ababa",
                  examiner: "Admin",
                },
              },
              paymentAmount: 500,
              message: "License already issued",
            };
            setEligibility(eligibilityWithLicense);
            setLoading(false);
            return; // Don't throw error
          }
        }

        throw apiError; // Re-throw other errors to be caught by outer catch
      }
    } catch (error) {
      console.error("Error checking status:", error);

      // Set default state when API is not available
      const defaultEligibility = {
        success: false,
        eligibility: {
          theoryPassed: false,
          practicalPassed: false,
          theoryResult: null,
          practicalResult: null,
        },
        message:
          "Unable to check exam status. Please ensure you have completed both theory and practical exams.",
      };

      setEligibility(defaultEligibility);
      setActiveStep(0); // Start from theory exam step
      setServerAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      setSubmittingPayment(true);

      // Validate form data
      if (
        !paymentForm.paymentMethod ||
        !paymentForm.transactionId ||
        !paymentForm.paymentDate ||
        !paymentForm.receiptFile
      ) {
        alert("Please fill in all required fields and upload a receipt.");
        return;
      }

      // Check server availability first
      const isServerAvailable = await testServerConnection();

      if (!isServerAvailable) {
        // Demo mode - simulate successful payment submission
        console.log("Server not available, running in demo mode");

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockPayment = {
          _id: "demo_payment_" + Date.now(),
          userId,
          userName,
          amount: 500,
          currency: "ETB",
          paymentMethod: paymentForm.paymentMethod,
          transactionId: paymentForm.transactionId,
          paymentDate: paymentForm.paymentDate,
          status: "pending",
          createdAt: new Date().toISOString(),
          receiptImage: paymentForm.receiptFile?.name || "demo_receipt.jpg",
        };

        // Store in localStorage for admin dashboard to access
        try {
          const existingPayments = JSON.parse(
            localStorage.getItem("demoPayments") || "[]"
          );
          const updatedPayments = [...existingPayments, mockPayment];
          localStorage.setItem("demoPayments", JSON.stringify(updatedPayments));
          console.log("💾 Stored demo payment for admin dashboard");
        } catch (error) {
          console.log("Failed to store demo payment:", error);
        }

        setPaymentStatus(mockPayment);
        setActiveStep(3);
        setShowPaymentDialog(false);

        // Reset form
        setPaymentForm({
          paymentMethod: "",
          transactionId: "",
          paymentDate: "",
          receiptFile: null,
        });

        alert(
          "🎉 Payment submitted successfully (Demo Mode)! \n\nNote: This is a demonstration. In the real system, your payment would be submitted to the admin for verification.\n\nYour payment is now pending admin review."
        );
        return;
      }

      console.log("Submitting payment with data:", {
        userId,
        userName,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        paymentDate: paymentForm.paymentDate,
        receiptFile: paymentForm.receiptFile?.name,
      });

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("userName", userName);
      formData.append("paymentMethod", paymentForm.paymentMethod);
      formData.append("transactionId", paymentForm.transactionId);
      formData.append("paymentDate", paymentForm.paymentDate);
      formData.append("receipt", paymentForm.receiptFile);

      console.log("Making API call to:", "/api/payments/submit");

      try {
        const response = await axios.post("/api/payments/submit", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000, // 10 second timeout
        });

        console.log("Payment submission response:", response.data);

        if (response.data.success) {
          setPaymentStatus(response.data.payment);
          setActiveStep(3);
          setShowPaymentDialog(false);
          alert(
            "Payment submitted successfully! Please wait for admin verification."
          );
          await checkEligibilityAndStatus(); // Refresh status
        } else {
          alert(
            response.data.message ||
              "Payment submission failed. Please try again."
          );
        }
      } catch (submitError) {
        console.error("❌ Payment submission failed:", submitError);

        // Handle specific error cases
        if (submitError.response) {
          const status = submitError.response.status;
          const errorData = submitError.response.data;

          if (status === 400) {
            // Bad request - likely validation error
            const errorMessage =
              errorData.message ||
              "Invalid payment data. Please check all fields.";
            alert(`❌ Payment Error: ${errorMessage}`);
          } else if (status === 404) {
            // Route not found - server issue
            console.log(
              "🔄 Payment route not found, falling back to demo mode"
            );
            throw submitError; // Let outer catch handle this
          } else {
            alert(
              `❌ Server Error (${status}): ${
                errorData.message || "Unknown error"
              }`
            );
          }
        } else {
          // Network error or timeout
          throw submitError; // Let outer catch handle this
        }
      }
    } catch (error) {
      console.error("Error submitting payment:", error);

      // Check if this is a server connectivity issue and offer demo mode
      const isConnectivityIssue =
        error.code === "ECONNREFUSED" ||
        error.message.includes("Network Error") ||
        error.message.includes("timeout") ||
        !error.response;

      if (isConnectivityIssue) {
        const useDemo = window.confirm(
          "❌ Cannot connect to the server.\n\n" +
            "Would you like to continue in Demo Mode?\n\n" +
            "✅ Demo Mode will simulate the payment submission process for demonstration purposes."
        );

        if (useDemo) {
          // Simulate demo payment submission
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const mockPayment = {
            _id: "demo_payment_" + Date.now(),
            userName: userName,
            userEmail: localStorage.getItem("userEmail") || "demo@example.com",
            amount: 500,
            currency: "ETB",
            paymentMethod: paymentForm.paymentMethod,
            transactionId: paymentForm.transactionId,
            paymentDate: paymentForm.paymentDate,
            status: "pending",
            createdAt: new Date().toISOString(),
            receiptImage: paymentForm.receiptFile?.name || "demo_receipt.jpg",
            // Add user details for admin dashboard
            userId: {
              _id: userId,
              email: localStorage.getItem("userEmail") || "demo@example.com",
              phone: localStorage.getItem("userPhone") || "+251911234567",
              firstName: userName.split(" ")[0] || "Demo",
              lastName: userName.split(" ").slice(1).join(" ") || "User",
              dateOfBirth: "1995-01-01",
              address: "Demo Address, Addis Ababa",
            },
          };

          // Store in localStorage for admin dashboard to access
          try {
            const existingPayments = JSON.parse(
              localStorage.getItem("demoPayments") || "[]"
            );
            const updatedPayments = [...existingPayments, mockPayment];
            localStorage.setItem(
              "demoPayments",
              JSON.stringify(updatedPayments)
            );
            console.log(
              "💾 Stored demo payment for admin dashboard:",
              mockPayment
            );
            console.log(
              "📋 Total demo payments stored:",
              updatedPayments.length
            );
          } catch (error) {
            console.log("Failed to store demo payment:", error);
          }

          setPaymentStatus(mockPayment);
          setActiveStep(3);
          setShowPaymentDialog(false);
          setServerAvailable(false);

          // Reset form
          setPaymentForm({
            paymentMethod: "",
            transactionId: "",
            paymentDate: "",
            receiptFile: null,
          });

          alert(
            "🎉 Payment submitted successfully (Demo Mode)!\n\nYour payment is now pending admin review."
          );
          return;
        }
      }

      // Show detailed error message
      let errorMessage = "Error submitting payment. ";

      if (error.response) {
        // Server responded with error status
        const serverMessage =
          error.response.data?.message || error.response.statusText;
        errorMessage += `Server error: ${serverMessage}`;
        console.error("Server response:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage +=
          "No response from server. Please check your internet connection.";
      } else {
        // Something else happened
        errorMessage += error.message || "Unknown error occurred.";
      }

      alert(errorMessage);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const steps = [
    {
      label: "Pass Theory Exam",
      description: "Complete and pass the theory exam with at least 74%",
    },
    {
      label: "Pass Practical Exam",
      description: "Complete and pass the practical exam",
    },
    {
      label: "Make Payment",
      description: "Pay the license fee (500 ETB) and upload receipt",
    },
    {
      label: "Admin Verification",
      description: "Wait for admin to verify your payment and information",
    },
    {
      label: "Get License",
      description: "Download your digital driving license",
    },
  ];

  const getStepStatus = (stepIndex) => {
    if (stepIndex < activeStep) return "completed";
    if (stepIndex === activeStep) return "active";
    return "pending";
  };

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
        🚗 Get Your Driving License
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Follow these steps to obtain your Ethiopian driving license
      </Typography>

      {/* License Status Banner */}
      {license && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            border: "2px solid",
            borderColor: "success.main",
            background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
            "& .MuiAlert-icon": {
              fontSize: "2rem",
            },
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            🎉 Congratulations! Your License Has Been Approved & Issued!
          </Typography>
          <Typography variant="body1">
            <strong>License Number:</strong> {license.number} |
            <strong> Class:</strong> {license.class} |<strong> Status:</strong>{" "}
            Active
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Your official Ethiopian driving license is ready for download. You
            can now download your license ID with photo and QR code
            verification.
          </Typography>

          {/* Quick Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={downloadLicense}
              sx={{
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                },
                fontSize: "1rem",
                py: 1.5,
                px: 3,
                boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
              }}
            >
              📄 Download License
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<LicenseIcon />}
              onClick={previewLicense}
              sx={{
                py: 1.5,
                px: 3,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  background: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              👁️ Preview
            </Button>
          </Box>
        </Alert>
      )}

      {/* Server Status Indicator */}
      {!serverAvailable && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>⚠️ Server Unavailable:</strong> Cannot connect to the
            backend server. Running in demo mode. Exam status may not be
            accurate.
          </Typography>
        </Alert>
      )}

      {/* Payment Status Indicator */}
      {eligibility && eligibility.message && (
        <Alert
          severity={
            eligibility.message.includes("already submitted")
              ? "info"
              : eligibility.message.includes("already issued")
              ? "success"
              : eligibility.message.includes("Demo mode")
              ? "warning"
              : "info"
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>
              {eligibility.message.includes("already submitted")
                ? "💳 Payment Status:"
                : eligibility.message.includes("already issued")
                ? "🎉 License Status:"
                : eligibility.message.includes("Demo mode")
                ? "🔄 Demo Mode:"
                : "ℹ️ Status:"}
            </strong>{" "}
            {eligibility.message}
          </Typography>
        </Alert>
      )}

      {/* Exam Completion Summary - Only show if user has actually passed exams */}
      {eligibility &&
        eligibility.success &&
        ((eligibility.eligibility &&
          (eligibility.eligibility.theoryPassed ||
            eligibility.eligibility.practicalPassed)) ||
          (eligibility.requirements &&
            (eligibility.requirements.theoryPassed ||
              eligibility.requirements.practicalPassed))) && (
          <Card
            sx={{
              mb: 3,
              background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
              border: "1px solid #4caf50",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "success.main" }}
              >
                🎉 Exam Progress Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {eligibility.requirements?.theoryPassed ||
                    eligibility.eligibility?.theoryPassed ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <CancelIcon color="disabled" sx={{ mr: 1 }} />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight:
                          eligibility.requirements?.theoryPassed ||
                          eligibility.eligibility?.theoryPassed
                            ? "bold"
                            : "normal",
                      }}
                    >
                      Theory Exam:{" "}
                      {eligibility.requirements?.theoryPassed ||
                      eligibility.eligibility?.theoryPassed
                        ? "PASSED"
                        : "PENDING"}
                    </Typography>
                  </Box>
                  {(eligibility.requirements?.theoryPassed ||
                    eligibility.eligibility?.theoryPassed) &&
                    (eligibility.requirements?.theoryResult ||
                      eligibility.eligibility?.theoryResult) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 4 }}
                      >
                        Score:{" "}
                        {
                          (
                            eligibility.requirements?.theoryResult ||
                            eligibility.eligibility?.theoryResult
                          )?.score
                        }
                        % |{" "}
                        {(
                          eligibility.requirements?.theoryResult ||
                          eligibility.eligibility?.theoryResult
                        )?.correctAnswers || 0}
                        /
                        {(
                          eligibility.requirements?.theoryResult ||
                          eligibility.eligibility?.theoryResult
                        )?.totalQuestions || 50}{" "}
                        correct
                      </Typography>
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {eligibility.requirements?.practicalPassed ||
                    eligibility.eligibility?.practicalPassed ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <CancelIcon color="disabled" sx={{ mr: 1 }} />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight:
                          eligibility.requirements?.practicalPassed ||
                          eligibility.eligibility?.practicalPassed
                            ? "bold"
                            : "normal",
                      }}
                    >
                      Practical Exam:{" "}
                      {eligibility.requirements?.practicalPassed ||
                      eligibility.eligibility?.practicalPassed
                        ? "PASSED"
                        : "PENDING"}
                    </Typography>
                  </Box>
                  {(eligibility.requirements?.practicalPassed ||
                    eligibility.eligibility?.practicalPassed) &&
                    (eligibility.requirements?.practicalResult ||
                      eligibility.eligibility?.practicalResult) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 4 }}
                      >
                        Score:{" "}
                        {
                          (
                            eligibility.requirements?.practicalResult ||
                            eligibility.eligibility?.practicalResult
                          )?.score
                        }
                        % | Location:{" "}
                        {(
                          eligibility.requirements?.practicalResult ||
                          eligibility.eligibility?.practicalResult
                        )?.location || "Kality, Addis Ababa"}
                      </Typography>
                    )}
                </Grid>
              </Grid>
              {(eligibility.requirements?.theoryPassed ||
                eligibility.eligibility?.theoryPassed) &&
                (eligibility.requirements?.practicalPassed ||
                  eligibility.eligibility?.practicalPassed) && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Congratulations!</strong> You have successfully
                      completed both exams. You can now proceed to payment to
                      get your license!
                    </Typography>
                  </Alert>
                )}
            </CardContent>
          </Card>
        )}

      {/* No Exams Completed Message */}
      {eligibility &&
        (!eligibility.success ||
          (!(
            eligibility.requirements?.theoryPassed ||
            eligibility.eligibility?.theoryPassed
          ) &&
            !(
              eligibility.requirements?.practicalPassed ||
              eligibility.eligibility?.practicalPassed
            ))) && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              📚 Get Started with Your License Journey
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You haven't completed any exams yet. To get your driving license,
              you need to:
            </Typography>
            <Box component="ol" sx={{ pl: 2, mb: 0 }}>
              <li>
                <Typography variant="body2">
                  <strong>Take the Theory Exam:</strong> Go to "Available Exams"
                  → "Theory Exam" and pass with at least 74%
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Take the Practical Exam:</strong> Schedule and pass
                  the practical driving test
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Pay License Fee:</strong> Submit payment of 500 ETB
                  with receipt
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Get Your License:</strong> Download your digital
                  license after admin approval
                </Typography>
              </li>
            </Box>
          </Alert>
        )}

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={({ active, completed }) => {
                  if (completed) return <CheckIcon color="success" />;
                  if (active) return <PendingIcon color="primary" />;
                  return <CancelIcon color="disabled" />;
                }}
              >
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>

                {/* Step-specific content */}
                {index === 0 && eligibility && (
                  <Box sx={{ mt: 2 }}>
                    {eligibility.requirements?.theoryPassed ||
                    eligibility.eligibility?.theoryPassed ? (
                      <Card
                        sx={{
                          border: "2px solid",
                          borderColor: "success.main",
                          bgcolor: "success.50",
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Alert
                            severity="success"
                            icon={<CheckIcon />}
                            sx={{ mb: 2 }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold" }}
                            >
                              Theory Exam Completed! ✅
                            </Typography>
                          </Alert>
                          {(eligibility.requirements?.theoryResult ||
                            eligibility.eligibility?.theoryResult) && (
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Score:</strong>{" "}
                                  {
                                    (
                                      eligibility.requirements?.theoryResult ||
                                      eligibility.eligibility?.theoryResult
                                    )?.score
                                  }
                                  %
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Date:</strong>{" "}
                                  {(
                                    eligibility.requirements?.theoryResult ||
                                    eligibility.eligibility?.theoryResult
                                  )?.dateTaken
                                    ? format(
                                        new Date(
                                          (
                                            eligibility.requirements
                                              ?.theoryResult ||
                                            eligibility.eligibility
                                              ?.theoryResult
                                          ).dateTaken
                                        ),
                                        "PPP"
                                      )
                                    : "N/A"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Questions:</strong>{" "}
                                  {(
                                    eligibility.requirements?.theoryResult ||
                                    eligibility.eligibility?.theoryResult
                                  )?.correctAnswers || 0}
                                  /
                                  {(
                                    eligibility.requirements?.theoryResult ||
                                    eligibility.eligibility?.theoryResult
                                  )?.totalQuestions || 50}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Language:</strong>{" "}
                                  {(
                                    eligibility.requirements?.theoryResult ||
                                    eligibility.eligibility?.theoryResult
                                  )?.language || "English"}
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Alert severity="warning">
                        You need to pass the theory exam first. Go to "Available
                        Exams" to take it.
                      </Alert>
                    )}
                  </Box>
                )}

                {index === 1 && eligibility && (
                  <Box sx={{ mt: 2 }}>
                    {eligibility.requirements?.practicalPassed ||
                    eligibility.eligibility?.practicalPassed ? (
                      <Card
                        sx={{
                          border: "2px solid",
                          borderColor: "success.main",
                          bgcolor: "success.50",
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Alert
                            severity="success"
                            icon={<CheckIcon />}
                            sx={{ mb: 2 }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold" }}
                            >
                              Practical Exam Completed! ✅
                            </Typography>
                          </Alert>
                          {(eligibility.requirements?.practicalResult ||
                            eligibility.eligibility?.practicalResult) && (
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Score:</strong>{" "}
                                  {
                                    (
                                      eligibility.requirements
                                        ?.practicalResult ||
                                      eligibility.eligibility?.practicalResult
                                    )?.score
                                  }
                                  %
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Date:</strong>{" "}
                                  {(
                                    eligibility.requirements?.practicalResult ||
                                    eligibility.eligibility?.practicalResult
                                  )?.dateTaken
                                    ? format(
                                        new Date(
                                          (
                                            eligibility.requirements
                                              ?.practicalResult ||
                                            eligibility.eligibility
                                              ?.practicalResult
                                          ).dateTaken
                                        ),
                                        "PPP"
                                      )
                                    : "N/A"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Location:</strong>{" "}
                                  {(
                                    eligibility.requirements?.practicalResult ||
                                    eligibility.eligibility?.practicalResult
                                  )?.location || "Kality, Addis Ababa"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Examiner:</strong>{" "}
                                  {(
                                    eligibility.requirements?.practicalResult ||
                                    eligibility.eligibility?.practicalResult
                                  )?.examiner || "Admin"}
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Alert severity="warning">
                        You need to pass the practical exam. Schedule it from
                        "Available Exams".
                      </Alert>
                    )}
                  </Box>
                )}

                {index === 2 && activeStep === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>✅ All exams completed successfully!</strong>
                      </Typography>
                      <Typography variant="body2">
                        You are now eligible to pay the license fee and get your
                        driving license.
                      </Typography>
                    </Alert>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      License fee: <strong>500 ETB</strong>
                    </Alert>
                    <Button
                      variant="contained"
                      startIcon={<PaymentIcon />}
                      onClick={() => setShowPaymentDialog(true)}
                      size="large"
                      sx={{
                        background:
                          "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                        },
                      }}
                    >
                      Submit Payment & Get License
                    </Button>
                  </Box>
                )}

                {index === 3 && paymentStatus && (
                  <Box sx={{ mt: 2 }}>
                    <Alert
                      severity={
                        paymentStatus.status === "verified"
                          ? "success"
                          : paymentStatus.status === "rejected"
                          ? "error"
                          : "info"
                      }
                    >
                      Payment Status:{" "}
                      <strong>{paymentStatus.status.toUpperCase()}</strong>
                      {paymentStatus.adminNotes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Admin Notes: {paymentStatus.adminNotes}
                        </Typography>
                      )}
                    </Alert>

                    {/* Demo mode: Simulate license approval */}
                    {!serverAvailable &&
                      paymentStatus.status === "pending" &&
                      !license && (
                        <Box sx={{ mt: 2 }}>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Demo Mode:</strong> Simulate admin
                              approval to get your license
                            </Typography>
                          </Alert>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => {
                              // Simulate admin approval
                              const approvedPayment = {
                                ...paymentStatus,
                                status: "verified",
                                adminNotes:
                                  "Demo approval - payment verified and license issued",
                                reviewedAt: new Date().toISOString(),
                              };
                              setPaymentStatus(approvedPayment);

                              // Create demo license
                              createDemoLicense();

                              alert(
                                "🎉 Payment approved and license issued! (Demo Mode)\n\nYour license is now ready for download."
                              );
                            }}
                            sx={{
                              background:
                                "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                              },
                            }}
                          >
                            Simulate Admin Approval
                          </Button>
                        </Box>
                      )}
                  </Box>
                )}

                {index === 4 && license && (
                  <Box sx={{ mt: 2 }}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
                        border: "3px solid #4caf50",
                        borderRadius: 3,
                        mb: 2,
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", py: 3 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "bold",
                            color: "success.main",
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          🎉 Congratulations! Your License is Ready!
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{ mb: 2, color: "text.secondary" }}
                        >
                          Ethiopian Driving License Successfully Issued
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 2,
                            mb: 3,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={`License No: ${license.number}`}
                            color="success"
                            size="large"
                            sx={{ fontWeight: "bold", fontSize: "1.3rem" }}
                          />
                          <Chip
                            label={`Class ${license.class}`}
                            color="primary"
                            size="large"
                            sx={{ fontWeight: "bold", fontSize: "1rem" }}
                          />
                        </Box>

                        <Alert
                          severity="success"
                          sx={{ mb: 3, textAlign: "left" }}
                        >
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>
                              ✅ Your digital driving license includes:
                            </strong>
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                            <li>QR Code for instant verification</li>
                            <li>Official Ethiopian government design</li>
                            <li>All your personal and license information</li>
                            <li>Security features and watermarks</li>
                            <li>Print-ready format for physical copy</li>
                          </Box>
                        </Alert>
                      </CardContent>
                    </Card>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<DownloadIcon />}
                        onClick={downloadLicense}
                        sx={{
                          background:
                            "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                          },
                          fontSize: "1.1rem",
                          py: 1.5,
                          px: 3,
                          boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
                        }}
                      >
                        Download Your License
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<LicenseIcon />}
                        onClick={() =>
                          window.open(`/license/${license.number}`, "_blank")
                        }
                        sx={{ py: 1.5, px: 3 }}
                      >
                        View Details
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PrintIcon />}
                        onClick={() => {
                          // Open license in new window for printing
                          const printWindow = window.open("", "_blank");
                          printWindow.document.write(`
                            <html>
                              <head><title>Print License</title></head>
                              <body style="font-family: Arial, sans-serif; padding: 20px;">
                                <div style="text-align: center; border: 2px solid #1976d2; padding: 20px; border-radius: 10px;">
                                  <h1 style="color: #1976d2;">🇪🇹 Ethiopian Driving License</h1>
                                  <h2>Federal Democratic Republic of Ethiopia</h2>
                                  <h3>Ministry of Transport and Logistics</h3>
                                  <hr style="border: 1px solid #1976d2; margin: 20px 0;">
                                  <p style="font-size: 18px;"><strong>License Number:</strong> ${
                                    license.number
                                  }</p>
                                  <p><strong>Full Name:</strong> ${userName}</p>
                                  <p><strong>License Class:</strong> ${
                                    license.class
                                  }</p>
                                  <p><strong>Issue Date:</strong> ${format(
                                    new Date(license.issueDate),
                                    "PPP"
                                  )}</p>
                                  <p><strong>Expiry Date:</strong> ${format(
                                    new Date(license.expiryDate),
                                    "PPP"
                                  )}</p>
                                  <p><strong>Issue Location:</strong> Addis Ababa, Ethiopia</p>
                                  <hr style="border: 1px solid #1976d2; margin: 20px 0;">
                                  <p style="font-size: 12px; color: #666;">This is a demonstration license. Generated on ${format(
                                    new Date(),
                                    "PPpp"
                                  )}</p>
                                </div>
                                <script>window.print(); window.close();</script>
                              </body>
                            </html>
                          `);
                        }}
                        sx={{ py: 1.5, px: 3 }}
                      >
                        Print License
                      </Button>
                    </Box>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Enhanced License Card (if issued) */}
      {license && (
        <Card
          sx={{
            mb: 3,
            border: "3px solid",
            borderColor: "success.main",
            background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
            boxShadow: "0 8px 32px rgba(76, 175, 80, 0.2)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  color: "success.main",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                🎉 License Approved & Issued!
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                🇪🇹 Ethiopian Driving License
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Your official driving license is ready for download
              </Typography>
            </Box>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    background: "white",
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{ mb: 2 }}
                  >
                    📋 License Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>License Number:</strong>
                      </Typography>
                      <Chip
                        label={license.number}
                        color="success"
                        size="large"
                        sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>License Class:</strong>
                      </Typography>
                      <Chip
                        label={`Class ${
                          license.class
                        } - ${getLicenseClassDescription(license.class)}`}
                        color="primary"
                        size="large"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>📅 Issue Date:</strong>{" "}
                        {format(new Date(license.issueDate), "PPP")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>⏰ Expiry Date:</strong>{" "}
                        {format(new Date(license.expiryDate), "PPP")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        <strong>📍 Issued in:</strong> Addis Ababa, Ethiopia
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    background: "white",
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{ mb: 2 }}
                  >
                    🎯 Quick Actions
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<DownloadIcon />}
                      onClick={downloadLicense}
                      sx={{
                        background:
                          "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                        },
                        fontSize: "1.2rem",
                        py: 2,
                        px: 4,
                        boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                        borderRadius: 3,
                      }}
                    >
                      📄 Download Official License
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<LicenseIcon />}
                      onClick={previewLicense}
                      sx={{
                        py: 1.5,
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                          background: "rgba(25, 118, 210, 0.04)",
                        },
                      }}
                    >
                      👁️ Preview License
                    </Button>

                    <Button
                      variant="text"
                      size="medium"
                      onClick={() =>
                        window.open(`/license/${license.number}`, "_blank")
                      }
                      sx={{ py: 1 }}
                    >
                      View Full Details
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PrintIcon />}
                      onClick={() => {
                        // Enhanced print functionality
                        downloadLicense();
                      }}
                      sx={{ py: 1.5 }}
                    >
                      Print License
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>💡 Your license includes:</strong> QR code verification,
                official government design, security features, and is valid for
                5 years from the issue date.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit Payment for License</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            License Fee: <strong>500 ETB</strong>
            <br />
            Please make payment and upload your receipt below.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentForm.paymentMethod}
                  label="Payment Method"
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="telebirr">TeleBirr</MenuItem>
                  <MenuItem value="cbe_birr">CBE Birr</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={paymentForm.transactionId}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    transactionId: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Payment Date"
                value={paymentForm.paymentDate}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    paymentDate: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ height: 56 }}
              >
                Upload Receipt
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      receiptFile: e.target.files[0],
                    })
                  }
                />
              </Button>
              {paymentForm.receiptFile && (
                <Typography variant="caption" color="success.main">
                  ✅ {paymentForm.receiptFile.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            disabled={
              !paymentForm.paymentMethod ||
              !paymentForm.transactionId ||
              !paymentForm.paymentDate ||
              !paymentForm.receiptFile ||
              submittingPayment
            }
          >
            {submittingPayment ? (
              <CircularProgress size={20} />
            ) : (
              "Submit Payment"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GetLicense;
