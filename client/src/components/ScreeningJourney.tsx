import { motion, useReducedMotion } from "framer-motion";
import { t } from "@/hooks/useLanguage";

const reportRows = [
  ["Serum creatinine", "सीरम क्रिएटिनिन", "1.2 mg/dL"],
  ["Blood pressure", "रक्तचाप", "128 / 82"],
  ["Blood urea", "ब्लड यूरिया", "32 mg/dL"],
  ["Symptoms noted", "दर्ज लक्षण", "2"],
];

export default function ScreeningJourney() {
  const reduceMotion = useReducedMotion();

  return (
    <figure className="clinical-preview" aria-label={t("Example of a NephroCare screening summary", "नेफ्रोकेयर स्क्रीनिंग सारांश का उदाहरण")}>
      <figcaption className="clinical-preview__caption">
        <span>{t("Illustrative assessment", "उदाहरण मूल्यांकन")}</span>
        <span>NC / 042</span>
      </figcaption>

      <div className="clinical-preview__heading">
        <p>{t("Preliminary review", "प्रारंभिक समीक्षा")}</p>
        <strong>{t("Inputs organised for discussion", "चर्चा के लिए जानकारी व्यवस्थित")}</strong>
      </div>

      <dl className="clinical-preview__rows">
        {reportRows.map(([label, labelHi, value], index) => (
          <motion.div
            key={label}
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + index * 0.08, duration: 0.4 }}
          >
            <dt>{t(label, labelHi)}</dt>
            <dd>{value}</dd>
          </motion.div>
        ))}
      </dl>

      <div className="clinical-preview__trace" aria-hidden="true">
        <span>0</span>
        <svg viewBox="0 0 420 94" preserveAspectRatio="none">
          <path className="trace-grid" d="M0 20H420 M0 47H420 M0 74H420" />
          <motion.path
            className="trace-line"
            d="M0 70 C45 68 65 52 104 54 S166 61 201 39 S272 30 308 42 S371 42 420 17"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.28, duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span>100</span>
      </div>

      <div className="clinical-preview__note">
        <span>{t("Next step", "अगला कदम")}</span>
        <p>{t("Review the complete report with a qualified clinician.", "पूरी रिपोर्ट की समीक्षा योग्य चिकित्सक के साथ करें।")}</p>
      </div>
    </figure>
  );
}
