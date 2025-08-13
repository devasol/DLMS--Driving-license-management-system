import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./UserManual.module.css";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  BookOpen,
  FileText,
  UploadCloud,
  Search,
  BadgeCheck,
  CalendarCheck,
  ShieldCheck,
  FileSignature,
  Printer,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Bookmark,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  Target,
  Users,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Menu,
  X,
  Filter,
  Grid,
  List,
  Eye,
  ThumbsUp,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  Download as DownloadIcon,
  Sparkles,
  Rocket,
  Award,
  TrendingUp,
  Layers,
  Cpu,
  Wifi,
  Battery,
  Volume2,
} from "lucide-react";

const steps = [
  {
    icon: <FileText className={`${styles.icon} ${styles.iconBlue}`} />,
    title: "Create an Account",
    description:
      "To get started, register on the portal using your full name, valid email address, and a secure password. Make sure to verify your email to activate your account.",
  },
  {
    icon: <UploadCloud className={`${styles.icon} ${styles.iconGreen}`} />,
    title: "Upload Required Documents",
    description:
      "Submit clear scanned copies of your National ID, recent passport-sized photo, and proof of residence. All documents must be in PDF or JPEG format.",
  },
  {
    icon: <FileSignature className={`${styles.icon} ${styles.iconPurple}`} />,
    title: "Fill Application Form",
    description:
      "Provide personal information, address, blood group, and medical declarations. Choose the type of license you want to apply for: learner, permanent, or renewal.",
  },
  {
    icon: <CalendarCheck className={`${styles.icon} ${styles.iconYellow}`} />,
    title: "Book Driving Test",
    description:
      "Select a convenient date and location for your theoretical and practical driving exams. You'll receive a confirmation notification on your dashboard.",
  },
  {
    icon: <ShieldCheck className={`${styles.icon} ${styles.iconBlue}`} />,
    title: "Attend and Pass the Test",
    description:
      "On test day, arrive on time with original documents. Upon passing both the theory and practical exams, your status will be updated automatically.",
  },
  {
    icon: <Search className={`${styles.icon} ${styles.iconGreen}`} />,
    title: "Track Application Status",
    description:
      "Check your real-time status updates, review comments from examiners, and receive email alerts for important steps or missing documents.",
  },
  {
    icon: <BadgeCheck className={`${styles.icon} ${styles.iconPurple}`} />,
    title: "Approval & License Generation",
    description:
      "Once approved by the authority, your license will be generated digitally. You’ll get a QR-coded digital version and the option to print.",
  },
  {
    icon: <Printer className={`${styles.icon} ${styles.iconYellow}`} />,
    title: "Download or Request Print",
    description:
      "Download your driving license or request a hard copy to be sent by mail. Keep a backup in your device for verification purposes.",
  },
];

