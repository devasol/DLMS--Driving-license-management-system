import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./Header.module.css";
import logo from "../../../assets/images/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket,
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import LanguageSwitcher from "../../LanguageSwitcher/LanguageSwitcher";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import axios from "axios";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  // Hide the top banner when the user scrolls down a bit
  const [hideBanner, setHideBanner] = useState(false);

  useEffect(() => {
    // Initialize hideBanner based on screen size and scroll position
    const checkScreenSizeAndScroll = () => {
      const isSmallScreen = window.innerWidth <= 768;
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      setHideBanner(isSmallScreen || scrolled > 20); // hide on small screens or after 20px scroll
    };

    // Set initial state based on screen size
    checkScreenSizeAndScroll();

    const onScroll = () => {
      const isSmallScreen = window.innerWidth <= 768;
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      setHideBanner(isSmallScreen || scrolled > 20); // hide on small screens or after 20px scroll
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Listen to resize events to handle screen size changes
    window.addEventListener('resize', checkScreenSizeAndScroll);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener('resize', checkScreenSizeAndScroll);
    };
  }, []);

  // Auto-close menu when resizing above mobile breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  // Lock body scroll and close menu with ESC when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKeyDown = (e) => {
        if (e.key === "Escape") setMenuOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow || "";
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [menuOpen]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserType = localStorage.getItem("userType");
    if (storedUserName) {
      setUserName(storedUserName);
      setIsAdmin(storedUserType === "admin");
      fetchNotifications();

      // Set up periodic refresh for notifications
      const notificationInterval = setInterval(() => {
        fetchNotifications();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(notificationInterval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token"); // Fixed: changed from "userToken" to "token"

      if (userId && token) {
        const response = await axios.get(`/api/notifications/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data || []);
        const unread = (response.data || []).filter((n) => !n.seen).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowDropdown(false);
    // Refresh notifications when opening dropdown
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const handleDashboardClick = () => {
    setShowDropdown(false);
    navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
  };

  // Open the logout confirmation modal
  const handleLogout = () => {
    setShowDropdown(false);
    setShowLogoutModal(true);
  };

  const getInitial = (name) => {
    return name && typeof name === "string"
      ? name.charAt(0).toUpperCase()
      : "U";
  };

  // ...existing code...

  const confirmLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("token"); // Fixed: changed from "userToken" to "token"
    localStorage.removeItem("userRole");
    localStorage.removeItem("userType");
    setUserName("");
    setIsAdmin(false);
    setShowDropdown(false);
    setShowNotifications(false);
    setNotifications([]);
    setUnreadCount(0);
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    console.log("Logout cancelled");
    setShowLogoutModal(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      cancelLogout();
    }
  };

  const markNotificationAsSeen = async (notificationId) => {
    try {
      const token = localStorage.getItem("token"); // Fixed: changed from "userToken" to "token"
      await axios.patch(
        `/api/notifications/${notificationId}/seen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const headerMarkup = (
    <div
      className={`${styles.header_container} ${
        hideBanner ? styles.headerCollapsed : ""
      }`}
    >
      {/* Top Banner */}
      <div
        className={`${styles.topBanner} ${
          hideBanner ? styles.bannerHidden : ""
        }`}
      >
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <span className={styles.bannerIcon}>🚗</span>
            <span className={styles.bannerMessage}>
              {t("header.banner") ||
                "Get Your Driving License Online - Fast, Secure & Convenient"}
            </span>
            <span className={styles.bannerIcon}>✨</span>
          </div>
          <div className={styles.bannerCTA}>
            <span className={styles.bannerHighlight}>Start Today!</span>
          </div>
        </div>
        <div className={styles.bannerAnimation}></div>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <NavLink to="/">
          <div className={styles.logo_container}>
            <img src={logo} alt="logo of the website." />
            <span className={styles.name_of_logo}>{t("header.siteName")}</span>
          </div>
        </NavLink>

        <div className={styles.navigationDesktop}>
          <div
            id="primary-navigation"
            role="navigation"
            aria-label="Primary"
            className={`${styles.links} ${menuOpen ? styles.show : ""}`}
          >
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              {t("nav.home") || "HOME"}
            </NavLink>
            <NavLink
              to="/services"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              {t("nav.services") || "SERVICES"}
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              {t("nav.about") || "ABOUT"}
            </NavLink>
            <NavLink
              to="/news"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              {t("nav.news") || "NEWS"}
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              {t("nav.contact") || "CONTACT"}
            </NavLink>
          </div>
        </div>

        <div className={styles.right_section}>
          {/* Desktop components - hidden on mobile */}
          <div className={styles.desktopComponents}>
            <LanguageSwitcher />
            <ThemeToggle />
            <SearchBar />
          </div>
          
          {/* User section for desktop - hidden on mobile */}
          <div className={styles.desktopUserSection}>
            {!userName ? (
              <NavLink to="/signin">
                <button className={styles.login}>
                  {t("nav.login") || "LOGIN"}{" "}
                  <FontAwesomeIcon icon={faRightToBracket} />
                </button>
              </NavLink>
            ) : (
              <div className={styles.userSection}>
                {/* Notification Bell */}
                <div className={styles.notificationSection}>
                  <button
                    className={styles.notificationBell}
                    onClick={toggleNotifications}
                    title="Notifications"
                  >
                    <FontAwesomeIcon icon={faBell} />
                    {unreadCount > 0 && (
                      <span className={styles.notificationBadge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className={styles.notificationDropdown}>
                      <div className={styles.notificationHeader}>
                        <h4>Notifications</h4>
                        <span className={styles.notificationCount}>
                          {unreadCount} unread
                        </span>
                      </div>
                      <div className={styles.notificationList}>
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification._id}
                              className={`${styles.notificationItem} ${
                                !notification.seen ? styles.unread : ""
                              }`}
                              onClick={() =>
                                markNotificationAsSeen(notification._id)
                              }
                            >
                              <div className={styles.notificationContent}>
                                <h5>{notification.title}</h5>
                                <p>{notification.message.substring(0, 80)}...</p>
                                <span className={styles.notificationDate}>
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.noNotifications}>
                            <p>No notifications</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 5 && (
                        <div className={styles.notificationFooter}>
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              navigate("/dashboard");
                            }}
                            className={styles.viewAllButton}
                          >
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Section */}
                <div className={styles.profileSection}>
                  <div className={styles.profileCircle} onClick={toggleDropdown}>
                    {getInitial(userName)}
                  </div>
                  {showDropdown && (
                    <div className={styles.dropdown}>
                      <button
                        onClick={handleDashboardClick}
                        className={styles.dropdownItem}
                      >
                        <FontAwesomeIcon icon={faUser} /> {t("nav.dashboard")}
                      </button>
                      <button
                        onClick={handleLogout}
                        className={styles.dropdownItem}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} /> {t("nav.logout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu icon - visible on mobile */}
          <button
            className={styles.menu_icon}
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Mobile Menu Overlay - Fixed Structure */}
        {menuOpen && (
          <>
            <div 
              className={styles.mobileBackdrop}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className={styles.mobileMenuOverlay}>
              <div className={styles.mobileMenuContent}>
                {/* Mobile Menu Header */}
                <div className={styles.mobileMenuHeader}>
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                
                {/* Search Bar */}
                <div className={styles.mobileSearchSection}>
                  <SearchBar />
                </div>
                
                {/* Navigation Links */}
                <div className={styles.mobileNavLinks}>
                  <NavLink
                    to="/"
                    end
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? styles.active : "")}
                  >
                    {t("nav.home") || "HOME"}
                  </NavLink>
                  <NavLink
                    to="/services"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? styles.active : "")}
                  >
                    {t("nav.services") || "SERVICES"}
                  </NavLink>
                  <NavLink
                    to="/about"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? styles.active : "")}
                  >
                    {t("nav.about") || "ABOUT"}
                  </NavLink>
                  <NavLink
                    to="/news"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? styles.active : "")}
                  >
                    {t("nav.news") || "NEWS"}
                  </NavLink>
                  <NavLink
                    to="/contact"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? styles.active : "")}
                  >
                    {t("nav.contact") || "CONTACT"}
                  </NavLink>
                </div>
                
                {/* User Section - Login or User Profile */}
                <div className={styles.mobileUserSection}>
                  {!userName ? (
                    <NavLink to="/signin" onClick={() => setMenuOpen(false)}>
                      <button className={styles.login}>
                        {t("nav.login") || "LOGIN"}{" "}
                        <FontAwesomeIcon icon={faRightToBracket} />
                      </button>
                    </NavLink>
                  ) : (
                    <div className={styles.mobileUserProfile}>
                      {/* Notification Bell */}
                      <div className={styles.notificationSection}>
                        <button
                          className={styles.notificationBell}
                          onClick={toggleNotifications}
                          title="Notifications"
                        >
                          <FontAwesomeIcon icon={faBell} />
                          {unreadCount > 0 && (
                            <span className={styles.notificationBadge}>
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </button>

                        {/* Notification Dropdown - in mobile menu */}
                        {showNotifications && (
                          <div className={styles.notificationDropdown}>
                            <div className={styles.notificationHeader}>
                              <h4>Notifications</h4>
                              <span className={styles.notificationCount}>
                                {unreadCount} unread
                              </span>
                            </div>
                            <div className={styles.notificationList}>
                              {notifications.length > 0 ? (
                                notifications.slice(0, 5).map((notification) => (
                                  <div
                                    key={notification._id}
                                    className={`${styles.notificationItem} ${
                                      !notification.seen ? styles.unread : ""
                                    }`}
                                    onClick={() =>
                                      markNotificationAsSeen(notification._id)
                                    }
                                  >
                                    <div className={styles.notificationContent}>
                                      <h5>{notification.title}</h5>
                                      <p>{notification.message.substring(0, 80)}...</p>
                                      <span className={styles.notificationDate}>
                                        {formatDate(notification.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className={styles.noNotifications}>
                                  <p>No notifications</p>
                                </div>
                              )}
                            </div>
                            {notifications.length > 5 && (
                              <div className={styles.notificationFooter}>
                                <button
                                  onClick={() => {
                                    setShowNotifications(false);
                                    navigate("/dashboard");
                                    setMenuOpen(false); // Close menu when going to dashboard
                                  }}
                                  className={styles.viewAllButton}
                                >
                                  View All Notifications
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Profile Section */}
                      <div className={styles.profileSection}>
                        <div className={styles.profileCircle} onClick={toggleDropdown}>
                          {getInitial(userName)}
                        </div>
                        {showDropdown && (
                          <div className={styles.dropdown}>
                            <button
                              onClick={() => {
                                handleDashboardClick();
                                setMenuOpen(false); // Close mobile menu
                              }}
                              className={styles.dropdownItem}
                            >
                              <FontAwesomeIcon icon={faUser} /> {t("nav.dashboard")}
                            </button>
                            <button
                              onClick={() => {
                                handleLogout();
                                setMenuOpen(false); // Close mobile menu
                              }}
                              className={styles.dropdownItem}
                            >
                              <FontAwesomeIcon icon={faSignOutAlt} /> {t("nav.logout")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Backdrop */}
      {menuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className={styles.modalButtons}>
              <button onClick={confirmLogout} className={styles.confirmButton}>
                Yes, Logout
              </button>
              <button onClick={cancelLogout} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Add spacing to the body to account for the fixed header
  useEffect(() => {
    const updateBodyPadding = () => {
      if (document.body) {
        // Calculate header height based on actual visible elements
        let headerHeight = 0;
        
        // On mobile screens, banner is hidden by default
        if (window.innerWidth <= 768) {
          // Mobile calculations - banner is hidden by default on mobile
          headerHeight = 60; // 60px mobile main header
        } else {
          // Desktop calculations
          if (!hideBanner) {
            // Desktop with banner visible: banner height + main header height
            headerHeight = 56 + 80; // 56px banner + 80px desktop main header
          } else {
            // Desktop with banner hidden: just main header height
            headerHeight = 72; // 72px collapsed main header
          }
        }
        
        document.body.style.paddingTop = `${headerHeight}px`;
        document.body.style.boxSizing = 'border-box';
      }
    };

    // Initial update
    updateBodyPadding();

    // Update on window resize
    window.addEventListener('resize', updateBodyPadding);
    
    // Update when hideBanner state changes
    const timer = setTimeout(updateBodyPadding, 0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateBodyPadding);
      clearTimeout(timer);
      if (document.body) {
        document.body.style.paddingTop = '';
        document.body.style.boxSizing = '';
      }
    };
  }, [hideBanner]);

  return createPortal(headerMarkup, document.body);
};

export default Header;
