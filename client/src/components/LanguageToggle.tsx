import { useLanguage } from "@/hooks/useLanguage";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
      className={`language-toggle ${className}`}
    >
      <span className={language === "en" ? "is-current" : ""}>EN</span>
      <i aria-hidden="true" />
      <span className={language === "hi" ? "is-current" : ""}>हिं</span>
    </button>
  );
}
