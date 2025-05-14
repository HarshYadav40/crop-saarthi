
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '@/lib/translations';

type LanguageCode = 'en' | 'hi';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  changeLanguage: (code: LanguageCode) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  const changeLanguage = (code: LanguageCode) => {
    setCurrentLanguage(code);
    localStorage.setItem('preferredLanguage', code);
  };

  // Use the translations for the current language
  const t = translations[currentLanguage];

  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as LanguageCode;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
