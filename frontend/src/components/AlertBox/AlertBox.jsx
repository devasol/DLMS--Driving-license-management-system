import React, { useEffect } from "react";
import styles from "./AlertBox.module.css";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const AlertBox = ({ message, type = "error", onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Ensure we have a fallback message if none is provided
  const displayMessage = message || "An error occurred. Please try again.";

  // Determine icon based on alert type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className={styles.icon} />;
      case "warning":
        return <FaExclamationTriangle className={styles.icon} />;
      case "info":
        return <FaInfoCircle className={styles.icon} />;
      case "error":
      default:
        return <FaExclamationCircle className={styles.icon} />;
    }
  };

  return (
    <div className={`${styles.alertBox} ${styles[type]}`}>
      <div className={styles.alertContent}>
        {getIcon()}
        <span className={styles.message}>{displayMessage}</span>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default AlertBox;
