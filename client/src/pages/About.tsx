import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { t } from "@/hooks/useLanguage";

const capabilities = [
  ["Preliminary screening", "Organises medical history and report values into a risk estimate."],
  ["Result explanation", "Shows the inputs and factors associated with the estimate."],
  ["Symptom review", "Provides general context for common kidney-health warning signs."],
  ["Diet guidance", "Produces general discussion points, never a prescribed clinical diet."],
  ["English and Hindi", "Makes the core interface available in two languages."],
  ["Report continuity", "Keeps report references associated with the browser used to create them."],
];

export default function About() {
  return (
    <article className="legal-page">
      <aside className="legal-page__aside">
        <p>{t("About the project", "परियोजना के बारे में")}</p>
        <time>Built in India</time>
      </aside>
      <div className="legal-page__content">
        <h1>{t("A clearer first step for kidney-health awareness.", "किडनी स्वास्थ्य जागरूकता के लिए एक स्पष्ट पहला कदम।")}</h1>
        <p className="legal-page__summary">
          {t(
            "NephroCare is a student-built educational project that helps people organise the information they already have before speaking with a qualified medical professional.",
            "नेफ्रोकेयर एक छात्र द्वारा निर्मित शैक्षिक परियोजना है जो लोगों को योग्य चिकित्सक से बात करने से पहले उपलब्ध जानकारी व्यवस्थित करने में मदद करती है।"
          )}
        </p>

        <section className="legal-section">
          <h2>{t("Why it exists", "यह क्यों बनाया गया")}</h2>
          <p>{t("Kidney disease can develop with few obvious early symptoms, while laboratory reports can be difficult to understand without context. NephroCare was created to make that first review more structured and to encourage appropriate clinical follow-up.", "किडनी रोग शुरुआती स्पष्ट लक्षणों के बिना विकसित हो सकता है और लैब रिपोर्ट बिना संदर्भ के समझना कठिन हो सकता है। नेफ्रोकेयर पहली समीक्षा को अधिक व्यवस्थित बनाने और उचित चिकित्सकीय परामर्श को प्रोत्साहित करने के लिए बनाया गया।")}</p>
        </section>

        <section className="legal-section">
          <h2>{t("What the service does", "सेवा क्या करती है")}</h2>
          <dl className="about-capabilities">
            {capabilities.map(([title, copy], index) => (
              <div key={title}>
                <dt><span>0{index + 1}</span>{t(title, title)}</dt>
                <dd>{t(copy, copy)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="legal-section">
          <h2>{t("About the developer", "डेवलपर के बारे में")}</h2>
          <p>{t("NephroCare was developed by Samanyu Ahuja, a student interested in computer science, biology, and responsible uses of technology in public health. The project is intended to demonstrate careful engineering and accessible health communication, not to present the developer as a medical professional.", "नेफ्रोकेयर समन्यु अहुजा द्वारा विकसित किया गया, जो कंप्यूटर साइंस, बायोलॉजी और सार्वजनिक स्वास्थ्य में तकनीक के जिम्मेदार उपयोग में रुचि रखने वाले छात्र हैं। यह परियोजना चिकित्सा पेशेवर होने का दावा नहीं करती।")}</p>
        </section>

        <section className="legal-section">
          <h2>{t("Important boundary", "महत्वपूर्ण सीमा")}</h2>
          <p>{t("The service cannot diagnose CKD, interpret every clinical situation, or recommend individual treatment. Use it to prepare questions, then review concerns with a doctor or nephrologist.", "यह सेवा सीकेडी का निदान, हर चिकित्सकीय स्थिति की व्याख्या या व्यक्तिगत उपचार की सिफारिश नहीं कर सकती। प्रश्न तैयार करने के लिए इसका उपयोग करें, फिर डॉक्टर या नेफ्रोलॉजिस्ट से चर्चा करें।")}</p>
          <p><Link className="text-action" href="/medical-disclaimer">{t("Read the full medical disclaimer", "पूर्ण चिकित्सकीय अस्वीकरण पढ़ें")}<ArrowRight /></Link></p>
        </section>
      </div>
    </article>
  );
}
