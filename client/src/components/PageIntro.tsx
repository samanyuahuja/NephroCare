import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export default function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className = "",
}: PageIntroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <header className={`page-intro ${aside ? "page-intro--split" : ""} ${className}`}>
      <motion.div
        className="page-intro__copy"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
      >
        <p className="section-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro__description">{description}</p>
        {actions && <div className="page-intro__actions">{actions}</div>}
      </motion.div>
      {aside && <div className="page-intro__aside">{aside}</div>}
    </header>
  );
}
