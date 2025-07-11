import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dictionary from './index';

const resources = {
  en: {
    translation: dictionary.en,
  },
  es: {
    translation: dictionary.es,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // default language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    // Additional configuration for better performance and usability
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false, // Disable Suspense
    },
    returnNull: false, // Return key instead of null when translation is missing
    returnEmptyString: false, // Return key instead of empty string when translation is missing
    keySeparator: '.', // Allow nested translations using dot notation
  });

export default i18n;