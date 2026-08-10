import { Link } from "wouter";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  FileChartColumn,
  FlaskConical,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  Utensils,
} from "lucide-react";
import { useLanguage, t } from "@/hooks/useLanguage";

const workflow = [
  {
    index: "01",
    title: ["Enter your health information", "अपनी स्वास्थ्य जानकारी दर्ज करें"],
    copy: [
      "Use values from a recent laboratory report, together with symptoms and relevant medical history.",
      "हाल की लैब रिपोर्ट के मान, लक्षण और संबंधित चिकित्सा इतिहास दर्ज करें।",
    ],
  },
  {
    index: "02",
    title: ["Review the screening result", "स्क्रीनिंग परिणाम देखें"],
    copy: [
      "See an estimated CKD risk level and the factors that influenced the model output.",
      "अनुमानित सीकेडी जोखिम स्तर और मॉडल के परिणाम को प्रभावित करने वाले कारक देखें।",
    ],
  },
  {
    index: "03",
    title: ["Discuss it with a clinician", "चिकित्सक से चर्चा करें"],
    copy: [
      "Download the report and use it as a starting point for a conversation with a qualified professional.",
      "रिपोर्ट डाउनलोड करें और योग्य चिकित्सक से बातचीत की शुरुआत के रूप में इसका उपयोग करें।",
    ],
  },
] as const;

const tools = [
  {
    href: "/diagnosis",
    icon: ClipboardCheck,
    title: ["CKD assessment", "सीकेडी मूल्यांकन"],
    copy: ["A structured screening form using clinical and health-history inputs.", "क्लिनिकल और स्वास्थ्य इतिहास से जुड़ी जानकारी पर आधारित स्क्रीनिंग फॉर्म।"],
  },
  {
    href: "/symptom-checker",
    icon: Stethoscope,
    title: ["Symptom checker", "लक्षण जांच"],
    copy: ["Record common symptoms and understand when medical attention may be appropriate.", "सामान्य लक्षण दर्ज करें और समझें कि चिकित्सा सहायता कब उचित हो सकती है।"],
  },
  {
    href: "/browse",
    icon: FileChartColumn,
    title: ["Reports and history", "रिपोर्ट और इतिहास"],
    copy: ["Return to completed assessments and previously generated diet plans.", "पूर्ण किए गए मूल्यांकन और पहले बनाई गई आहार योजनाएं दोबारा देखें।"],
  },
  {
    href: "/chatbot",
    icon: MessageCircle,
    title: ["Kidney health questions", "किडनी स्वास्थ्य प्रश्न"],
    copy: ["Ask general educational questions about CKD, tests, and kidney-health terminology.", "सीकेडी, जांच और किडनी स्वास्थ्य से जुड़े शब्दों पर सामान्य शैक्षिक प्रश्न पूछें।"],
  },
] as const;

