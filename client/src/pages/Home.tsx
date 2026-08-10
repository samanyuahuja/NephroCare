import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/hooks/useLanguage";
import ScreeningJourney from "@/components/ScreeningJourney";

const serviceDirectory = [
  {
    number: "01",
    href: "/diagnosis",
    title: ["CKD risk assessment", "सीकेडी जोखिम मूल्यांकन"],
    copy: [
      "Organise recent laboratory values, health history, and symptoms into a preliminary screening report.",
      "हाल के लैब मान, स्वास्थ्य इतिहास और लक्षणों को प्रारंभिक स्क्रीनिंग रिपोर्ट में व्यवस्थित करें।",
    ],
    action: ["Start assessment", "मूल्यांकन शुरू करें"],
  },
  {
    number: "02",
    href: "/symptom-checker",
    title: ["Symptom review", "लक्षण समीक्षा"],
    copy: [
      "Work through common kidney-health warning signs and learn when professional advice may be appropriate.",
      "किडनी स्वास्थ्य के सामान्य चेतावनी संकेतों की समीक्षा करें और जानें कि पेशेवर सलाह कब उचित हो सकती है।",
    ],
    action: ["Review symptoms", "लक्षणों की समीक्षा करें"],
  },
  {
    number: "03",
    href: "/browse",
    title: ["Reports on this device", "इस डिवाइस पर रिपोर्ट"],
    copy: [
      "Return to assessments and diet guidance associated with this browser. Your saved report references remain on this device.",
      "इस ब्राउज़र से जुड़े मूल्यांकन और आहार मार्गदर्शन पर वापस जाएं। सहेजे गए रिपोर्ट संदर्भ इसी डिवाइस पर रहते हैं।",
    ],
    action: ["Open my reports", "मेरी रिपोर्ट खोलें"],
  },
];

const process = [
  ["Prepare", "Keep a recent blood or urine report nearby. Fields you do not know can be left as unknown."],
  ["Screen", "Enter only the information available to you. The service organises it into a preliminary estimate."],
  ["Discuss", "Use the result as a starting point for a conversation with a qualified medical professional."],
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="editorial-hero" data-motion-reveal="hero">
        <div className="editorial-hero__copy">
          <p className="section-kicker">{t("Kidney health screening", "किडनी स्वास्थ्य स्क्रीनिंग")}</p>
          <h1>{t("Make sense of your kidney-health information.", "अपनी किडनी स्वास्थ्य जानकारी को बेहतर ढंग से समझें।")}</h1>
          <p className="editorial-hero__lede">
            {t(
              "NephroCare brings report values, symptoms, and medical history into one clear preliminary review you can take to a clinician.",
              "नेफ्रोकेयर रिपोर्ट मान, लक्षण और चिकित्सा इतिहास को एक स्पष्ट प्रारंभिक समीक्षा में लाता है जिसे आप चिकित्सक के पास ले जा सकते हैं।"
            )}
          </p>
          <div className="editorial-hero__actions">
            <Button asChild size="lg">
              <Link href="/diagnosis">{t("Start an assessment", "मूल्यांकन शुरू करें")}<ArrowRight /></Link>
            </Button>
            <Link className="text-action" href="/about-ckd">
              {t("Read the CKD guide", "सीकेडी गाइड पढ़ें")}<ArrowRight />
            </Link>
          </div>
          <p className="editorial-hero__disclaimer">
            {t(
              "This service does not diagnose disease, prescribe treatment, or provide emergency care.",
              "यह सेवा रोग का निदान, उपचार निर्धारित या आपातकालीन देखभाल प्रदान नहीं करती।"
            )}
          </p>
        </div>
        <ScreeningJourney />
      </section>

      <section className="service-directory" aria-labelledby="services-heading" data-motion-reveal="services">
        <div className="section-intro">
          <p className="section-kicker">{t("Choose a task", "कार्य चुनें")}</p>
          <h2 id="services-heading">{t("What do you need to do?", "आपको क्या करना है?")}</h2>
        </div>
        <div className="service-directory__list">
          {serviceDirectory.map((service) => (
            <article key={service.number} className="service-row" data-motion-item="service">
              <span className="service-row__number">{service.number}</span>
              <div>
                <h3>{t(service.title[0], service.title[1])}</h3>
                <p>{t(service.copy[0], service.copy[1])}</p>
              </div>
              <Link href={service.href} aria-label={t(service.action[0], service.action[1])}>
                <span>{t(service.action[0], service.action[1])}</span><ArrowRight />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-heading" data-motion-reveal="process">
        <div className="section-intro">
          <p className="section-kicker">{t("Before you begin", "शुरू करने से पहले")}</p>
          <h2 id="process-heading">{t("Three clear stages", "तीन स्पष्ट चरण")}</h2>
          <p>{t("Designed around a real appointment workflow, not a marketing funnel.", "वास्तविक अपॉइंटमेंट प्रक्रिया के आधार पर बनाया गया है, मार्केटिंग फनल के रूप में नहीं।")}</p>
        </div>
        <ol className="process-list">
          {process.map(([title, copy], index) => (
            <li key={title} data-motion-item="process-step">
              <span>0{index + 1}</span>
              <h3>{t(title, title)}</h3>
              <p>{t(copy, copy)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="evidence-band" data-motion-reveal="evidence">
        <div>
          <p className="section-kicker">{t("What the report includes", "रिपोर्ट में क्या शामिल है")}</p>
          <h2>{t("Context, not a black-box answer.", "संदर्भ, केवल एक अस्पष्ट उत्तर नहीं।")}</h2>
        </div>
        <dl>
          <div><dt>{t("Risk context", "जोखिम संदर्भ")}</dt><dd>{t("A preliminary level alongside the values entered.", "दर्ज मानों के साथ एक प्रारंभिक स्तर।")}</dd></div>
          <div><dt>{t("Contributing factors", "प्रभावित करने वाले कारक")}</dt><dd>{t("A readable explanation of which inputs influenced the estimate.", "किन जानकारियों ने अनुमान को प्रभावित किया, उसकी स्पष्ट व्याख्या।")}</dd></div>
          <div><dt>{t("Practical next steps", "व्यावहारिक अगले कदम")}</dt><dd>{t("Questions and general guidance to discuss with a professional.", "पेशेवर से चर्चा के लिए प्रश्न और सामान्य मार्गदर्शन।")}</dd></div>
        </dl>
      </section>

      <section className="closing-action" data-motion-reveal="closing">
        <p className="section-kicker">{t("A few minutes with your report", "अपनी रिपोर्ट के साथ कुछ मिनट")}</p>
        <h2>{t("Begin a careful preliminary review.", "सावधानीपूर्वक प्रारंभिक समीक्षा शुरू करें।")}</h2>
        <Button asChild size="lg"><Link href="/diagnosis">{t("Start now", "अभी शुरू करें")}<ArrowRight /></Link></Button>
      </section>
    </div>
  );
}
