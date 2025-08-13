import React, { useState } from "react";
import styles from "./Signup.module.css";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaVenusMars,
  FaIdCard,
  FaHome,
  FaArrowLeft,
  FaGlobe,
  FaTint,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AlertBox from "../AlertBox/AlertBox";
import SuccessAlert from "../SuccessAlert/SuccessAlert";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [nic, setNic] = useState("");
  const [nationality, setNationality] = useState("Ethiopian");
  const [bloodType, setBloodType] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleCloseAlert = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const validateForm = () => {
    if (
      !fullName ||
      !email ||
      !userName ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !gender ||
      !nic
    ) {
      setAlertMessage("All fields are required!");
      setAlertType("error");
      return false;
    }

    if (password.length < 6) {
      setAlertMessage("Password must be at least 6 characters long!");
      setAlertType("error");
      return false;
    }

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match!");
      setAlertType("error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage("Please enter a valid email address!");
      setAlertType("error");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setAlertMessage("Please enter a valid 10-digit phone number!");
      setAlertType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowAlert(false);
    setShowSuccess(false);
    setIsLoading(true);

    if (!validateForm()) {
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    // Prepare data for the working /api/auth/register endpoint
    const userData = {
      fullName: fullName,
      email: email.toLowerCase(),
      password: password,
      // Additional fields for extended registration
      userName: userName,
      phoneNumber: phoneNumber,
      gender: gender.toLowerCase(),
      nic,
    };

    // Also prepare data for the legacy format (if needed)
    const legacyUserData = {
      full_name: fullName,
      user_email: email.toLowerCase(),
      user_name: userName,
      user_password: password,
      contact_no: phoneNumber,
      gender: gender.toLowerCase(),
      nic,
    };

    console.log(
      "Attempting to sign up with data:",
      JSON.stringify(userData, null, 2)
    );

    try {
      // Check if servers are running
      let mainServerRunning = false;
      let simpleServerRunning = false;

      try {
        // Check main server
        const mainHealthCheck = await axios.get(
          "http://localhost:5004/api/health",
          { timeout: 3000 }
        );
        mainServerRunning = mainHealthCheck.data.status === "ok";
        console.log(
          "Main server status:",
          mainServerRunning ? "running" : "not running"
        );
      } catch (err) {
        console.log("Main server health check failed:", err.message);
      }

      try {
        // Check simple server (disabled for now)
        simpleServerRunning = false;
        console.log("Simple server disabled");
      } catch (err) {
        console.log("Simple server health check failed:", err.message);
      }

      // Use only the working endpoint with email verification
      const endpoints = [
        {
          url: "http://localhost:5004/api/auth/users/signup",
          server: "main-auth",
          available: mainServerRunning,
          data: {
            full_name: fullName,
            user_email: email.toLowerCase(),
            user_password: password,
            user_name: userName,
            contact_no: phoneNumber,
            gender: gender?.toLowerCase(),
            nic: nic,
            nationality: nationality,
            bloodType: bloodType,
          },
        },
      ];

      let response;
      let lastError = null;

      // Try each endpoint in order
      for (const endpoint of endpoints) {
        if (!endpoint.available) {
          console.log(`Skipping ${endpoint.server} server (not available)`);
          continue;
        }

        try {
          console.log(`Trying ${endpoint.server} endpoint: ${endpoint.url}`);
          console.log(`Sending data:`, JSON.stringify(endpoint.data, null, 2));
          response = await axios.post(endpoint.url, endpoint.data, {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000, // 10 second timeout
          });

          console.log(
            `Signup successful with ${endpoint.server} endpoint:`,
            response.data
          );
          break; // Exit the loop if successful
        } catch (error) {
          console.log(`${endpoint.server} endpoint failed:`, error.message);
          lastError = error;
        }
      }

      // If we've tried all endpoints and still don't have a response
      if (!response) {
        if (!mainServerRunning && !simpleServerRunning) {
          throw new Error(
            "Both servers are down. Please start the backend servers."
          );
        } else {
          throw lastError || new Error("All signup attempts failed");
        }
      }

      console.log("Signup successful:", response.data);

      // 🔍 DEBUG: Check what the backend actually returned
      console.log("🔍 DEBUGGING SIGNUP RESPONSE:");
      console.log("- requiresOTP:", response.data.requiresOTP);
      console.log(
        "- requiresEmailVerification:",
        response.data.requiresEmailVerification
      );
      console.log("- success:", response.data.success);
      console.log("- email:", response.data.email);
      console.log("- Full response:", JSON.stringify(response.data, null, 2));

      // Handle successful signup
      setShowSuccess(true);

      // Store user data
      if (response.data.user) {
        localStorage.setItem("userName", response.data.user.full_name);
        localStorage.setItem("userEmail", response.data.user.user_email);
        localStorage.setItem("userId", response.data.user._id);
        localStorage.setItem("userType", "user");
      }

      // Check if OTP verification is required
      console.log(
        "🔍 Checking if requiresOTP is true:",
        response.data.requiresOTP
      );
      if (response.data.requiresOTP) {
        // Redirect to OTP verification page with user email
        setTimeout(() => {
          navigate("/verify-otp", {
            state: {
              email: response.data.email || email.toLowerCase(),
              message:
                "Registration initiated! Please check your email for the verification code.",
              fromSignup: true,
            },
          });
        }, 2000);
      } else {
        // 🔍 DEBUG: This is the problem - requiresOTP is false!
        console.log(
          "❌ PROBLEM: requiresOTP is FALSE - redirecting to signin instead of OTP page"
        );
        console.log("Backend response:", response.data);

        // Redirect to login normally (for backward compatibility)
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error details:", {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : "No response",
        request: error.request
          ? "Request was made but no response"
          : "Request setup error",
      });

      let errorMessage = "Sign up failed. Please try again.";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check if the backend servers are running.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setAlertMessage(errorMessage);
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Alerts rendered outside of any container for proper positioning */}
      {showAlert && (
        <AlertBox
          message={alertMessage}
          type={alertType}
          onClose={handleCloseAlert}
          duration={5000}
        />
      )}
      {showSuccess && (
        <SuccessAlert
          message="Account created successfully! Please check your email to verify your account before logging in."
          onClose={handleCloseSuccess}
          duration={2000}
        />
      )}

      <div className={styles.container}>
        {/* Go Back Home Button */}
        <button
          className={styles.goBackHomeButton}
          onClick={() => navigate("/")}
          title="Go Back Home"
        >
          <FaArrowLeft className={styles.backIcon} />
          <FaHome className={styles.homeIcon} />
          <span className={styles.backText}>Home</span>
        </button>

        <div className={styles.loginContainer}>
          {/* Left side with welcome message */}
          <div className={styles.welcomeSide}>
            <div className={`${styles.circle} ${styles.circle1}`}></div>
            <div className={`${styles.circle} ${styles.circle2}`}></div>

            <h1 className={styles.welcomeTitle}>WELCOME</h1>
            <h2 className={styles.welcomeSubtitle}>
              DRIVER LICENSE MANAGEMENT
            </h2>
            <p className={styles.welcomeText}>
              Create your account to access our platform and manage your
              driver's license information efficiently.
            </p>
          </div>

          {/* Right side with form */}
          <div className={styles.formSide}>
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formSubtitle}>
              Fill in your details to register
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Row 1: Full Name and Email */}
              <div className={styles.inputRow}>
                <div className={styles.inputForm}>
                  <FaUser size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.inputForm}>
                  <FaEnvelope size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Row 2: Username and Phone */}
              <div className={styles.inputRow}>
                <div className={styles.inputForm}>
                  <FaUser size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="Username"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.inputForm}>
                  <FaPhone size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="Phone Number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Row 3: Password and Confirm Password */}
              <div className={styles.inputRow}>
                <div className={styles.inputForm}>
                  <FaLock size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.inputForm}>
                  <FaLock size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Row 4: Gender and NIC */}
              <div className={styles.inputRow}>
                <div className={styles.inputForm}>
                  <FaVenusMars size={16} color="#666" />
                  <select
                    className={styles.input}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.inputForm}>
                  <FaIdCard size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="NIC Number"
                    type="text"
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Row 5: Nationality and Blood Type */}
              <div className={styles.inputRow}>
                <div className={styles.inputForm}>
                  <FaGlobe size={16} color="#666" />
                  <input
                    className={styles.input}
                    placeholder="Nationality"
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.inputForm}>
                  <FaTint size={16} color="#666" />
                  <select
                    className={styles.input}
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <button
                className={styles.buttonSubmit}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>

              <p className={styles.p}>
                Already have an account?{" "}
                <Link to="/signin">
                  <span className={styles.span}>Sign In</span>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
