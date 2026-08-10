import { Link } from "wouter";
import { ArrowRight, Braces, FileSearch, HeartPulse, Languages, LockKeyhole, Scale } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/hooks/useLanguage";

const capabilities = [
  { icon: FileSearch, title: ["Preliminary screening", "प्रारंभिक स्क्रीनिंग"], copy: ["Organises report values and health history into an educational estimate.", "रिपोर्ट मान और स्वास्थ्य इतिहास को एक शैक्षिक अनुमान में व्यवस्थित करता है।"] },
  { icon: Scale, title: ["Visible reasoning", "स्पष्ट कारण"], copy: ["Shows which entered factors influenced the model instead of displaying only a score.", "सिर्फ स्कोर दिखाने के बजाय बताता है कि किन दर्ज कारकों ने मॉडल को प्रभावित किया।"] },
  { icon: HeartPulse, title: ["Symptom context", "लक्षण संदर्भ"], copy: ["Helps organise warning signs by the attention they may need.", "चेतावनी संकेतों को आवश्यक ध्यान के अनुसार व्यवस्थित करने में मदद करता है।"] },
  { icon: Languages, title: ["English and Hindi", "अंग्रेजी और हिंदी"], copy: ["Keeps the core health-information journey available in both languages.", "मुख्य स्वास्थ्य-सूचना यात्रा दोनों भाषाओं में उपलब्ध रखता है।"] },
  { icon: LockKeyhole, title: ["Device-linked reports", "डिवाइस से जुड़ी रिपोर्ट"], copy: ["Reads report references from the browser before requesting saved records.", "सहेजे रिकॉर्ड मांगने से पहले ब्राउज़र से रिपोर्ट संदर्भ पढ़ता है।"] },
  { icon: Braces, title: ["Student engineering project", "छात्र इंजीनियरिंग परियोजना"], copy: ["Built to explore responsible software, explainability, and accessible health communication.", "जिम्मेदार सॉफ्टवेयर, व्याख्यात्मकता और सुलभ स्वास्थ्य संचार को समझने के लिए बनाया गया।"] },
];

export default function About() {
  useLanguage();

  return (
    <div className="about-page app-page">
      <PageIntro
        eyebrow={t("About NephroCare", "नेफ्रोकेयर के बारे में")}
        title={t("A clearer first step for kidney-health awareness.", "किडनी स्वास्थ्य जागरूकता के लिए एक स्पष्ट पहला कदम।")}
        description={t("NephroCare is a student-built educational project that helps people organise information before speaking with a qualified medical professional.", "नेफ्रोकेयर एक छात्र द्वारा निर्मित शैक्षिक परियोजना है जो योग्य चिकित्सक से बात करने से पहले जानकारी व्यवस्थित करने में मदद करती है।")}
        actions={<Button asChild><Link href="/diagnosis">{t("Try the assessment", "मूल्यांकन आजमाएं")}<ArrowRight /></Link></Button>}
      />

      <section className="about-origin">
        <div><p className="section-kicker">{t("Why it exists", "यह क्यों बनाया गया")}</p><h2>{t("Reports are full of numbers. Appointments are short.", "रिपोर्ट आंकड़ों से भरी होती हैं। अपॉइंटमेंट का समय कम होता है।")}</h2></div>
        <div><p>{t("Kidney disease can develop with few obvious early symptoms, while laboratory reports are difficult to understand without context. NephroCare was designed to make that first review more structured and encourage appropriate clinical follow-up.", "किडनी रोग कम स्पष्ट शुरुआती लक्षणों के साथ विकसित हो सकता है, जबकि लैब रिपोर्ट बिना संदर्भ के समझना कठिन है। नेफ्रोकेयर पहली समीक्षा को व्यवस्थित बनाने और उचित चिकित्सकीय परामर्श को प्रोत्साहित करने के लिए बनाया गया।")}</p><p>{t("It does not try to replace a diagnosis. It helps users arrive with a clearer record and better questions.", "यह निदान का स्थान लेने की कोशिश नहीं करता। यह उपयोगकर्ताओं को स्पष्ट रिकॉर्ड और बेहतर प्रश्नों के साथ पहुंचने में मदद करता है।")}</p></div>
      </section>

      <section className="about-capability-section" aria-labelledby="about-capability-title">
        <div className="section-intro"><p className="section-kicker">{t("The product", "उत्पाद")}</p><h2 id="about-capability-title">{t("What the service is built to do", "सेवा किस काम के लिए बनी है")}</h2></div>
        <div className="about-capability-grid">{capabilities.map((capability, index) => { const Icon = capability.icon; return <article key={capability.title[0]}><span>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden="true" /><h3>{t(capability.title[0], capability.title[1])}</h3><p>{t(capability.copy[0], capability.copy[1])}</p></article>; })}</div>
      </section>

      <section className="developer-note">
        <div><span>SA</span><p>{t("Built in India", "भारत में निर्मित")}</p></div>
        <div><p className="section-kicker">{t("About the developer", "डेवलपर के बारे में")}</p><h2>Samanyu Ahuja</h2><p>{t("A student interested in computer science, biology, and responsible uses of technology in public health. NephroCare demonstrates careful engineering and accessible communication; it does not present the developer as a medical professional.", "कंप्यूटर साइंस, बायोलॉजी और सार्वजनिक स्वास्थ्य में तकनीक के जिम्मेदार उपयोग में रुचि रखने वाले छात्र। नेफ्रोकेयर सावधानीपूर्वक इंजीनियरिंग और सुलभ संचार का उदाहरण है; यह डेवलपर को चिकित्सा पेशेवर के रूप में प्रस्तुत नहीं करता।")}</p></div>
      </section>

      <section className="about-boundary">
        <div><p className="section-kicker">{t("Important boundary", "महत्वपूर्ण सीमा")}</p><h2>{t("Education before consultation, never instead of it.", "परामर्श से पहले शिक्षा, उसके स्थान पर कभी नहीं।")}</h2></div>
        <div><p>{t("The service cannot diagnose CKD, interpret every clinical situation, recommend individual treatment, or provide emergency care.", "यह सेवा सीकेडी का निदान, हर चिकित्सकीय स्थिति की व्याख्या, व्यक्तिगत उपचार की सिफारिश या आपातकालीन देखभाल नहीं दे सकती।")}</p><Link className="text-action" href="/medical-disclaimer">{t("Read the medical disclaimer", "चिकित्सकीय अस्वीकरण पढ़ें")}<ArrowRight /></Link></div>
      </section>
    </div>
  );
}
