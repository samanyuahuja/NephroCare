import { Link, useLocation } from "wouter";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LanguageToggle from "@/components/LanguageToggle";
import SiteMotion from "@/components/SiteMotion";
import { useLanguage, t } from "@/hooks/useLanguage";

interface LayoutProps {
  children: React.ReactNode;
}

const primaryNav = [
  { href: "/", label: ["Home", "होम"] },
  { href: "/diagnosis", label: ["Assessment", "मूल्यांकन"] },
  { href: "/browse", label: ["My reports", "मेरी रिपोर्ट"] },
  { href: "/symptom-checker", label: ["Symptoms", "लक्षण"] },
  { href: "/chatbot", label: ["Ask NephroBot", "नेफ्रोबॉट से पूछें"] },
  { href: "/about-ckd", label: ["CKD guide", "सीकेडी गाइड"] },
];

const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/medical-disclaimer", label: "Medical disclaimer" },
  { href: "/accessibility", label: "Accessibility" },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteMotion routeKey={location} />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <div className="service-notice">
        <div className="service-shell service-notice__inner">
          <span>{t("Kidney health information and preliminary screening", "किडनी स्वास्थ्य जानकारी और प्रारंभिक स्क्रीनिंग")}</span>
          <Link href="/medical-disclaimer">{t("Not a diagnosis", "यह निदान नहीं है")}</Link>
        </div>
      </div>

      <header className="site-header">
        <div className="service-shell site-header__inner">
          <Link href="/" className="wordmark" aria-label="NephroCare home">
            <Activity aria-hidden="true" />
            <span>NephroCare</span>
          </Link>

          <nav className="primary-nav" aria-label="Primary navigation">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "is-active" : ""}
              >
                {t(item.label[0], item.label[1])}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <div className="site-language"><LanguageToggle /></div>
            <button
              className="menu-button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-navigation"
              className="mobile-nav"
              aria-label="Mobile navigation"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="service-shell mobile-nav__inner">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive(item.href) ? "is-active" : ""}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(item.label[0], item.label[1])}
                  </Link>
                ))}
                <div className="mobile-nav__language"><LanguageToggle /></div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main-content"
          key={location}
          className="service-shell site-main"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <footer className="site-footer">
        <div className="service-shell">
          <div className="site-footer__top">
            <div className="site-footer__identity">
              <Link href="/" className="wordmark wordmark--footer">
                <Activity aria-hidden="true" />
                <span>NephroCare</span>
              </Link>
              <p>{t("A student-built kidney health awareness service.", "छात्र द्वारा निर्मित किडनी स्वास्थ्य जागरूकता सेवा।")}</p>
            </div>

            <div className="site-footer__directory">
              <div>
                <h2>{t("Use NephroCare", "नेफ्रोकेयर का उपयोग करें")}</h2>
                <Link href="/diagnosis">{t("Start an assessment", "मूल्यांकन शुरू करें")}</Link>
                <Link href="/symptom-checker">{t("Check symptoms", "लक्षण जांचें")}</Link>
                <Link href="/browse">{t("View my reports", "मेरी रिपोर्ट देखें")}</Link>
              </div>
              <div>
                <h2>{t("Information", "जानकारी")}</h2>
                <Link href="/about">{t("About the project", "परियोजना के बारे में")}</Link>
                <Link href="/about-ckd">{t("CKD guide", "सीकेडी गाइड")}</Link>
                <a href="mailto:nephrocareai@gmail.com">Contact</a>
              </div>
              <div>
                <h2>{t("Trust and safety", "विश्वास और सुरक्षा")}</h2>
                {legalNav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
              </div>
            </div>
          </div>

          <div className="site-footer__bottom">
            <p>© 2026 NephroCare. Built by Samanyu Ahuja.</p>
            <p>For awareness only. Seek qualified medical care for diagnosis and treatment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
