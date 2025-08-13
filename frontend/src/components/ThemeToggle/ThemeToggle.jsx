import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/LanguageContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      className={styles.themeToggle}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={styles.iconContainer}
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <FontAwesomeIcon 
          icon={isDarkMode ? faSun : faMoon} 
          className={styles.icon}
        />
      </motion.div>
      <span className={styles.tooltip}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </span>
    </motion.button>
  );
};

export default ThemeToggle;
