import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
      className={`language-toggle ${className}`}
    >
      <Globe className="h-4 w-4" />
      {language === "en" ? "हिंदी" : "English"}
    </Button>
  );
}