const UserManual = () => {
  const { t } = useLanguage();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("wizard"); // 'wizard', 'cards', 'timeline'
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarkedSteps, setBookmarkedSteps] = useState(new Set());
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("overview");
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);


  // Enhanced steps data with stunning visuals
  const enhancedSteps = [
    {
      id: 1,
      icon: <Rocket className={styles.stepIcon} />,
      title: t("userManualPage.step1Title"),
      description: t("userManualPage.step1Description"),
      details: t("userManualPage.step1Details"),
      estimatedTime: 5,
      difficulty: "easy",
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      category: "setup",
      features: ["Email verification", "Secure password", "Account activation"],
      tips: ["Use a unique password", "Check spam folder", "Keep credentials safe"]
    },
    {
      id: 2,
      icon: <Layers className={styles.stepIcon} />,
      title: t("userManualPage.step2Title"),
      description: t("userManualPage.step2Description"),
      details: t("userManualPage.step2Details"),
      estimatedTime: 10,
      difficulty: "easy",
      color: "#10B981",
      gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      category: "documents",
      features: ["Document scanning", "Format validation", "Quality check"],
      tips: ["Good lighting", "High resolution", "Check file size"]
    },
    {
      id: 3,
      icon: <FileSignature className={styles.stepIcon} />,
      title: t("userManualPage.step3Title"),
      description: t("userManualPage.step3Description"),
      details: t("userManualPage.step3Details"),
      estimatedTime: 15,
      difficulty: "medium",
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      category: "application",
      features: ["Form validation", "Auto-save", "Progress tracking"],
      tips: ["Double-check entries", "Save frequently", "Have documents ready"]
    },
    {
      id: 4,
      icon: <CalendarCheck className={styles.stepIcon} />,
      title: t("userManualPage.step4Title"),
      description: t("userManualPage.step4Description"),
      details: t("userManualPage.step4Details"),
      estimatedTime: 5,
      difficulty: "easy",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      category: "testing",
      features: ["Real-time booking", "Location selection", "Instant confirmation"],
      tips: ["Book early", "Check cancellation policy", "Confirm location"]
    },
    {
      id: 5,
      icon: <ShieldCheck className={styles.stepIcon} />,
      title: t("userManualPage.step5Title"),
      description: t("userManualPage.step5Description"),
      details: t("userManualPage.step5Details"),
      estimatedTime: 120,
      difficulty: "advanced",
      color: "#EF4444",
      gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      category: "testing",
      features: ["Theory test", "Practical test", "Real-time results"],
      tips: ["Arrive early", "Bring backup documents", "Stay calm"]
    },
    {
      id: 6,
      icon: <TrendingUp className={styles.stepIcon} />,
      title: t("userManualPage.step6Title"),
      description: t("userManualPage.step6Description"),
      details: t("userManualPage.step6Details"),
      estimatedTime: 2,
      difficulty: "easy",
      color: "#06B6D4",
      gradient: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
      category: "tracking",
      features: ["Real-time updates", "Email notifications", "Status history"],
      tips: ["Check regularly", "Enable notifications", "Contact support if needed"]
    },
    {
      id: 7,
      icon: <Award className={styles.stepIcon} />,
      title: t("userManualPage.step7Title"),
      description: t("userManualPage.step7Description"),
      details: t("userManualPage.step7Details"),
      estimatedTime: 1440,
      difficulty: "easy",
      color: "#F97316",
      gradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
      category: "approval",
      features: ["Digital generation", "QR code", "Instant download"],
      tips: ["Wait for notification", "Check email", "Verify QR code"]
    },
    {
      id: 8,
      icon: <Printer className={styles.stepIcon} />,
      title: t("userManualPage.step8Title"),
      description: t("userManualPage.step8Description"),
      details: t("userManualPage.step8Details"),
      estimatedTime: 5,
      difficulty: "easy",
      color: "#84CC16",
      gradient: "linear-gradient(135deg, #84CC16 0%, #65A30D 100%)",
      category: "completion",
      features: ["Digital download", "Print option", "Cloud backup"],
      tips: ["Save multiple copies", "Test QR code", "Keep backup"]
    }
  ];



  // Calculate progress
  useEffect(() => {
    const completed = completedSteps.size;
    const total = enhancedSteps.length;
    const newProgress = (completed / total) * 100;
    setProgress(newProgress);
  }, [completedSteps, enhancedSteps.length]);

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isPlaying && activeStep < enhancedSteps.length - 1) {
      interval = setInterval(() => {
        setActiveStep(prev => prev + 1);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeStep, enhancedSteps.length]);

  // Helper functions
  const toggleStepComplete = (stepId) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} ${t("userManualPage.minutes")}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} ${t("userManualPage.hours")}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} ${t("userManualPage.days")}`;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated Background Particles */}
      <div className={styles.backgroundParticles}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              background: enhancedSteps[Math.floor(Math.random() * enhancedSteps.length)].color,
            }}
          />
        ))}
      </div>

      {/* Stunning Hero Section */}
      <motion.div
        className={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className={styles.heroContent}>
          {/* Animated Logo */}
          <motion.div
            className={styles.heroLogo}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
          >
            <div className={styles.logoRing}>
              <Sparkles className={styles.logoIcon} />
            </div>
            <div className={styles.logoGlow}></div>
          </motion.div>

          {/* Dynamic Title */}
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className={styles.titleWord}>
              {t("userManualPage.title").split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={styles.titleLetter}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* Subtitle with Typewriter Effect */}
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {t("userManualPage.subtitle")}
          </motion.p>

          {/* Interactive Stats Dashboard */}
          <motion.div
            className={styles.statsGrid}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users />
              </div>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Users Helped</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Zap />
              </div>
              <div className={styles.statNumber}>5 min</div>
              <div className={styles.statLabel}>Avg. Setup Time</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Award />
              </div>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Success Rate</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className={styles.heroActions}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.button
              className={styles.primaryButton}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(102, 126, 234, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("wizard")}
            >
              <Rocket className={styles.buttonIcon} />
              <span>Start Interactive Guide</span>
              <div className={styles.buttonGlow}></div>
            </motion.button>

            <motion.button
              className={styles.secondaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DownloadIcon className={styles.buttonIcon} />
              <span>Download PDF</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Interactive Control Panel */}
      <motion.div
        className={styles.controlPanel}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className={styles.controlPanelContent}>
          {/* Search with AI suggestions */}
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t("userManualPage.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchGlow}></div>
          </div>

          {/* View Mode Selector */}
          <div className={styles.viewModeSelector}>
            <motion.button
              className={`${styles.viewModeButton} ${viewMode === 'wizard' ? styles.active : ''}`}
              onClick={() => setViewMode('wizard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className={styles.viewIcon} />
              <span>Wizard</span>
            </motion.button>

            <motion.button
              className={`${styles.viewModeButton} ${viewMode === 'cards' ? styles.active : ''}`}
              onClick={() => setViewMode('cards')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid className={styles.viewIcon} />
              <span>Cards</span>
            </motion.button>

            <motion.button
              className={`${styles.viewModeButton} ${viewMode === 'timeline' ? styles.active : ''}`}
              onClick={() => setViewMode('timeline')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp className={styles.viewIcon} />
              <span>Timeline</span>
            </motion.button>
          </div>

          {/* Progress Indicator */}
          <div className={styles.progressIndicator}>
            <div className={styles.progressRing}>
              <svg className={styles.progressSvg} viewBox="0 0 100 100">
                <circle
                  className={styles.progressBackground}
                  cx="50"
                  cy="50"
                  r="45"
                />
                <motion.circle
                  className={styles.progressForeground}
                  cx="50"
                  cy="50"
                  r="45"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
              <div className={styles.progressText}>
                <span className={styles.progressNumber}>{Math.round(progress)}%</span>
                <span className={styles.progressLabel}>Complete</span>
              </div>
            </div>
          </div>

          {/* Auto-play Controls */}
          <div className={styles.playbackControls}>
            <motion.button
              className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? <Pause /> : <Play />}
            </motion.button>
            <motion.button
              className={styles.resetButton}
              onClick={() => {
                setActiveStep(0);
                setIsPlaying(false);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Interactive Wizard View */}
      {viewMode === 'wizard' && (
        <motion.div
          className={styles.wizardContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Step Navigation */}
          <div className={styles.stepNavigation}>
            <motion.button
              className={styles.navButton}
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className={styles.navIcon} />
              <span>Previous</span>
            </motion.button>

            <div className={styles.stepIndicator}>
              <span className={styles.currentStep}>{activeStep + 1}</span>
              <span className={styles.stepSeparator}>of</span>
              <span className={styles.totalSteps}>{enhancedSteps.length}</span>
            </div>

            <motion.button
              className={styles.navButton}
              onClick={() => setActiveStep(Math.min(enhancedSteps.length - 1, activeStep + 1))}
              disabled={activeStep === enhancedSteps.length - 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next</span>
              <ChevronRight className={styles.navIcon} />
            </motion.button>
          </div>

          {/* Main Step Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              className={styles.wizardStep}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.5
              }}
            >
              <div className={styles.stepCard}>
                {/* Step Header */}
                <div
                  className={styles.stepHeader}
                  style={{ background: enhancedSteps[activeStep].gradient }}
                >
                  <div className={styles.stepIconContainer}>
                    {enhancedSteps[activeStep].icon}
                  </div>
                  <div className={styles.stepHeaderContent}>
                    <h2 className={styles.stepTitle}>{enhancedSteps[activeStep].title}</h2>
                    <div className={styles.stepMeta}>
                      <span className={styles.stepTime}>
                        <Clock className={styles.metaIcon} />
                        {formatTime(enhancedSteps[activeStep].estimatedTime)}
                      </span>
                      <span
                        className={styles.stepDifficulty}
                        style={{ color: getDifficultyColor(enhancedSteps[activeStep].difficulty) }}
                      >
                        <Star className={styles.metaIcon} />
                        {t(`userManualPage.${enhancedSteps[activeStep].difficulty}`)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.stepActions}>
                    <motion.button
                      className={`${styles.actionButton} ${completedSteps.has(enhancedSteps[activeStep].id) ? styles.completed : ''}`}
                      onClick={() => toggleStepComplete(enhancedSteps[activeStep].id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Check className={styles.actionIcon} />
                    </motion.button>
                    <motion.button
                      className={styles.actionButton}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Bookmark className={styles.actionIcon} />
                    </motion.button>
                    <motion.button
                      className={styles.actionButton}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className={styles.actionIcon} />
                    </motion.button>
                  </div>
                </div>

                {/* Step Content */}
                <div className={styles.stepContent}>
                  <p className={styles.stepDescription}>{enhancedSteps[activeStep].description}</p>

                  {/* Features Grid */}
                  <div className={styles.featuresGrid}>
                    <div className={styles.featureSection}>
                      <h4 className={styles.featureTitle}>
                        <Lightbulb className={styles.featureIcon} />
                        Key Features
                      </h4>
                      <ul className={styles.featuresList}>
                        {enhancedSteps[activeStep].features.map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.featureSection}>
                      <h4 className={styles.featureTitle}>
                        <Target className={styles.featureIcon} />
                        Pro Tips
                      </h4>
                      <ul className={styles.featuresList}>
                        {enhancedSteps[activeStep].tips.map((tip, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                          >
                            {tip}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Interactive Demo Button */}
                  <motion.button
                    className={styles.demoButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className={styles.demoIcon} />
                    <span>Watch Interactive Demo</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step Progress Dots */}
          <div className={styles.stepDots}>
            {enhancedSteps.map((step, index) => (
              <motion.button
                key={step.id}
                className={`${styles.stepDot} ${index === activeStep ? styles.active : ''} ${completedSteps.has(step.id) ? styles.completed : ''}`}
                onClick={() => setActiveStep(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                style={{ backgroundColor: index === activeStep ? step.color : undefined }}
              >
                {completedSteps.has(step.id) ? (
                  <Check className={styles.dotIcon} />
                ) : (
                  <span className={styles.dotNumber}>{step.id}</span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <motion.div
          className={styles.cardsContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.cardsGrid}>
            {enhancedSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`${styles.stepCard} ${completedSteps.has(step.id) ? styles.completed : ''}`}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                whileHover={{
                  y: -20,
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)"
                }}
                onClick={() => {
                  setActiveStep(index);
                  setViewMode('wizard');
                }}
              >
                <div
                  className={styles.cardHeader}
                  style={{ background: step.gradient }}
                >
                  <div className={styles.cardIconContainer}>
                    {step.icon}
                  </div>
                  <div className={styles.cardNumber}>{step.id}</div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardDescription}>{step.description}</p>

                  <div className={styles.cardMeta}>
                    <span className={styles.cardTime}>
                      <Clock className={styles.cardMetaIcon} />
                      {formatTime(step.estimatedTime)}
                    </span>
                    <span
                      className={styles.cardDifficulty}
                      style={{ color: getDifficultyColor(step.difficulty) }}
                    >
                      <Star className={styles.cardMetaIcon} />
                      {t(`userManualPage.${step.difficulty}`)}
                    </span>
                  </div>

                  <div className={styles.cardFeatures}>
                    {step.features.slice(0, 2).map((feature, featureIndex) => (
                      <span key={featureIndex} className={styles.cardFeature}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <motion.button
                    className={`${styles.cardActionButton} ${completedSteps.has(step.id) ? styles.completed : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStepComplete(step.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Check className={styles.cardActionIcon} />
                  </motion.button>
                </div>

                {completedSteps.has(step.id) && (
                  <motion.div
                    className={styles.completedBadge}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className={styles.completedIcon} />
                  </motion.div>
                )}

                <div className={styles.cardGlow}></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <motion.div
          className={styles.timelineContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.timelinePath}>
            {enhancedSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`${styles.timelineItem} ${completedSteps.has(step.id) ? styles.completed : ''}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className={styles.timelineContent}>
                  <div
                    className={styles.timelineCard}
                    style={{ borderColor: step.color }}
                  >
                    <div className={styles.timelineHeader}>
                      <div
                        className={styles.timelineIcon}
                        style={{ background: step.gradient }}
                      >
                        {step.icon}
                      </div>
                      <h3 className={styles.timelineTitle}>{step.title}</h3>
                    </div>
                    <p className={styles.timelineDescription}>{step.description}</p>
                    <div className={styles.timelineMeta}>
                      <span className={styles.timelineTime}>
                        <Clock className={styles.timelineMetaIcon} />
                        {formatTime(step.estimatedTime)}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={styles.timelineDot}
                  style={{ backgroundColor: step.color }}
                >
                  {completedSteps.has(step.id) ? (
                    <Check className={styles.timelineDotIcon} />
                  ) : (
                    <span className={styles.timelineDotNumber}>{step.id}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Floating Action Button */}
      <motion.button
        className={styles.floatingActionButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowFloatingMenu(!showFloatingMenu)}
      >
        <HelpCircle />
      </motion.button>

      {/* Success Message */}
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className={styles.successIcon} />
            <span>{t("userManualPage.copied")}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManual;
