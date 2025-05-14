
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' }
  ];

  return (
    <div className="language-switch">
      <div className="flex gap-1">
        {languages.map(lang => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "default" : "outline"}
            size="sm"
            onClick={() => changeLanguage(lang.code as 'en' | 'hi')}
            className="text-sm py-1 px-3"
          >
            {lang.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
