import { Link } from "wouter";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorEndorsement from "@/components/DoctorEndorsement";
import ScreeningJourney from "@/components/ScreeningJourney";
import { t, useLanguage } from "@/hooks/useLanguage";

const pathways = [
  {
    number: "01",
    href: "/diagnosis",
    label: ["Screening", "स्क्रीनिंग"],
    title: ["CKD risk assessment", "सीकेडी जोखिम मूल्यांकन"],
    copy: [
      "Turn recent laboratory values and health history into a structured preliminary report.",
      "हाल के लैब मान और स्वास्थ्य इतिहास को एक व्यवस्थित प्रारंभिक रिपोर्ट में बदलें।",
    ],
    action: ["Start assessment", "मूल्यांकन शुरू करें"],
  },
  {
    number: "02",
    href: "/symptom-checker",
    label: ["Triage", "प्राथमिकता"],
    title: ["Symptom review", "लक्षण समीक्षा"],
    copy: [
      "Review warning signs by urgency and prepare clearer questions for a clinician.",
      "चेतावनी संकेतों को उनकी गंभीरता के अनुसार देखें और चिकित्सक के लिए स्पष्ट प्रश्न तैयार करें।",
    ],
    action: ["Review symptoms", "लक्षण देखें"],
  },
  {
    number: "03",
    href: "/browse",
    label: ["Records", "रिकॉर्ड"],
    title: ["My reports", "मेरी रिपोर्ट"],
    copy: [
      "Return to assessments and diet guidance linked to this browser.",
      "इस ब्राउज़र से जुड़े मूल्यांकन और आहार मार्गदर्शन पर वापस जाएं।",
    ],
    action: ["Open reports", "रिपोर्ट खोलें"],
  },
  {
    number: "04",
    href: "/chatbot",
    label: ["Questions", "प्रश्न"],
    title: ["Ask NephroBot", "नेफ्रोबॉट से पूछें"],
    copy: [
      "Ask a kidney-health question in a focused, bilingual conversation workspace.",
      "एक केंद्रित, द्विभाषी संवाद में किडनी स्वास्थ्य से जुड़ा प्रश्न पूछें।",
    ],
    action: ["Open assistant", "सहायक खोलें"],
  },
  {
    number: "05",
    href: "/about-ckd",
    label: ["Learning", "जानकारी"],
    title: ["CKD field guide", "सीकेडी मार्गदर्शिका"],
    copy: [
      "Understand stages, tests, risk factors, warning signs, and useful next questions.",
      "चरण, जांच, जोखिम कारक, चेतावनी संकेत और उपयोगी अगले प्रश्न समझें।",
    ],
    action: ["Read the guide", "गाइड पढ़ें"],
  },
];

const process = [
  {
    title: ["Prepare", "तैयारी"],
    copy: ["Keep a recent blood or urine report nearby. Unknown fields can be marked as such.", "हाल की रक्त या मूत्र रिपोर्ट पास रखें। जिन मानों का पता नहीं है, उन्हें अज्ञात चुनें।"],
  },
  {
    title: ["Review", "समीक्षा"],
    copy: ["Check each entered value before generating the preliminary screening result.", "प्रारंभिक स्क्रीनिंग परिणाम बनाने से पहले हर दर्ज मान की जांच करें।"],
  },
  {
    title: ["Discuss", "चर्चा"],
    copy: ["Download the report and use it to support a conversation with a qualified professional.", "रिपोर्ट डाउनलोड करें और योग्य पेशेवर से बातचीत में इसका उपयोग करें।"],
  },
];

