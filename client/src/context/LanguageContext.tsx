import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/lib/i18n';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get saved language preference or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });

  // Import translations dynamically
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language;
    
    // Update body font family based on language
    if (language === 'hi') {
      document.body.classList.add('font-hindi');
      document.body.classList.remove('font-roboto');
    } else {
      document.body.classList.add('font-roboto');
      document.body.classList.remove('font-hindi');
    }

    // Save language preference
    localStorage.setItem('language', language);

    // Load translations
    import('@shared/i18n/translations').then(module => {
      setTranslations(module.translations[language]);
    });
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
