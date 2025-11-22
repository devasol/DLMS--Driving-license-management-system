import React, { useState, useEffect } from "react";
import styles from "./ForgotPassword.module.css";
import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaSpinner,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AlertBox from "../AlertBox/AlertBox";
import SuccessAlert from "../SuccessAlert/SuccessAlert";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Prevent body scroll when component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleCloseAlert = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage("");
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setAlertMessage("Please enter your email address");
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/forgot-password", {
        email: email.toLowerCase(),
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setShowSuccess(true);
        setStep(2); // Move to OTP verification step
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      let errorMessage = "Failed to send reset code. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.type) {
        switch (error.response.data.type) {
          case "user_not_found":
            errorMessage =
              "No account found with this email address. Please check your email or sign up first.";
            break;
          case "email_not_verified":
            errorMessage =
              "Please verify your email first before resetting password. If you haven't signed up yet, please create an account first.";
            break;
          case "registration_incomplete":
            errorMessage =
              "Account setup incomplete. Please complete your registration first.";
            break;
          case "profile_incomplete":
            errorMessage =
              "Account profile incomplete. Please complete your registration first.";
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }

      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      setAlertMessage("Please enter the verification code");
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/verify-reset-otp", {
        email: email.toLowerCase(),
        otp: otp,
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setShowSuccess(true);
        setStep(3); // Move to password reset step
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Invalid verification code. Please try again.";
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setAlertMessage("Please fill in all password fields");
      setShowAlert(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertMessage("Passwords do not match");
      setShowAlert(true);
      return;
    }

    if (newPassword.length < 6) {
      setAlertMessage("Password must be at least 6 characters long");
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/reset-password", {
        email: email.toLowerCase(),
        otp: otp,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setShowSuccess(true);

        // Redirect to signin after 2 seconds
        setTimeout(() => {
          navigate("/signin", {
            state: {
              message:
                "Password reset successfully! Please login with your new password.",
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className={styles.form}>
            <div className={styles.stepHeader}>
              <FaEnvelope className={styles.stepIcon} />
              <h2>Reset Your Password</h2>
              <p>
                Enter your email address and we'll send you a verification code
              </p>
              <div className={styles.infoNote}>
                <FaShieldAlt className={styles.infoIcon} />
                <small>
                  Note: You can only reset your password if you have already
                  signed up and verified your email address.
                </small>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Sending Code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <div className={styles.stepHeader}>
              <FaShieldAlt className={styles.stepIcon} />
              <h2>Enter Verification Code</h2>
              <p>We sent a 6-digit code to {email}</p>
            </div>

            <div className={styles.inputGroup}>
              <FaShieldAlt className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.input}
                maxLength="6"
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.backButton}
            >
              <FaArrowLeft /> Back to Email
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className={styles.stepHeader}>
              <FaLock className={styles.stepIcon} />
              <h2>Create New Password</h2>
              <p>Enter your new password below</p>
            </div>

            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className={styles.backButton}
            >
              <FaArrowLeft /> Back to Verification
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <Link to="/" className={styles.homeLink}>
            <FaArrowLeft /> Back to Home
          </Link>

          <div className={styles.progressBar}>
            <div
              className={`${styles.progressStep} ${
                step >= 1 ? styles.active : ""
              }`}
            >
              1
            </div>
            <div
              className={`${styles.progressLine} ${
                step >= 2 ? styles.active : ""
              }`}
            ></div>
            <div
              className={`${styles.progressStep} ${
                step >= 2 ? styles.active : ""
              }`}
            >
              2
            </div>
            <div
              className={`${styles.progressLine} ${
                step >= 3 ? styles.active : ""
              }`}
            ></div>
            <div
              className={`${styles.progressStep} ${
                step >= 3 ? styles.active : ""
              }`}
            >
              3
            </div>
          </div>
        </div>

        {renderStepContent()}

        <div className={styles.footer}>
          <p>
            Remember your password?{" "}
            <Link to="/signin" className={styles.link}>
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {showAlert && (
        <AlertBox message={alertMessage} onClose={handleCloseAlert} />
      )}

      {showSuccess && (
        <SuccessAlert message={successMessage} onClose={handleCloseSuccess} />
      )}
    </div>
  );
};

export default ForgotPassword;
