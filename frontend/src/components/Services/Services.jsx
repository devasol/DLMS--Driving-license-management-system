import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faCar,
  faGraduationCap,
  faShieldAlt,
  faRocket,
  faUsers,
  faCheckCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Services.module.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { optimizedPageVariants } from "../../utils/performanceOptimizations";

const Services = () => {
  const { t } = useLanguage();
  const [visibleCards, setVisibleCards] = useState({});
  const cardRefs = useRef([]);

  // Ethiopian License Categories
  const licenseCategories = [
    {
      id: 1,
      category: "Category 1",
      title: "Motorcycle License",
      description: "Valid for two-wheeled motorcycles (any engine size)",
      minAge: 18,
      icon: faCar,
      color: "#4ecdc4",
      gradient: "linear-gradient(135deg, #4ecdc4, #44a08d)",
    },
    {
      id: 2,
      category: "Category 2",
      title: "Three-Wheel Motorcycle License",
      description:
        "For motor vehicles with three wheels, like tuk-tuks or tricycles",
      minAge: 18,
      icon: faCar,
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    },
    {
      id: 3,
      category: "Category 3",
      title: "Automobile License",
      description:
        "Permits driving vehicles with up to 8 seats, or vehicles with loading capacity up to 10,000 kg",
      minAge: 18,
      icon: faCar,
      color: "#f093fb",
      gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    },
    {
      id: 4,
      category: "Category 4",
      title: "Public Transport Vehicle License",
      description:
        "Public I: Up to 20 seats | Public II: Up to 45 seats | Public III: Beyond 45 seats",
      minAge: 21,
      icon: faUsers,
      color: "#43e97b",
      gradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    },
    {
      id: 5,
      category: "Category 5",
      title: "Truck Driver License",
      description:
        "Truck I: Up to 3,500 kg | Truck II: Without trailers/with crane | Truck III: With/without trailers",
      minAge: 21,
      icon: faRocket,
      color: "#fa709a",
      gradient: "linear-gradient(135deg, #fa709a, #fee140)",
    },
    {
      id: 6,
      category: "Category 6",
      title: "Fuel Tanker Driver License",
      description:
        "Fuel I: Up to 18,000 liters | Fuel II: Liquid-tank vehicles with/without trailer",
      minAge: 21,
      icon: faShieldAlt,
      color: "#a8edea",
      gradient: "linear-gradient(135deg, #a8edea, #fed6e3)",
    },
    {
      id: 7,
      category: "Category 7",
      title: "Machinery Operator License",
      description:
        "Covers special machinery and heavy equipment driven within defined capacity limits",
      minAge: 21,
      icon: faGraduationCap,
      color: "#ff9a9e",
      gradient: "linear-gradient(135deg, #ff9a9e, #fecfef)",
    },
  ];

  // Application Process Steps
  const applicationSteps = [
    {
      id: 1,
      title: "Enroll in Accredited Driving School",
      description:
        "Must be certified under national standards regulated by Ethiopian Transport Authority",
      icon: faGraduationCap,
    },
    {
      id: 2,
      title: "Complete Training Courses",
      description:
        "Theory classes (traffic laws, road signs) and practical driving lessons are mandatory",
      icon: faCheckCircle,
    },
    {
      id: 3,
      title: "Pass Theory Exam",
      description:
        "Written exam covering traffic rules, signage, and regulations (~ETB 200)",
      icon: faIdCard,
    },
    {
      id: 4,
      title: "Pass Practical Test",
      description:
        "On-road driving assessment including parking and maneuvering (~ETB 300)",
      icon: faCar,
    },
    {
      id: 5,
      title: "Submit Documents & Pay Fees",
      description: "Required documents and license issuance fee (~ETB 400-500)",
      icon: faCheckCircle,
    },
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => ({ ...prev, [index]: true }));
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <motion.div
      className={styles.container}
      variants={optimizedPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <motion.div
        className={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {t("services.title") || "Our Amazing Services"}
          </h1>
          <p className={styles.heroSubtitle}>
            {t("services.subtitle") ||
              "Discover our comprehensive range of driving license services designed to make your journey smooth and hassle-free"}
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <FontAwesomeIcon icon={faUsers} className={styles.statIcon} />
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Happy Customers</span>
            </div>
            <div className={styles.stat}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.statIcon}
              />
              <span className={styles.statNumber}>99%</span>
              <span className={styles.statLabel}>Success Rate</span>
            </div>
            <div className={styles.stat}>
              <FontAwesomeIcon icon={faRocket} className={styles.statIcon} />
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Support</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* License Categories Section */}
      <div className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>
              Ethiopian Driving License Categories
            </h2>
            <p className={styles.sectionSubtitle}>
              Choose the right license category for your needs
            </p>
          </motion.div>

          <motion.div
            className={styles.servicesGrid}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {licenseCategories.map((license, index) => (
              <div
                key={license.id}
                ref={(el) => (cardRefs.current[index] = el)}
                className={`${styles.serviceCard} ${
                  visibleCards[index] ? styles.visible : ""
                }`}
                style={{
                  "--service-color": license.color,
                  "--service-gradient": license.gradient,
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconContainer}>
                    <FontAwesomeIcon
                      icon={license.icon}
                      className={styles.serviceIcon}
                    />
                  </div>
                  <h3 className={styles.serviceTitle}>{license.category}</h3>
                  <h4 className={styles.licenseTitle}>{license.title}</h4>
                </div>

                <p className={styles.serviceDescription}>
                  {license.description}
                </p>

                <div className={styles.featuresList}>
                  <div className={styles.feature}>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={styles.featureIcon}
                    />
                    <span>Minimum Age: {license.minAge} years</span>
                  </div>
                  <div className={styles.feature}>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={styles.featureIcon}
                    />
                    <span>Theory & Practical Exam Required</span>
                  </div>
                  <div className={styles.feature}>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={styles.featureIcon}
                    />
                    <span>Medical Certificate Required</span>
                  </div>
                </div>

                <button className={styles.serviceButton}>
                  <span>Apply Now</span>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className={styles.buttonIcon}
                  />
                </button>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Application Process Section */}
      <div className={styles.processSection}>
        <div className={styles.servicesContainer}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>Application Process</h2>
            <p className={styles.sectionSubtitle}>
              Follow these steps to get your Ethiopian driving license
            </p>
          </motion.div>

          <motion.div
            className={styles.processGrid}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {applicationSteps.map((step) => (
              <div key={step.id} className={styles.processStep}>
                <div className={styles.stepNumber}>{step.id}</div>
                <div className={styles.stepIcon}>
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Eligibility Requirements Section */}
      <div className={styles.requirementsSection}>
        <div className={styles.servicesContainer}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>Eligibility Requirements</h2>
            <p className={styles.sectionSubtitle}>
              Make sure you meet these requirements before applying
            </p>
          </motion.div>

          <motion.div
            className={styles.requirementsGrid}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.requirementCard}>
              <FontAwesomeIcon icon={faIdCard} className={styles.reqIcon} />
              <h3>Minimum Age</h3>
              <p>
                At least 18 years old for private vehicles (cars, motorcycles)
              </p>
              <p>21 years old for commercial vehicles (buses, trucks)</p>
            </div>

            <div className={styles.requirementCard}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.reqIcon}
              />
              <h3>Legal Residency</h3>
              <p>Ethiopian citizens: National ID required</p>
              <p>Foreign applicants: Valid residence permit or visa</p>
            </div>

            <div className={styles.requirementCard}>
              <FontAwesomeIcon icon={faShieldAlt} className={styles.reqIcon} />
              <h3>Medical Fitness</h3>
              <p>Mandatory health examination including vision test</p>
              <p>Blood type and color-vision screening required</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Services;
