import { useState, useEffect } from 'react';

interface LanguageState {
  language: 'en' | 'hi';
  setLanguage: (language: 'en' | 'hi') => void;
  toggleLanguage: () => void;
}

// Simple language state management without external dependencies
let globalLanguage: 'en' | 'hi' = 'en';
const listeners: Set<() => void> = new Set();

export const useLanguage = (): LanguageState => {
  const [language, setLocalLanguage] = useState(globalLanguage);

  useEffect(() => {
    const updateLanguage = () => setLocalLanguage(globalLanguage);
    listeners.add(updateLanguage);
    return () => {
      listeners.delete(updateLanguage);
    };
  }, []);

  const setLanguage = (newLanguage: 'en' | 'hi') => {
    globalLanguage = newLanguage;
    localStorage.setItem('nephrocare-language', newLanguage);
    listeners.forEach(listener => listener());
  };

  const toggleLanguage = () => {
    setLanguage(globalLanguage === 'en' ? 'hi' : 'en');
  };

  // Initialize from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem('nephrocare-language') as 'en' | 'hi';
    if (stored && stored !== globalLanguage) {
      setLanguage(stored);
    }
  }, []);

  return {
    language,
    setLanguage,
    toggleLanguage,
  };
};

// Translation helper
export const t = (en: string, hi: string) => {
  return globalLanguage === 'hi' ? hi : en;
};