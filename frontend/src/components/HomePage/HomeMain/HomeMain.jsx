import React, { useState, useEffect, useRef } from "react";
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [systemStats, setSystemStats] = useState({
    totalApplications: 0,
    passedExams: 0,
    issuedLicenses: 0,
    activeUsers: 0,
  });
  const containerRef = useRef(null);

  // Mouse tracking effect for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

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

  // Statistics Display component
  const StatisticsDisplay = ({ stat, value, icon, label, side }) => (
    <div className={`${styles.statisticsDisplay} ${styles[`stats${side}`]}`}>
      <div className={styles.statsFace}>
        <div className={styles.statsIcon}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className={styles.statsValue}>
          <span>{value.toLocaleString()}</span>
        </div>
        <div className={styles.statsLabel}>
          <small>{label}</small>
        </div>
        <div className={styles.statsProgress}>
          <div
            className={styles.progressBar}
            style={{
              width: `${Math.min((value / 5000) * 100, 100)}%`,
              background: `linear-gradient(45deg, #4ecdc4, #45b7d1)`,
            }}
          />
        </div>
      </div>
    </div>
  );

  // License Card component
  const LicenseCard = ({ side, type, count }) => (
    <div className={`${styles.licenseContainer} ${styles[`license${side}`]}`}>
      <div className={styles.licenseCard}>
        <div className={styles.licenseHeader}>
          <FontAwesomeIcon icon={faIdCard} className={styles.licenseIcon} />
          <span className={styles.licenseTitle}>Ethiopian Driving License</span>
        </div>

        <div className={styles.licenseBody}>
          <div className={styles.licenseType}>
            <span className={styles.typeLabel}>Class:</span>
            <span className={styles.typeValue}>{type}</span>
          </div>

          <div className={styles.licenseStats}>
            <div className={styles.statItem}>
              <FontAwesomeIcon icon={faClipboardCheck} />
              <span>{count.toLocaleString()}</span>
              <small>Issued</small>
            </div>
          </div>

          <div className={styles.licenseFeatures}>
            <div className={styles.feature}>✓ Digital Verification</div>
            <div className={styles.feature}>✓ QR Code Security</div>
            <div className={styles.feature}>✓ Online Renewal</div>
          </div>
        </div>

        <div className={styles.licenseFooter}>
          <div className={styles.validityBadge}>
            <span>Valid & Secure</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Interactive Background */}
      <div className={styles.interactiveBackground}>
        <div
          className={styles.mouseFollower}
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
          }}
        />

        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
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
                  onClick={(e) => {
                    console.log("Services button clicked!");
                  }}
                >
                  <FontAwesomeIcon icon={faRocket} />
                  {t("home.exploreServices") || "Explore Services"}
                </Link>
                <Link
                  to="/user-manual"
                  className={styles.secondaryButton}
                  onClick={(e) => {
                    console.log("User Manual button clicked!");
                  }}
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

            <motion.div
              className={styles.heroImage}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <div className={styles.licenseCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardLogo}>
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <div className={styles.cardTitle}>
                    {t("home.drivingLicense") || "DRIVING LICENSE"}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardPhoto}></div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardLine}></div>
                    <div className={styles.cardLine}></div>
                    <div className={styles.cardLine}></div>
                  </div>
                </div>
              </div>
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
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
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
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
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
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
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
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
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
