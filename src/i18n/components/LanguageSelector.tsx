import { useTranslation } from '../../hooks/useTranslation';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
] as const;

export function LanguageSelector() {
  const { getCurrentLanguage, changeLanguage } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = (lang: 'en' | 'es') => {
    changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentLanguage === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector; 