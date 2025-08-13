import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.langButton} ${currentLanguage === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
        title="Switch to English"
      >
        EN
      </button>
      <button
        className={`${styles.langButton} ${currentLanguage === 'am' ? styles.active : ''}`}
        onClick={() => changeLanguage('am')}
        title="ወደ አማርኛ ቀይር"
      >
        አማ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
