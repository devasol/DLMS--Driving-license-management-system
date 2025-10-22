import React from "react";
import logo from "../../assets/images/logo.png";
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src={logo} alt="logo of the website" />
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 150"
        className={styles.plugImage}
      >
        <path
          fill="#64748b"
          d="M140,50 L160,70 L160,80 L140,100 L130,90 L120,100 L100,80 L100,70 L120,50 L130,60 Z"
        />
        <path
          fill="#64748b"
          d="M360,50 L340,70 L340,80 L360,100 L370,90 L380,100 L400,80 L400,70 L380,50 L370,60 Z"
        />
        <rect x="230" y="60" width="40" height="10" fill="#facc15" />
        <rect x="230" y="80" width="40" height="10" fill="#facc15" />
      </svg>

      <div className={styles.errorCode}>404</div>
      <div className={styles.message}>Oops! PAGE NOT FOUND</div>
      <div className={styles.subMessage}>
        We're sorry, the page you're looking for doesn't exist.
        <br />
        If you think something's not working, report an issue.
      </div>

      <button
        className={styles.button}
        onClick={() => (window.location.href = "/")}
      >
        GO TO HOME
      </button>
    </div>
  );
};

export default NotFound;
