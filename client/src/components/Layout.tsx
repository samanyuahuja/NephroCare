import { Link, useLocation } from "wouter";
import { Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage, t } from "@/hooks/useLanguage";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const navItems = [
    { href: "/", label: t("Home", "होम") },
    { href: "/diagnosis", label: t("Assessment", "मूल्यांकन") },
    { href: "/browse", label: t("Browse", "ब्राउज़") },
    { href: "/history", label: t("History", "इतिहास") },
    { href: "/symptom-checker", label: t("Symptoms", "लक्षण") },
    { href: "/chatbot", label: t("NephroBot", "नेफ्रोबॉट") },
    { href: "/about", label: t("About", "के बारे में") },
    { href: "/about-ckd", label: t("About CKD", "सीकेडी के बारे में") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">NephroCare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-4 border-l border-gray-300 mx-2"></div>
              <LanguageToggle />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex items-center space-x-3 mb-8">
                    <Activity className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">NephroCare</span>
                  </div>
                  <nav className="space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          location === item.href
                            ? "text-primary bg-blue-50"
                            : "text-gray-600 hover:text-primary"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="pt-4 border-t border-gray-200">
                      <LanguageToggle />
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-white">NephroCare</span>
              </div>
              <p className="text-gray-400">
                {t(
                  "Professional kidney health prediction and personalized care solutions.",
                  "पेशेवर गुर्दे के स्वास्थ्य की भविष्यवाणी और व्यक्तिगत देखभाल समाधान।"
                )}
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t("Quick Links", "त्वरित लिंक")}</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t("Features", "विशेषताएं")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("ML-powered Prediction", "एमएल-संचालित भविष्यवाणी")}</li>
                <li>{t("Personalized Diet Plans", "व्यक्तिगत आहार योजना")}</li>
                <li>{t("Risk Assessment", "जोखिम मूल्यांकन")}</li>
                <li>{t("Symptom Checker", "लक्षण चेकर")}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t("Support", "सहायता")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("Medical Guidance", "चिकित्सा मार्गदर्शन")}</li>
                <li>{t("Health Resources", "स्वास्थ्य संसाधन")}</li>
                <li>{t("Early Detection", "शीघ्र निदान")}</li>
                <li>{t("Treatment Support", "उपचार सहायता")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 NephroCare. Built by Samanyu Ahuja for kidney health awareness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}