import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  const handleToggle = () => {
    toggleLanguage();
    console.log(`Language switched to: ${language === "en" ? "Hindi" : "English"}`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`flex items-center gap-2 ${className}`}
    >
      <Globe className="h-4 w-4" />
      {language === "en" ? "हिंदी" : "English"}
    </Button>
  );
}