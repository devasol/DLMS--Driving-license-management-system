import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import styles from "./Signin.module.css";
import AlertBox from "../AlertBox/AlertBox";
import SuccessAlert from "../SuccessAlert/SuccessAlert";
import { authAPI } from "../../config/api";

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleCloseAlert = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine if this is an admin login based on email pattern
      const email = (formData.email || "").trim();
      const isAdminLogin =
        email.toLowerCase().includes("admin") ||
        email.toLowerCase().includes("administrator");

      const loginData = {
        email,
        password: formData.password,
      };

      // Use adminLogin helper for admin-like accounts to prefer admin-specific route
      const response = isAdminLogin
        ? await authAPI.adminLogin(loginData)
        : await authAPI.login(loginData);
      const { data } = response;

      // Success
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.user.type);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem(
        "userName",
        data.user.full_name || data.user.admin_name
      );
      localStorage.setItem(
        "userEmail",
        data.user.user_email || data.user.admin_email
      );
      localStorage.setItem("user", JSON.stringify(data.user));

      setShowSuccess(true);

      setTimeout(() => {
        if (data.user.type === "admin") {
          navigate("/admin/dashboard");
        } else if (data.user.type === "examiner") {
          navigate("/examiner/dashboard");
        } else if (data.user.type === "traffic_police") {
          navigate("/traffic-police/dashboard");
        } else {
          const from = location.state?.from?.pathname || "/user-dashboard";
          navigate(from, { replace: true });
        }
      }, 1000);
    } catch (error) {
      // Log full error for debugging
      console.error("Login error:", error?.response || error);

      const serverMessage = error?.response?.data?.message;
      const status = error?.response?.status;

      // Show more helpful messages based on status
      if (status === 401) {
        setAlertMessage(serverMessage || "Invalid email or password");
      } else if (status >= 400 && status < 500) {
        setAlertMessage(serverMessage || "Invalid request. Please check your input.");
      } else {
        setAlertMessage(serverMessage || "Network/server error. Please try again later.");
      }

      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {showAlert && (
        <AlertBox
          message={alertMessage}
          onClose={handleCloseAlert}
          duration={5000}
        />
      )}
      {showSuccess && (
        <SuccessAlert
          message="Login successful!"
          onClose={handleCloseSuccess}
          duration={1000}
        />
      )}

      <div className={styles.container}>
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
          <div className={styles.welcomeSide}>
            <div className={`${styles.circle} ${styles.circle1}`}></div>
            <div className={`${styles.circle} ${styles.circle2}`}></div>
            <h2 className={styles.welcomeTitle}>Welcome to DLMS</h2>
            <p className={styles.welcomeText}>
              Welcome to our secure platform. Sign in to access your account and
              manage your driver's license information efficiently.
            </p>
          </div>

          <div className={styles.formSide}>
            <h2 className={styles.formTitle}>Sign in</h2>
            <p className={styles.formSubtitle}>Access your account</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputForm}>
                <FaEnvelope size={18} color="#666" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputForm}>
                <FaLock size={18} color="#666" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} color="#666" />
                  ) : (
                    <FaEye size={18} color="#666" />
                  )}
                </button>
              </div>

              <div className={styles.forgotPassword}>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <p className={styles.signupText}>
                Don't have an account?{" "}
                <Link to="/signup" className={styles.signupLink}>
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signin;
