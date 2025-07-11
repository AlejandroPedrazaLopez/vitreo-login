import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TFunction } from '../i18n/types';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = async (lang: 'en' | 'es') => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const getCurrentLanguage = () => i18n.language;

  return {
    t: t as TFunction,
    i18n,
    changeLanguage,
    getCurrentLanguage,
  };
} 

export default useTranslation;