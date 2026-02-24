'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('es');

  useEffect(() => {
    const saved = localStorage.getItem('rf-lang');
    if (saved && translations[saved]) {
      setLang(saved);
    }
  }, []);

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('rf-lang', newLang);
  };

  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
