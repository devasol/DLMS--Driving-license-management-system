import { FaArrowUp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./BackToFirst.module.css";
import { useLocation, NavLink } from "react-router-dom";

const BackToFirst = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 300);
  };

  useEffect(() => {
    // Initialize visibility on mount
    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content =
    location.pathname !== "/" ? (
      <NavLink to="/">
        <div
          className={`${styles.backToTop} ${isVisible ? styles.show : ""}`}
          aria-label="Back to Home"
          title="Back to Home"
        >
          <FaArrowUp size={30} />
        </div>
      </NavLink>
    ) : (
      <div
        className={`${styles.backToTop} ${isVisible ? styles.show : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <FaArrowUp size={30} />
      </div>
    );

  return createPortal(content, document.body);
};

export default BackToFirst;
