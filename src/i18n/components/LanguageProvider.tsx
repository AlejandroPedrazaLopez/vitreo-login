import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../config';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  useEffect(() => {
    // Initialize language from localStorage or browser settings
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      i18n.changeLanguage(savedLanguage);
    } else {
      // Get browser language
      const browserLang = navigator.language.split('-')[0];
      const language = browserLang === 'es' ? 'es' : 'en';
      i18n.changeLanguage(language);
      localStorage.setItem('i18nextLng', language);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export default LanguageProvider; 