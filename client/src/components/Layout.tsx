import { useState } from "react";
import { Activity, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { t } from "@/hooks/useLanguage";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("Overview", "अवलोकन") },
    { href: "/diagnosis", label: t("Assessment", "मूल्यांकन") },
    { href: "/symptom-checker", label: t("Symptoms", "लक्षण") },
    { href: "/browse", label: t("Reports", "रिपोर्ट") },
    { href: "/chatbot", label: t("NephroBot", "नेफ्रोबॉट") },
    { href: "/about-ckd", label: t("CKD guide", "सीकेडी गाइड") },
    { href: "/about", label: t("About", "परिचय") },
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-brand" aria-label="NephroCare home">
            <Activity aria-hidden="true" />
            <span>NephroCare</span>
          </Link>

          <nav className="site-nav" aria-label={t("Primary navigation", "मुख्य नेविगेशन")}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={location === item.href ? "is-active" : ""}
                aria-current={location === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <span className="site-status"><i />{t("Screening tool", "स्क्रीनिंग टूल")}</span>
            <LanguageToggle />
            <div className="site-mobile-menu">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("Open navigation", "नेविगेशन खोलें")}>
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="site-mobile-panel">
                  <div className="site-brand site-brand--panel">
                    <Activity aria-hidden="true" />
                    <span>NephroCare</span>
                  </div>
                  <nav aria-label={t("Mobile navigation", "मोबाइल नेविगेशन")}>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={location === item.href ? "is-active" : ""}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <LanguageToggle className="site-mobile-language" />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className={location === "/" ? "site-main site-main--home" : "site-main"}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <div className="site-brand site-brand--footer">
              <Activity aria-hidden="true" />
              <span>NephroCare</span>
            </div>
            <p>{t("Kidney health screening and education.", "किडनी स्वास्थ्य स्क्रीनिंग और शिक्षा।")}</p>
          </div>
          <div className="site-footer__links">
            <Link href="/diagnosis">{t("Start assessment", "मूल्यांकन शुरू करें")}</Link>
            <Link href="/about-ckd">{t("Read the CKD guide", "सीकेडी गाइड पढ़ें")}</Link>
            <a href="mailto:nephrocareai@gmail.com">nephrocareai@gmail.com</a>
          </div>
          <div className="site-footer__disclaimer">
            <strong>{t("Medical notice", "चिकित्सा सूचना")}</strong>
            <p>{t("This platform supports education and preliminary screening. It is not a substitute for professional medical advice, diagnosis, or treatment.", "यह प्लेटफॉर्म शिक्षा और प्रारंभिक स्क्रीनिंग में सहायता करता है। यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है।")}</p>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© 2026 NephroCare</span>
          <span>{t("Built by Samanyu Ahuja", "समन्यु अहुजा द्वारा निर्मित")}</span>
        </div>
      </footer>
    </div>
  );
}
