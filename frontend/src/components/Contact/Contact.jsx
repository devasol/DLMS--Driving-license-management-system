import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faUser,
  faTag,
  faPaperPlane,
  faCheckCircle,
  faExclamationTriangle,
  faComments,
  faWifi,
  faTimes,
  faRocket,
  faStar,
  faHeart,
  faGlobe,
  faShieldAlt,
  faHeadset,
  faArrowRight,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import styles from "./Contact.module.css";
import backToFirstStyles from "../HomePage/BackToFirst/BackToFirst.module.css";
import { useLanguage } from "../../contexts/LanguageContext";

// Function to format chat messages with basic markdown-like formatting
const formatChatMessage = (text) => {
  return (
    text
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert line breaks to <br>
      .replace(/\n/g, "<br>")
      // Convert bullet points (- text) to proper list items
      .replace(
        /^- (.+)$/gm,
        '<div style="margin-left: 20px; margin-bottom: 4px;">• $1</div>'
      )
      // Convert numbered lists (1. text) to proper list items
      .replace(
        /^(\d+)\. (.+)$/gm,
        '<div style="margin-left: 20px; margin-bottom: 4px;">$1. $2</div>'
      )
      // Convert emojis and icons to proper spacing
      .replace(
        /([🚗📝📊📄📞🆓💻🔧🛡️👤📋🔔🔐📍⏰💡✅📱📧💬🏢⏱️])/g,
        '<span style="margin-right: 8px;">$1</span>'
      )
  );
};

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your DLMS AI assistant. I can help you understand our driving license management system, explain how to apply for licenses, take practice exams, and navigate our website. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeContact, setActiveContact] = useState(0);
  const containerRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  const contactMethods = [
    {
      icon: faPhone,
      title: t("contactPage.callUs") || "Call Us",
      description:
        t("contactPage.callUsDesc") || "Speak directly with our support team",
      value: t("contactPage.phone") || "+251-11-123-4567",
      action: "tel:+251111234567",
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
      available: t("contactPage.available24") || "24/7 Available",
    },
    {
      icon: faEnvelope,
      title: t("contactPage.emailUs") || "Email Us",
      description: t("contactPage.emailUsDesc") || "Send us a detailed message",
      value: t("contactPage.emailAddress") || "support@drivinglicense.gov.et",
      action: "mailto:support@drivinglicense.gov.et",
      color: "#f093fb",
      gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
      available: t("contactPage.responseTime") || "Response within 2 hours",
    },
    {
      icon: faMapMarkerAlt,
      title: t("contactPage.visitUs") || "Visit Us",
      description:
        t("contactPage.visitUsDesc") || "Come to our office location",
      value:
        t("contactPage.address") ||
        "Ministry of Transport, Addis Ababa, Ethiopia",
      action: "#",
      color: "#4facfe",
      gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
      available: t("contactPage.officeHours") || "Mon-Fri 9AM-6PM",
    },
    {
      icon: faComments,
      title: t("contactPage.liveChat") || "Live Chat",
      description:
        t("contactPage.liveChatDesc") || "Get instant help from our team",
      value: t("contactPage.startChat") || "Start Chat",
      action: () => setIsChatOpen(true),
      color: "#43e97b",
      gradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
      available: t("contactPage.onlineNow") || "Online Now",
    },
  ];

  const socialLinks = [
    { icon: faFacebook, url: "#", color: "#1877f2" },
    { icon: faTwitter, url: "#", color: "#1da1f2" },
    { icon: faLinkedin, url: "#", color: "#0077b5" },
    { icon: faInstagram, url: "#", color: "#e4405f" },
  ];

  const features = [
    {
      icon: faRocket,
      title: t("contactPage.fastResponse") || "Fast Response",
      description:
        t("contactPage.fastResponseDesc") ||
        "Average response time under 2 hours",
    },
    {
      icon: faShieldAlt,
      title: t("contactPage.secureCommunication") || "Secure Communication",
      description:
        t("contactPage.secureCommunicationDesc") ||
        "Your data is protected with encryption",
    },
    {
      icon: faHeadset,
      title: t("contactPage.expertSupport") || "Expert Support",
      description:
        t("contactPage.expertSupportDesc") ||
        "Trained professionals ready to help",
    },
    {
      icon: faGlobe,
      title: t("contactPage.multiLanguage") || "Multi-language",
      description:
        t("contactPage.multiLanguageDesc") ||
        "Support available in multiple languages",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Validate form data
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.subject.trim() ||
        !formData.message.trim()
      ) {
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      // Send form data to backend
      const response = await axios.post(
        "http://localhost:5004/api/contact/submit",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          priority: formData.priority,
        }
      );

      if (response.data.success) {
        setIsSubmitting(false);
        setSubmitStatus("success");

        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          priority: "medium",
        });

        // Clear success message after 6 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 6000);
      } else {
        throw new Error(response.data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setIsSubmitting(false);

      // Set more specific error message based on error type
      if (error.response) {
        // Server responded with error status
        console.error("Server error:", error.response.data);
        setSubmitStatus("error");
      } else if (error.request) {
        // Request was made but no response received
        console.error("Network error:", error.request);
        setSubmitStatus("network_error");
      } else {
        // Something else happened
        console.error("Unexpected error:", error.message);
        setSubmitStatus("error");
      }

      // Clear error message after 7 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 7000);
    }
  };

  const handleChatSend = async () => {
    if (chatInput.trim() && !isChatLoading) {
      const userMessage = {
        id: Date.now(),
        text: chatInput.trim(),
        sender: "user",
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, userMessage]);
      const currentInput = chatInput.trim();
      setChatInput("");
      setIsChatLoading(true);

      try {
        // Get conversation history for context (last 10 messages)
        const conversationHistory = chatMessages.slice(-10).map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

        const response = await axios.post(
          "http://localhost:5004/api/chat/message",
          {
            message: currentInput,
            conversationHistory: conversationHistory,
          }
        );

        const botResponse = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: "bot",
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, botResponse]);
      } catch (error) {
        console.error("Chat error:", error);

        // Fallback response
        const fallbackResponse = {
          id: Date.now() + 1,
          text: "I'm sorry, I'm having trouble connecting right now. You can still reach our support team through the contact form above or call us directly. I'm here to help with questions about DLMS features like license applications, practice exams, and website navigation.",
          sender: "bot",
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, fallbackResponse]);
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  // Auto-scroll chat messages to bottom
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  // Auto-rotate contact methods
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveContact((prev) => (prev + 1) % contactMethods.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [contactMethods.length]);

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Hero Section */}
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
            <FontAwesomeIcon icon={faHeart} />
            <span>{t("contactPage.hereToHelp") || "We're Here to Help"}</span>
          </motion.div>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <span className={styles.titleGradient}>
              {t("contactPage.title") || "Contact Us"}
            </span>
            <br />
            <span className={styles.titleOutline}>
              {t("contactPage.withOurTeam") || "With Our Team"}
            </span>
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {t("contactPage.subtitle") ||
              "Get in touch with us for any inquiries about driving license services or technical support"}
          </motion.p>

          <motion.div
            className={styles.heroFeatures}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.heroFeature}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <FontAwesomeIcon icon={feature.icon} />
                <div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Methods Section */}
      <motion.div
        className={styles.contactMethodsSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className={styles.contactMethodsContainer}>
          <motion.div
            className={styles.contactMethodsHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Choose Your Preferred Way to Connect</h2>
            <p>Multiple ways to reach us for your convenience</p>
          </motion.div>

          <div className={styles.contactMethodsGrid}>
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                className={`${styles.contactMethodCard} ${
                  activeContact === index ? styles.active : ""
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                }}
                onClick={() => {
                  if (typeof method.action === "function") {
                    method.action();
                  } else {
                    window.open(method.action, "_blank");
                  }
                }}
                style={{
                  background:
                    activeContact === index ? method.gradient : undefined,
                }}
              >
                <motion.div
                  className={styles.contactMethodIcon}
                  style={{ color: method.color }}
                  animate={{
                    rotate: activeContact === index ? [0, 360] : 0,
                    scale: activeContact === index ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <FontAwesomeIcon icon={method.icon} />
                </motion.div>

                <h3
                  style={{
                    color: activeContact === index ? "#ffffff" : undefined,
                  }}
                >
                  {method.title}
                </h3>

                <p
                  style={{
                    color: activeContact === index ? "#ffffff" : undefined,
                  }}
                >
                  {method.description}
                </p>

                <div
                  className={styles.contactMethodValue}
                  style={{
                    color: activeContact === index ? "#ffffff" : undefined,
                  }}
                >
                  {method.value}
                </div>

                <div
                  className={styles.contactMethodAvailable}
                  style={{
                    color:
                      activeContact === index
                        ? "rgba(255,255,255,0.8)"
                        : undefined,
                  }}
                >
                  {method.available}
                </div>

                <motion.div
                  className={styles.contactMethodGlow}
                  style={{ background: method.gradient }}
                  animate={{
                    opacity: activeContact === index ? 0.2 : 0,
                    scale: activeContact === index ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Contact Form Section */}
      <motion.div
        className={styles.formSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            <motion.div
              className={styles.formHeader}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>{t("contactPage.sendMessage") || "Send Us a Message"}</h2>
              <p>
                {t("contactPage.formDescription") ||
                  "Fill out the form below and we'll get back to you as soon as possible"}
              </p>
            </motion.div>

            <motion.form
              className={styles.contactForm}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className={styles.formRow}>
                <motion.div
                  className={styles.formField}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <FontAwesomeIcon icon={faUser} className={styles.fieldIcon} />
                  <input
                    type="text"
                    name="name"
                    placeholder={
                      t("contactPage.namePlaceholder") || "Your Name"
                    }
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </motion.div>

                <motion.div
                  className={styles.formField}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className={styles.fieldIcon}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder={
                      t("contactPage.emailPlaceholder") || "Your Email"
                    }
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </motion.div>
              </div>

              <motion.div
                className={styles.formField}
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <FontAwesomeIcon icon={faTag} className={styles.fieldIcon} />
                <input
                  type="text"
                  name="subject"
                  placeholder={t("contactPage.subjectPlaceholder") || "Subject"}
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </motion.div>

              <motion.div
                className={styles.formField}
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className={styles.selectField}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </motion.div>

              <motion.div
                className={styles.formField}
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <textarea
                  name="message"
                  placeholder={
                    t("contactPage.messagePlaceholder") || "Your Message"
                  }
                  rows="6"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className={styles.spinner}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span>{t("contactPage.sending") || "Sending..."}</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>{t("contactPage.submit") || "Send Message"}</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          </div>

          <motion.div
            className={styles.formSidebar}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className={styles.sidebarCard}>
              <h3>Quick Info</h3>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <strong>Response Time</strong>
                  <p>Usually within 2 hours</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faShieldAlt} />
                <div>
                  <strong>Privacy</strong>
                  <p>Your data is secure with us</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faHeadset} />
                <div>
                  <strong>Support</strong>
                  <p>24/7 customer support</p>
                </div>
              </div>
            </div>

            <div className={styles.socialCard}>
              <h3>Follow Us</h3>
              <div className={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    className={styles.socialLink}
                    style={{ color: social.color }}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FontAwesomeIcon icon={social.icon} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {submitStatus && (
          <motion.div
            className={`${styles.statusMessage} ${
              submitStatus === "success" ? styles.success : styles.error
            }`}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <FontAwesomeIcon
              icon={
                submitStatus === "success"
                  ? faCheckCircle
                  : submitStatus === "network_error"
                  ? faWifi
                  : faExclamationTriangle
              }
            />
            <span>
              {submitStatus === "success"
                ? "Message sent successfully! Check your email for confirmation. We'll respond within 2-4 hours."
                : submitStatus === "network_error"
                ? "Network error: Please check your internet connection and try again."
                : "Failed to send message. Please check all fields and try again."}
            </span>
            <button onClick={() => setSubmitStatus(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat - fixed overlay via portal */}
      {isChatOpen &&
        createPortal(
          <motion.div
            key="contact-floating-chat"
            className={styles.floatingChat}
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              zIndex: 2147483647,
              pointerEvents: "auto",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.chatHeader}>
              <div className={styles.chatTitle}>
                <FontAwesomeIcon icon={faComments} />
                <span>DLMS AI Assistant</span>
              </div>
              <button
                className={styles.chatClose}
                onClick={() => setIsChatOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.chatMessages} ref={chatMessagesRef}>
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`${styles.chatMessage} ${
                    message.sender === "user"
                      ? styles.userMessage
                      : styles.botMessage
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={styles.messageContent}
                    dangerouslySetInnerHTML={{
                      __html: formatChatMessage(message.text),
                    }}
                  />
                  <div className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isChatLoading && (
                <motion.div
                  className={`${styles.chatMessage} ${styles.botMessage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className={styles.chatInput}>
              <input
                type="text"
                placeholder={
                  isChatLoading
                    ? "AI is typing..."
                    : "Ask me about DLMS features..."
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isChatLoading && handleChatSend()
                }
                disabled={isChatLoading}
              />
              <motion.button
                onClick={handleChatSend}
                disabled={isChatLoading || !chatInput.trim()}
                whileHover={!isChatLoading ? { scale: 1.05 } : {}}
                whileTap={!isChatLoading ? { scale: 0.95 } : {}}
                style={{
                  opacity: isChatLoading || !chatInput.trim() ? 0.6 : 1,
                  cursor:
                    isChatLoading || !chatInput.trim()
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </motion.button>
            </div>
          </motion.div>,
          document.body
        )}

      {/* Chat Toggle Button (BackToFirst style, fixed via portal) */}
      {createPortal(
        <div
          className={`${backToFirstStyles.backToTop} ${backToFirstStyles.show}`}
          onClick={() => setIsChatOpen(true)}
          aria-label="Open support chat"
          title="Support"
          role="button"
          style={{ zIndex: 2147483647 }}
        >
          <FontAwesomeIcon icon={faComments} size="lg" />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Contact;
