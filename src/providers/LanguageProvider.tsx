'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

const LanguageContext = createContext({
  language: 'en',
  changeLanguage: (lang: string) => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Initialize language from localStorage or browser settings
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      i18n.changeLanguage(savedLanguage);
      setLanguage(savedLanguage);
    } else {
      // Get browser language
      const browserLang = navigator.language.split('-')[0];
      const language = browserLang === 'es' ? 'es' : 'en';
      i18n.changeLanguage(language);
      setLanguage(language);
      localStorage.setItem('i18nextLng', language);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  );
};