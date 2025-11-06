'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageContextType, Translations } from '@/types';
import { translations } from '@/i18n/translations';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Lataa kieli LocalStoragesta vain jos selaimessa
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language | null;
      if (savedLanguage && (savedLanguage === 'fi' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t: Translations = translations[language];

  // Renderöi aina, älä estä hydraatiota
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

