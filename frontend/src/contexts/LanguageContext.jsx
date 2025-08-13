import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();
const ThemeContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('dlms-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Apply theme to document and save preference
  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dlms-theme', theme);

    // Update CSS custom properties
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--bg-primary', '#0f0f23');
      root.style.setProperty('--bg-secondary', '#1a1a2e');
      root.style.setProperty('--bg-tertiary', '#16213e');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b8b8b8');
      root.style.setProperty('--text-tertiary', '#888888');
      root.style.setProperty('--border-color', '#333333');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--card-bg', '#1e1e2f');
      root.style.setProperty('--hover-bg', '#2a2a3e');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#1a202c');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--text-tertiary', '#718096');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--hover-bg', '#f7fafc');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeValue = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('dlms-language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'am')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('dlms-language', currentLanguage);
    // Update document direction for Amharic (if needed)
    document.documentElement.dir = currentLanguage === 'am' ? 'ltr' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const changeLanguage = (language) => {
    if (language === 'en' || language === 'am') {
      setCurrentLanguage(language);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }

    return value || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isAmharic: currentLanguage === 'am',
    isEnglish: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