export default function Home() {
  const { language } = useLanguage();
  const localize = (copy: readonly [string, string]) => copy[language === "hi" ? 1 : 0];

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <p className="section-label">{t("Kidney health screening", "किडनी स्वास्थ्य स्क्रीनिंग")}</p>
          <h1 id="home-title">NephroCare</h1>
          <p className="home-hero__lead">
            {t(
              "A practical screening tool for understanding chronic kidney disease risk from health history and laboratory values.",
              "स्वास्थ्य इतिहास और लैब रिपोर्ट के आधार पर क्रोनिक किडनी रोग के जोखिम को समझने के लिए एक उपयोगी स्क्रीनिंग टूल।",
            )}
          </p>
          <div className="home-hero__actions">
            <Link className="action-link action-link--primary" href="/diagnosis">
              {t("Start an assessment", "मूल्यांकन शुरू करें")}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="action-link action-link--secondary" href="/symptom-checker">
              {t("Check symptoms", "लक्षण जांचें")}
            </Link>
          </div>
          <p className="home-hero__notice">
            {t(
              "For education and preliminary screening only. NephroCare does not provide a medical diagnosis.",
              "केवल शिक्षा और प्रारंभिक स्क्रीनिंग के लिए। नेफ्रोकेयर चिकित्सकीय निदान प्रदान नहीं करता।",
            )}
          </p>
        </div>

        <div className="assessment-preview" aria-label={t("Assessment overview", "मूल्यांकन अवलोकन")}>
          <div className="assessment-preview__header">
            <div>
              <span>{t("Assessment", "मूल्यांकन")}</span>
              <strong>{t("Clinical input review", "क्लिनिकल जानकारी की समीक्षा")}</strong>
            </div>
            <span className="status-chip"><i />{t("Ready", "तैयार")}</span>
          </div>
          <div className="assessment-preview__rows">
            <div><span>{t("Health history", "स्वास्थ्य इतिहास")}</span><b>{t("Required", "आवश्यक")}</b></div>
            <div><span>{t("Laboratory values", "लैब मान")}</span><b>{t("Recommended", "अनुशंसित")}</b></div>
            <div><span>{t("Symptoms", "लक्षण")}</span><b>{t("Optional", "वैकल्पिक")}</b></div>
          </div>
          <div className="assessment-preview__footer">
            <ShieldCheck aria-hidden="true" />
            <p>{t("Your saved assessments are linked to this browser.", "आपके सहेजे गए मूल्यांकन इस ब्राउज़र से जुड़े रहते हैं।")}</p>
          </div>
        </div>
      </section>

      <section className="home-band home-band--ink" aria-labelledby="workflow-title">
        <div className="home-band__heading">
          <p className="section-label">{t("How it works", "यह कैसे काम करता है")}</p>
          <h2 id="workflow-title">{t("From report values to a result you can discuss.", "रिपोर्ट के मानों से एक ऐसे परिणाम तक, जिस पर आप चर्चा कर सकें।")}</h2>
        </div>
        <div className="workflow-list">
          {workflow.map((step) => (
            <article key={step.index}>
              <span>{step.index}</span>
              <div>
                <h3>{localize(step.title)}</h3>
                <p>{localize(step.copy)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-band" aria-labelledby="tools-title">
        <div className="home-band__heading home-band__heading--split">
          <div>
            <p className="section-label">{t("Tools", "उपकरण")}</p>
            <h2 id="tools-title">{t("One place to screen, understand, and revisit.", "स्क्रीनिंग, समझ और दोबारा देखने के लिए एक ही स्थान।")}</h2>
          </div>
          <p>{t("Use the section that matches what you need today. Each tool remains available from the main navigation.", "आज अपनी आवश्यकता के अनुसार अनुभाग चुनें। हर उपकरण मुख्य नेविगेशन से उपलब्ध है।")}</p>
        </div>
        <div className="tool-directory">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link href={tool.href} key={tool.href} className="tool-directory__item">
                <Icon aria-hidden="true" />
                <div>
                  <h3>{localize(tool.title)}</h3>
                  <p>{localize(tool.copy)}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-band home-band--soft" aria-labelledby="method-title">
        <div className="method-layout">
          <div>
            <p className="section-label">{t("What the result includes", "परिणाम में क्या शामिल है")}</p>
            <h2 id="method-title">{t("A result with context, not a verdict.", "संदर्भ सहित परिणाम, अंतिम निर्णय नहीं।")}</h2>
            <p>{t("NephroCare presents model output alongside the information used to produce it. The report is designed to support awareness and a better-informed clinical conversation.", "नेफ्रोकेयर मॉडल के परिणाम के साथ वह जानकारी भी दिखाता है जिससे परिणाम बना। रिपोर्ट जागरूकता और चिकित्सक से बेहतर बातचीत में सहायता के लिए बनाई गई है।")}</p>
          </div>
          <div className="method-checks">
            <span><FlaskConical /><b>{t("Input summary", "जानकारी का सार")}</b></span>
            <span><FileChartColumn /><b>{t("Estimated risk level", "अनुमानित जोखिम स्तर")}</b></span>
            <span><Check /><b>{t("Factor explanations", "कारकों की व्याख्या")}</b></span>
            <span><Utensils /><b>{t("Diet guidance", "आहार मार्गदर्शन")}</b></span>
          </div>
        </div>
      </section>
    </div>
  );
}
