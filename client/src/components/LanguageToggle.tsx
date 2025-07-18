import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
    // TODO: Implement actual language switching logic
    console.log(`Language switched to: ${language === "en" ? "Hindi" : "English"}`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`flex items-center gap-2 ${className}`}
    >
      <Globe className="h-4 w-4" />
      {language === "en" ? "हिंदी" : "English"}
    </Button>
  );
}