export default function Home() {
  useLanguage();

  return (
    <div className="home-page app-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <p className="section-kicker">{t("Kidney health screening, thoughtfully organised", "किडनी स्वास्थ्य स्क्रीनिंग, सोच-समझकर व्यवस्थित")}</p>
          <h1 id="home-title">
            {t("Understand the numbers.", "अपने आंकड़े समझें।")}
            <span>{t("Know what to ask next.", "जानें आगे क्या पूछना है।")}</span>
          </h1>
          <p className="home-hero__lede">
            {t(
              "NephroCare brings laboratory values, symptoms, and health history into one readable preliminary review you can take to a clinician.",
              "नेफ्रोकेयर लैब मान, लक्षण और स्वास्थ्य इतिहास को एक स्पष्ट प्रारंभिक समीक्षा में लाता है जिसे आप चिकित्सक के पास ले जा सकते हैं।",
            )}
          </p>
          <div className="home-hero__actions">
            <Button asChild size="lg">
              <Link href="/diagnosis">
                {t("Start an assessment", "मूल्यांकन शुरू करें")}
                <ArrowRight />
              </Link>
            </Button>
            <Link className="text-action" href="/about-ckd">
              {t("Explore the CKD guide", "सीकेडी गाइड देखें")}
              <ArrowDown />
            </Link>
          </div>
          <div className="home-hero__boundary">
            <ShieldCheck aria-hidden="true" />
            <p>{t("Educational screening only. NephroCare does not diagnose disease or replace medical care.", "केवल शैक्षिक स्क्रीनिंग। नेफ्रोकेयर रोग का निदान या चिकित्सा देखभाल का स्थान नहीं लेता।")}</p>
          </div>
        </div>

        <motion.div
          className="home-hero__visual"
          initial={{ opacity: 0.7, y: 18, rotate: 0.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          <span className="home-hero__visual-label">{t("Example report preview", "उदाहरण रिपोर्ट पूर्वावलोकन")}</span>
          <ScreeningJourney />
        </motion.div>
      </section>

      <section className="capability-strip" aria-label={t("Platform capabilities", "प्लेटफॉर्म की क्षमताएं")}>
        <div>
          <NumberFlow value={20} />
          <span>{t("clinical inputs", "क्लिनिकल इनपुट")}</span>
        </div>
        <div>
          <NumberFlow value={3} />
          <span>{t("explanation views", "व्याख्या दृश्य")}</span>
        </div>
        <div>
          <NumberFlow value={2} />
          <span>{t("interface languages", "इंटरफेस भाषाएं")}</span>
        </div>
        <div>
          <strong>{t("PDF ready", "पीडीएफ तैयार")}</strong>
          <span>{t("for appointments", "अपॉइंटमेंट के लिए")}</span>
        </div>
      </section>

      <section className="service-directory" aria-labelledby="services-heading">
        <div className="section-intro section-intro--wide">
          <p className="section-kicker">{t("One service, five clear paths", "एक सेवा, पांच स्पष्ट रास्ते")}</p>
          <h2 id="services-heading">{t("Move from uncertainty to a useful next step.", "अनिश्चितता से एक उपयोगी अगले कदम तक जाएं।")}</h2>
          <p>{t("Each area is designed around a specific health-information task, so the experience stays focused.", "हर भाग एक खास स्वास्थ्य-सूचना कार्य के लिए बनाया गया है, ताकि अनुभव केंद्रित रहे।")}</p>
        </div>
        <div className="service-directory__grid">
          {pathways.map((pathway) => (
              <Link key={pathway.number} href={pathway.href} className="pathway">
                <div className="pathway__meta"><span>{pathway.number}</span><em>{t(pathway.label[0], pathway.label[1])}</em></div>
                <h3>{t(pathway.title[0], pathway.title[1])}</h3>
                <p>{t(pathway.copy[0], pathway.copy[1])}</p>
                <span className="pathway__action">
                  {t(pathway.action[0], pathway.action[1])}
                  <ArrowRight aria-hidden="true" />
                </span>
              </Link>
          ))}
        </div>
      </section>

      <section className="process-section process-section--premium" aria-labelledby="process-heading">
        <div className="section-intro">
          <p className="section-kicker">{t("A calm workflow", "एक सहज प्रक्रिया")}</p>
          <h2 id="process-heading">{t("Designed around the appointment, not the algorithm.", "एल्गोरिदम नहीं, अपॉइंटमेंट को ध्यान में रखकर बनाया गया।")}</h2>
          <p>{t("You remain in control of what is entered, reviewed, saved, and shared.", "क्या दर्ज, जांचा, सहेजा और साझा किया जाए, इसका नियंत्रण आपके पास रहता है।")}</p>
        </div>
        <ol className="process-list process-list--connected">
          {process.map((step, index) => (
            <li key={step.title[0]}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{t(step.title[0], step.title[1])}</h3>
                <p>{t(step.copy[0], step.copy[1])}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <DoctorEndorsement />

      <section className="home-closing" aria-labelledby="home-closing-title">
        <div>
          <p className="section-kicker">{t("Ready when your report is", "जब आपकी रिपोर्ट तैयार हो")}</p>
          <h2 id="home-closing-title">{t("Begin a careful preliminary review.", "सावधानीपूर्वक प्रारंभिक समीक्षा शुरू करें।")}</h2>
        </div>
        <Button asChild size="lg">
          <Link href="/diagnosis">
            {t("Start now", "अभी शुरू करें")}
            <ArrowRight />
          </Link>
        </Button>
      </section>
    </div>
  );
}
