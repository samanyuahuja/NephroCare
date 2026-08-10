import { useCallback, useSyncExternalStore } from "react";

type Language = "en" | "hi";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const getStoredLanguage = (): Language => {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("nephrocare-language") === "hi" ? "hi" : "en";
};

let globalLanguage: Language = getStoredLanguage();
const listeners: Set<() => void> = new Set();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

if (typeof document !== "undefined") {
  document.documentElement.lang = globalLanguage;
}

export const useLanguage = (): LanguageState => {
  const language = useSyncExternalStore<Language>(
    subscribe,
    () => globalLanguage,
    () => "en" as Language,
  );

  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === globalLanguage) return;
    globalLanguage = newLanguage;
    localStorage.setItem("nephrocare-language", newLanguage);
    document.documentElement.lang = newLanguage;
    listeners.forEach((listener) => listener());
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(globalLanguage === "en" ? "hi" : "en");
  }, [setLanguage]);

  return {
    language,
    setLanguage,
    toggleLanguage,
  };
};

export const t = (en: string, hi: string) => {
  return globalLanguage === "hi" ? hi : en;
};
