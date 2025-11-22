import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faShieldAlt,
  faClock,
  faUsers,
  faGraduationCap,
  faFileAlt,
  faIdCard,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./HomeMain.module.css";
import { motion } from "framer-motion";

const HomeMain = () => {
  const { t } = useLanguage();
  const [systemStats, setSystemStats] = useState({
    totalApplications: 0,
    passedExams: 0,
    issuedLicenses: 0,
    activeUsers: 0,
  });

  // Fetch system statistics
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        // Simulate fetching system statistics
        // In a real implementation, these would come from API endpoints
        setSystemStats({
          totalApplications: Math.floor(Math.random() * 5000) + 1000,
          passedExams: Math.floor(Math.random() * 3000) + 800,
          issuedLicenses: Math.floor(Math.random() * 2500) + 600,
          activeUsers: Math.floor(Math.random() * 1500) + 300,
        });
      } catch (error) {
        console.error("Error fetching system stats:", error);
      }
    };

    fetchSystemStats();
    // Update stats every 5 minutes instead of 30 seconds
    const interval = setInterval(fetchSystemStats, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {/* Interactive Background */}
      <div className={styles.interactiveBackground}>
        <div className={styles.backgroundOverlay}></div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Hero Section with animated entrance */}
        <motion.div
          className={styles.heroSection}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroText}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <h1 className={styles.heroTitle}>
                {t("home.title") || "Get Your Driving License Online"}
              </h1>
              <p className={styles.heroSubtitle}>
                {t("home.subtitle") ||
                  "Experience the future of driving license management with our interactive, responsive platform."}
              </p>
              <div className={styles.heroButtons}>
                <Link
                  to="/services"
                  className={styles.primaryButton}
                >
                  <FontAwesomeIcon icon={faRocket} />
                  {t("home.exploreServices") || "Explore Services"}
                </Link>
                <Link
                  to="/user-manual"
                  className={styles.secondaryButton}
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                  {t("home.userManual") || "User Manual"}
                </Link>
              </div>

              {/* Interactive Stats */}
              <motion.div
                className={styles.interactiveStats}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className={styles.statItem}>
                  <FontAwesomeIcon icon={faUsers} />
                  <span>
                    Active Users: {systemStats.activeUsers.toLocaleString()}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <FontAwesomeIcon icon={faIdCard} />
                  <span>
                    Licenses Issued:{" "}
                    {systemStats.issuedLicenses.toLocaleString()}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  <span>
                    Success Rate:{" "}
                    {Math.round(
                      (systemStats.passedExams /
                        systemStats.totalApplications) *
                        100
                    )}
                    %
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className={styles.featuresSection}>
          <motion.div
            className={styles.featuresGrid}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              className={`${styles.featureCard} ${styles.hoverLift}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3>{t("home.features.fast.title") || "Fast Processing"}</h3>
              <p>
                {t("home.features.fast.description") ||
                  "Get your license processed quickly with our streamlined online system."}
              </p>
            </motion.div>

            <motion.div
              className={`${styles.featureCard} ${styles.hoverLift}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3>{t("home.features.secure.title") || "Secure & Safe"}</h3>
              <p>
                {t("home.features.secure.description") ||
                  "Your personal information is protected with advanced security measures."}
              </p>
            </motion.div>

            <motion.div
              className={`${styles.featureCard} ${styles.hoverLift}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>{t("home.features.support.title") || "24/7 Support"}</h3>
              <p>
                {t("home.features.support.description") ||
                  "Our dedicated support team is available around the clock to help you."}
              </p>
            </motion.div>

            <motion.div
              className={`${styles.featureCard} ${styles.hoverLift}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <h3>{t("home.features.training.title") || "Online Training"}</h3>
              <p>
                {t("home.features.training.description") ||
                  "Complete your driving education with our comprehensive online courses."}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomeMain;
