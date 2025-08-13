import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styles from "./EmailVerification.module.css";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope } from "react-icons/fa";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus("error");
      setMessage("Invalid verification link. No token provided.");
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await axios.get(
        `http://localhost:5004/api/auth/verify-email?token=${verificationToken}`
      );

      if (response.status === 200) {
        setVerificationStatus("success");
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/signin", { 
            state: { 
              message: "Email verified successfully! You can now log in.",
              type: "success"
            }
          });
        }, 3000);
      }
    } catch (error) {
      setVerificationStatus("error");
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Failed to verify email. Please try again or contact support.");
      }
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendMessage("Please enter your email address.");
      return;
    }

    setIsResending(true);
    setResendMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5004/api/auth/resend-verification",
        { email: resendEmail }
      );

      if (response.status === 200) {
        setResendMessage("Verification email sent successfully! Please check your email.");
        setResendEmail("");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setResendMessage(error.response.data.message);
      } else {
        setResendMessage("Failed to send verification email. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Email Verification</h1>
        </div>

        <div className={styles.content}>
          {verificationStatus === "verifying" && (
            <div className={styles.verifying}>
              <FaSpinner className={styles.spinner} />
              <h2>Verifying your email...</h2>
              <p>Please wait while we verify your email address.</p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className={styles.success}>
              <FaCheckCircle className={styles.successIcon} />
              <h2>Email Verified Successfully!</h2>
              <p>{message}</p>
              <p className={styles.redirectMessage}>
                Redirecting to login page in 3 seconds...
              </p>
              <Link to="/signin" className={styles.loginButton}>
                Go to Login Now
              </Link>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className={styles.error}>
              <FaTimesCircle className={styles.errorIcon} />
              <h2>Verification Failed</h2>
              <p>{message}</p>

              <div className={styles.resendSection}>
                <h3>Need a new verification email?</h3>
                <form onSubmit={handleResendVerification} className={styles.resendForm}>
                  <div className={styles.inputGroup}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isResending}
                    className={styles.resendButton}
                  >
                    {isResending ? (
                      <>
                        <FaSpinner className={styles.spinner} />
                        Sending...
                      </>
                    ) : (
                      "Resend Verification Email"
                    )}
                  </button>
                </form>
                {resendMessage && (
                  <p className={`${styles.resendMessage} ${
                    resendMessage.includes("successfully") ? styles.success : styles.error
                  }`}>
                    {resendMessage}
                  </p>
                )}
              </div>

              <div className={styles.helpLinks}>
                <Link to="/signin" className={styles.link}>
                  Back to Login
                </Link>
                <Link to="/signup" className={styles.link}>
                  Create New Account
                </Link>
                <Link to="/contact" className={styles.link}>
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
