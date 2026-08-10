import { Activity, Check, FileText, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { t } from "@/hooks/useLanguage";

const inputs = [
  { label: ["Medical report", "मेडिकल रिपोर्ट"], width: "82%" },
  { label: ["Health history", "स्वास्थ्य इतिहास"], width: "68%" },
  { label: ["Current symptoms", "वर्तमान लक्षण"], width: "54%" },
];

export default function ScreeningJourney() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 };

  return (
    <motion.div
      className="screening-journey"
      initial={initial}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label={t(
        "Medical report, health history, and symptoms moving through the NephroCare screening process into a review-ready summary.",
        "मेडिकल रिपोर्ट, स्वास्थ्य इतिहास और लक्षण नेफ्रोकेयर स्क्रीनिंग प्रक्रिया से होकर समीक्षा के लिए तैयार सारांश बनते हैं।"
      )}
    >
      <div className="screening-journey__header">
        <div>
          <span>{t("Screening flow", "स्क्रीनिंग प्रक्रिया")}</span>
          <strong>{t("Information review", "जानकारी की समीक्षा")}</strong>
        </div>
        <Activity aria-hidden="true" />
      </div>

      <div className="screening-journey__inputs" aria-hidden="true">
        {inputs.map((input, index) => (
          <motion.div
            className="screening-input"
            key={input.label[0]}
            initial={reduceMotion ? false : { opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.38 + index * 0.12 }}
          >
            <FileText />
            <div>
              <span>{t(input.label[0], input.label[1])}</span>
              <i>
                <motion.b
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.65, delay: 0.56 + index * 0.12 }}
                  style={{ width: input.width }}
                />
              </i>
            </div>
            <Check />
          </motion.div>
        ))}
      </div>

      <div className="screening-journey__path" aria-hidden="true">
        <svg viewBox="0 0 320 42" preserveAspectRatio="none">
          <path className="screening-path__track" d="M4 21 C74 21 83 7 145 21 S241 35 316 21" />
          <motion.path
            className="screening-path__active"
            d="M4 21 C74 21 83 7 145 21 S241 35 316 21"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.25, delay: 0.75, ease: "easeInOut" }}
          />
        </svg>
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 1.45 }}
        >
          <ShieldCheck />
        </motion.span>
      </div>

      <motion.div
        className="screening-summary"
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.25 }}
      >
        <div>
          <span>{t("Screening summary", "स्क्रीनिंग सारांश")}</span>
          <strong>{t("Ready for review", "समीक्षा के लिए तैयार")}</strong>
        </div>
        <div className="screening-summary__status">
          <i />
          {t("Complete", "पूर्ण")}
        </div>
      </motion.div>
    </motion.div>
  );
}
