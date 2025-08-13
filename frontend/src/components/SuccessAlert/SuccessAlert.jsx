import React, { useEffect } from "react";
import styles from "./SuccessAlert.module.css";
import { FaCheckCircle } from "react-icons/fa";

const SuccessAlert = ({ message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={styles.successAlert}>
      <div className={styles.alertContent}>
        <FaCheckCircle className={styles.icon} />
        <span className={styles.message}>{message}</span>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default SuccessAlert;
