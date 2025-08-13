import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faEye,
  faBullseye,
  faAward,
  faCalendarAlt,
  faGlobe,
  faHandshake,
  faLightbulb,
  faShieldAlt,
  faRocket,
  faPlay,
  faPause,
  faStar,
  faHeart,
  faFire,
  faGem,
  faChevronDown,
  faQuoteLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import image from "../../assets/images/service.png";
import styles from "./Aboutus.module.css";
import { useLanguage } from "../../contexts/LanguageContext";

const Aboutus = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const sections = [
    {
      id: 0,
      title: t("aboutPage.mission") || "Our Mission",
      icon: faRocket,
      content:
        t("aboutPage.missionContent") ||
        "To revolutionize driving license management through innovative digital solutions that prioritize user experience, efficiency, and accessibility for everyone.",
      features: [
        t("aboutPage.digitalInnovation") || "Digital Innovation",
        t("aboutPage.userCentricDesign") || "User-Centric Design",
        t("aboutPage.globalAccessibility") || "Global Accessibility",
        t("aboutPage.continuousImprovement") || "Continuous Improvement",
      ],
    },
    {
      id: 1,
      title: t("aboutPage.vision") || "Our Vision",
      icon: faEye,
      content:
        t("aboutPage.visionContent") ||
        "To become the world's leading platform for driving license services, setting new standards for digital government services and citizen engagement.",
      features: [
        t("aboutPage.globalLeadership") || "Global Leadership",
        t("aboutPage.digitalExcellence") || "Digital Excellence",
        t("aboutPage.citizenEmpowerment") || "Citizen Empowerment",
        t("aboutPage.futureInnovation") || "Future Innovation",
      ],
    },
    {
      id: 2,
      title: t("aboutPage.values") || "Our Values",
      icon: faHeart,
      content:
        t("aboutPage.valuesContent") ||
        "We are guided by principles of integrity, innovation, user focus, and excellence in everything we do to serve our community better.",
      features: [
        t("aboutPage.integrity") || "Integrity",
        t("aboutPage.innovation") || "Innovation",
        t("aboutPage.userFocus") || "User Focus",
        t("aboutPage.excellence") || "Excellence",
      ],
    },
  ];

  const stats = [
    {
      number: "50K+",
      label: t("aboutPage.happyUsers") || "Happy Users",
      icon: faUsers,
    },
    {
      number: "5+",
      label: t("aboutPage.yearsExperience") || "Years Experience",
      icon: faCalendarAlt,
    },
    {
      number: "99%",
      label: t("aboutPage.satisfactionRate") || "Satisfaction Rate",
      icon: faAward,
    },
    {
      number: "24/7",
      label: t("aboutPage.supportAvailable") || "Support Available",
      icon: faGlobe,
    },
  ];

  const values = [
    {
      icon: faShieldAlt,
      title: t("aboutPage.securityFirst") || "Security First",
      description:
        t("aboutPage.securityFirstDesc") ||
        "Your data security and privacy are our top priorities with bank-level encryption.",
      color: "#667eea",
    },
    {
      icon: faRocket,
      title: t("aboutPage.innovation") || "Innovation",
      description:
        t("aboutPage.innovationDesc") ||
        "Constantly evolving with cutting-edge technology to serve you better.",
      color: "#f093fb",
    },
    {
      icon: faUsers,
      title: t("aboutPage.userCentric") || "User-Centric",
      description:
        t("aboutPage.userCentricDesc") ||
        "Every feature is designed with our users' needs and experience in mind.",
      color: "#4facfe",
    },
    {
      icon: faHandshake,
      title: t("aboutPage.reliability") || "Reliability",
      description:
        t("aboutPage.reliabilityDesc") ||
        "Dependable service you can trust for all your license management needs.",
      color: "#43e97b",
    },
    {
      icon: faLightbulb,
      title: "Transparency",
      description:
        "Clear processes and honest communication in everything we do.",
      color: "#fa709a",
    },
    {
      icon: faGem,
      title: "Excellence",
      description:
        "Committed to delivering the highest quality service and support.",
      color: "#a8edea",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Licensed Driver",
      content:
        "The platform made renewing my license so easy! The whole process took less than 10 minutes.",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "New Driver",
      content:
        "Amazing experience applying for my first license. The step-by-step guidance was perfect.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Business Owner",
      content:
        "As a fleet manager, this platform has streamlined all our license management processes.",
      rating: 5,
      avatar: "ER",
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAnimationPaused) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length, isAnimationPaused]);

  // Auto-rotate sections
  useEffect(() => {
    if (!isAnimationPaused) {
      const interval = setInterval(() => {
        setActiveSection((prev) => (prev + 1) % sections.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [sections.length, isAnimationPaused]);

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Hero Section - Consistent with Services/Contact */}
      <motion.div
        className={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className={styles.heroBackground}>
          <motion.div
            className={styles.heroShape1}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 8, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className={styles.heroShape2}
            animate={{
              y: [0, 20, 0],
              rotate: [0, -6, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </div>

        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <FontAwesomeIcon icon={faStar} />
            <span>
              {t("aboutPage.leadingPlatform") || "Leading Digital Platform"}
            </span>
          </motion.div>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <span className={styles.titleGradient}>
              {t("aboutPage.aboutOur") || "About Our"}
            </span>
            <br />
            <span className={styles.titleOutline}>
              {t("aboutPage.amazingPlatform") || "Amazing Platform"}
            </span>
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Discover the story behind our revolutionary driving license
            management system and the values that drive us forward
          </motion.p>

          <motion.div
            className={styles.heroStats}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className={styles.heroStat}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Happy Users</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.statNumber}>5+</span>
              <span className={styles.statLabel}>Years Experience</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.statNumber}>99%</span>
              <span className={styles.statLabel}>Satisfaction</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Section */}
      <motion.div
        className={styles.statsSection}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className={styles.statsContainer}>
          <motion.div
            className={styles.statsHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>{t("aboutPage.ourImpact") || "Our Impact in Numbers"}</h2>
            <p>
              {t("aboutPage.impactDescription") ||
                "See how we're making a difference in the driving license management space"}
            </p>
          </motion.div>

          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.statCard}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <FontAwesomeIcon icon={stat.icon} className={styles.statIcon} />
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
                <motion.div
                  className={styles.statProgress}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                  viewport={{ once: true }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Interactive Tabbed Section */}
      <motion.div
        className={styles.tabbedSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className={styles.tabbedContainer}>
          <div className={styles.tabNavigation}>
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                className={`${styles.tabButton} ${
                  activeSection === index ? styles.active : ""
                }`}
                onClick={() => setActiveSection(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={section.icon} />
                <span>{section.title}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              className={styles.tabContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.tabContentInner}>
                <FontAwesomeIcon
                  icon={sections[activeSection].icon}
                  className={styles.tabIcon}
                />
                <h3>{sections[activeSection].title}</h3>
                <p>{sections[activeSection].content}</p>
                <div className={styles.tabFeatures}>
                  {sections[activeSection].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className={styles.featureItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Enhanced Values Section */}
      <motion.div
        className={styles.valuesSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className={styles.valuesContainer}>
          <motion.div
            className={styles.valuesHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>{t("aboutPage.coreValues") || "Our Core Values"}</h2>
            <p>
              {t("aboutPage.coreValuesDescription") ||
                "The principles that guide everything we do"}
            </p>
          </motion.div>

          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <motion.div
                key={index}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  scale: 1.05,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                }}
              >
                <motion.div
                  className={styles.valueIcon}
                  style={{ color: value.color }}
                  whileHover={{
                    rotate: 360,
                    scale: 1.2,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <FontAwesomeIcon icon={value.icon} />
                </motion.div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
                <motion.div
                  className={styles.valueGlow}
                  style={{
                    background: `linear-gradient(45deg, ${value.color}20, ${value.color}10)`,
                  }}
                  whileHover={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        className={styles.testimonialsSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className={styles.testimonialsContainer}>
          <motion.div
            className={styles.testimonialsHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>{t("aboutPage.userTestimonials") || "What Our Users Say"}</h2>
            <p>
              {t("aboutPage.testimonialsDescription") ||
                "Real feedback from our amazing community"}
            </p>
          </motion.div>

          <div className={styles.testimonialsCarousel}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                className={styles.testimonialCard}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <FontAwesomeIcon
                  icon={faQuoteLeft}
                  className={styles.quoteIcon}
                />
                <p className={styles.testimonialContent}>
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className={styles.authorInfo}>
                    <h4>{testimonials[currentTestimonial].name}</h4>
                    <p>{testimonials[currentTestimonial].role}</p>
                    <div className={styles.rating}>
                      {[...Array(testimonials[currentTestimonial].rating)].map(
                        (_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className={styles.testimonialControls}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.testimonialDot} ${
                    currentTestimonial === index ? styles.active : ""
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced CTA Section */}
      <motion.div
        className={styles.ctaSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className={styles.ctaBackground}>
          <motion.div
            className={styles.ctaShape1}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className={styles.ctaShape2}
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className={styles.ctaContent}>
          <motion.div
            className={styles.ctaBadge}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <FontAwesomeIcon icon={faRocket} />
            <span>
              {t("aboutPage.readyToStart") || "Ready to Get Started?"}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            {t("aboutPage.joinUsers") || "Join Thousands of Satisfied Users"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Experience the future of driving license management today. Simple,
            secure, and efficient.
          </motion.p>

          <motion.div
            className={styles.ctaActions}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.button
              className={styles.ctaButton}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Get Started Now</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </motion.button>

            <motion.button
              className={styles.ctaSecondaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAnimationPaused(!isAnimationPaused)}
            >
              <FontAwesomeIcon icon={isAnimationPaused ? faPlay : faPause} />
              <span>{isAnimationPaused ? "Resume" : "Pause"} Animations</span>
            </motion.button>
          </motion.div>

          <motion.div
            className={styles.ctaStats}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className={styles.ctaStat}>
              <span className={styles.ctaStatNumber}>50K+</span>
              <span className={styles.ctaStatLabel}>Active Users</span>
            </div>
            <div className={styles.ctaStat}>
              <span className={styles.ctaStatNumber}>99%</span>
              <span className={styles.ctaStatLabel}>Satisfaction</span>
            </div>
            <div className={styles.ctaStat}>
              <span className={styles.ctaStatNumber}>24/7</span>
              <span className={styles.ctaStatLabel}>Support</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Aboutus;
