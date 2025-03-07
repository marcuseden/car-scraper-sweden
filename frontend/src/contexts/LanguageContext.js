import React, { createContext, useState, useContext, useEffect } from 'react';
import enTranslations from '../translations/en';
import svTranslations from '../translations/sv';

// Define translations
export const translations = {
  en: enTranslations,
  sv: svTranslations
};

// Create the language context
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Get the initial language from localStorage or use browser language or default to English
  const getBrowserLanguage = () => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'sv' ? 'sv' : 'en';
  };

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || getBrowserLanguage();
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  // Function to toggle between languages
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'sv' : 'en');
  };

  // Translation function
  const t = (key) => {
    const translationSet = translations[language];
    if (!translationSet || !translationSet[key]) {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      // Fallback to English if key not found in current language
      return translations.en[key] || key;
    }
    return translationSet[key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 