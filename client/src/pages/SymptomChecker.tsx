import { useEffect, useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
import { useLenis } from "lenis/react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Info,
} from "lucide-react";
import PageIntro from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { t, useLanguage } from "@/hooks/useLanguage";

type CopyPair = [string, string];

interface Symptom {
  id: string;
  name: CopyPair;
  description: CopyPair;
  severity: number;
  urgency: "low" | "moderate" | "high" | "urgent";
  group: CopyPair;
}

const symptoms: Symptom[] = [
  { id: "fatigue", name: ["Persistent fatigue", "लगातार थकान"], description: ["Tiredness that does not improve with normal rest can have many causes, including anemia.", "सामान्य आराम से ठीक न होने वाली थकान के कई कारण हो सकते हैं, जिनमें एनीमिया भी शामिल है।"], severity: 2, urgency: "moderate", group: ["Energy", "ऊर्जा"] },
  { id: "swelling", name: ["Swelling in legs or ankles", "पैरों या टखनों में सूजन"], description: ["Fluid retention can cause puffiness or swelling, especially around the lower legs.", "शरीर में तरल रुकने से खासकर निचले पैरों में सूजन आ सकती है।"], severity: 3, urgency: "high", group: ["Fluid", "तरल"] },
  { id: "urination", name: ["Changes in urination", "पेशाब में बदलाव"], description: ["Noticeable changes in frequency, amount, colour, or difficulty passing urine deserve attention.", "पेशाब की आवृत्ति, मात्रा, रंग या पेशाब करने में कठिनाई में स्पष्ट बदलाव पर ध्यान देना चाहिए।"], severity: 3, urgency: "high", group: ["Urine", "मूत्र"] },
  { id: "foamy", name: ["Persistently foamy urine", "लगातार झागदार पेशाब"], description: ["Foam that persists can sometimes occur when protein is present in urine, but only a test can check this.", "लगातार झाग कभी-कभी मूत्र में प्रोटीन के कारण हो सकता है, लेकिन इसकी पुष्टि जांच से ही होती है।"], severity: 4, urgency: "high", group: ["Urine", "मूत्र"] },
  { id: "nausea", name: ["Nausea or vomiting", "मतली या उल्टी"], description: ["Ongoing nausea or vomiting can lead to dehydration and should be discussed with a clinician.", "लगातार मतली या उल्टी से पानी की कमी हो सकती है और चिकित्सक से बात करनी चाहिए।"], severity: 3, urgency: "moderate", group: ["Digestive", "पाचन"] },
  { id: "breath", name: ["Shortness of breath", "सांस लेने में कठिनाई"], description: ["New or severe breathing difficulty can be urgent and has many possible causes.", "नई या गंभीर सांस की तकलीफ आपात स्थिति हो सकती है और इसके कई संभावित कारण हैं।"], severity: 4, urgency: "high", group: ["Breathing", "सांस"] },
  { id: "appetite", name: ["Loss of appetite", "भूख कम होना"], description: ["A continuing reduction in appetite may be relevant when it occurs with other symptoms.", "अन्य लक्षणों के साथ लगातार भूख कम होना महत्वपूर्ण हो सकता है।"], severity: 2, urgency: "moderate", group: ["Digestive", "पाचन"] },
  { id: "blood", name: ["Blood in urine", "पेशाब में खून"], description: ["Visible blood in urine needs prompt medical assessment even if there is no pain.", "पेशाब में दिखाई देने वाला खून, दर्द न होने पर भी, तुरंत चिकित्सकीय जांच की मांग करता है।"], severity: 5, urgency: "urgent", group: ["Urine", "मूत्र"] },
  { id: "pressure", name: ["Known high blood pressure", "ज्ञात उच्च रक्तचाप"], description: ["High blood pressure and kidney function can affect one another over time.", "उच्च रक्तचाप और किडनी कार्य समय के साथ एक-दूसरे को प्रभावित कर सकते हैं।"], severity: 3, urgency: "high", group: ["Circulation", "रक्त संचार"] },
  { id: "skin", name: ["Persistent itchy or dry skin", "लगातार खुजली या सूखी त्वचा"], description: ["Persistent itching has many causes and becomes more relevant when combined with other signs.", "लगातार खुजली के कई कारण होते हैं और अन्य संकेतों के साथ यह अधिक महत्वपूर्ण हो सकती है।"], severity: 2, urgency: "low", group: ["Skin", "त्वचा"] },
  { id: "concentration", name: ["Trouble concentrating", "ध्यान लगाने में कठिनाई"], description: ["New mental fog or difficulty focusing can have many medical and non-medical causes.", "नई मानसिक धुंध या ध्यान में कठिनाई के कई चिकित्सकीय और गैर-चिकित्सकीय कारण हो सकते हैं।"], severity: 2, urgency: "moderate", group: ["Energy", "ऊर्जा"] },
  { id: "cramps", name: ["Frequent muscle cramps", "बार-बार मांसपेशियों में ऐंठन"], description: ["Frequent cramps can relate to hydration, activity, medicines, or mineral balance.", "बार-बार ऐंठन पानी, गतिविधि, दवाओं या खनिज संतुलन से जुड़ी हो सकती है।"], severity: 2, urgency: "low", group: ["Muscle", "मांसपेशी"] },
  { id: "backpain", name: ["Persistent flank or back pain", "लगातार कमर या बगल में दर्द"], description: ["Pain near the side or lower back can have several causes and may need examination.", "बगल या कमर के पास दर्द के कई कारण हो सकते हैं और जांच की आवश्यकता हो सकती है।"], severity: 3, urgency: "moderate", group: ["Pain", "दर्द"] },
];

const symptomGroups: Array<{ name: CopyPair; symptoms: Symptom[] }> = [
  { name: ["Energy and general health", "ऊर्जा और सामान्य स्वास्थ्य"], symptoms: symptoms.filter((symptom) => ["fatigue", "appetite", "skin", "concentration", "cramps"].includes(symptom.id)) },
  { name: ["Fluid and urinary changes", "तरल और मूत्र संबंधी बदलाव"], symptoms: symptoms.filter((symptom) => ["swelling", "urination", "foamy", "blood"].includes(symptom.id)) },
  { name: ["Breathing and circulation", "सांस और रक्त संचार"], symptoms: symptoms.filter((symptom) => ["breath", "pressure"].includes(symptom.id)) },
  { name: ["Pain and digestion", "दर्द और पाचन"], symptoms: symptoms.filter((symptom) => ["nausea", "backpain"].includes(symptom.id)) },
];

const urgencyCopy: Record<Symptom["urgency"], CopyPair> = {
  low: ["Observe", "निगरानी"],
  moderate: ["Discuss", "चर्चा करें"],
  high: ["Timely review", "समय पर समीक्षा"],
  urgent: ["Prompt review", "शीघ्र समीक्षा"],
};

interface AssessmentResult {
  totalScore: number;
  level: "minimal" | "low" | "moderate" | "high";
  urgency: "low" | "moderate" | "high" | "urgent";
  recommendations: CopyPair[];
  selectedSymptoms: Symptom[];
}

const levelCopy: Record<AssessmentResult["level"], CopyPair> = {
  minimal: ["Minimal concern", "बहुत कम चिंता"],
  low: ["Needs routine review", "सामान्य समीक्षा जरूरी"],
  moderate: ["Needs timely review", "समय पर समीक्षा जरूरी"],
  high: ["Needs urgent review", "तत्काल समीक्षा जरूरी"],
};

export default function SymptomChecker() {
  const [, setLocation] = useLocation();
  const lenis = useLenis();
  useLanguage();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assessment) return;

    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: "auto" });

    const frame = window.requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [assessment, lenis]);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((current) => current.includes(symptomId) ? current.filter((id) => id !== symptomId) : [...current, symptomId]);
  };

  const calculateAssessment = (): AssessmentResult => {
    const selected = symptoms.filter((symptom) => selectedSymptoms.includes(symptom.id));
    const totalScore = selected.reduce((sum, symptom) => sum + symptom.severity, 0);
    const urgent = selected.some((symptom) => symptom.urgency === "urgent");
    const high = selected.some((symptom) => symptom.urgency === "high");

    if (urgent || totalScore >= 15) {
      return { totalScore, level: "high", urgency: "urgent", selectedSymptoms: selected, recommendations: [["Seek prompt medical assessment. Use local emergency services if symptoms are severe or rapidly worsening.", "शीघ्र चिकित्सकीय जांच कराएं। लक्षण गंभीर हों या तेजी से बिगड़ें तो स्थानीय आपातकालीन सेवा लें।"], ["Take a list of medicines, medical conditions, and recent reports.", "दवाओं, चिकित्सकीय स्थितियों और हाल की रिपोर्टों की सूची साथ रखें।"]] };
    }
    if (high || totalScore >= 10) {
      return { totalScore, level: "moderate", urgency: "high", selectedSymptoms: selected, recommendations: [["Arrange a clinician appointment soon and describe when each symptom began.", "जल्द चिकित्सक से अपॉइंटमेंट लें और बताएं कि हर लक्षण कब शुरू हुआ।"], ["Ask whether blood pressure, eGFR, and urine albumin testing are appropriate.", "पूछें कि रक्तचाप, eGFR और मूत्र एल्ब्यूमिन जांच उचित है या नहीं।"]] };
    }
    if (totalScore >= 5) {
      return { totalScore, level: "low", urgency: "moderate", selectedSymptoms: selected, recommendations: [["Discuss persistent symptoms with a primary-care clinician.", "लगातार लक्षणों पर प्राथमिक चिकित्सक से चर्चा करें।"], ["Keep a short note of timing, triggers, and changes.", "समय, कारण और बदलाव का छोटा नोट रखें।"]] };
    }
    return { totalScore, level: "minimal", urgency: "low", selectedSymptoms: selected, recommendations: [["Continue routine health checks and monitor for changes.", "नियमित स्वास्थ्य जांच जारी रखें और बदलाव पर ध्यान दें।"], ["A symptom checker cannot rule out kidney disease; testing may still be appropriate if you have risk factors.", "लक्षण जांच सीकेडी को खारिज नहीं कर सकती; जोखिम कारक होने पर जांच फिर भी उचित हो सकती है।"]] };
  };

  const handleSubmit = () => setAssessment(calculateAssessment());

  if (assessment) {
    return (
      <div ref={resultRef} tabIndex={-1} className="symptoms-page symptoms-results app-page">
        <PageIntro eyebrow={t("Symptom review", "लक्षण समीक्षा")} title={t("Your attention summary", "आपका ध्यान सारांश")} description={t("This is a practical triage aid, not a diagnosis or CKD risk score.", "यह एक व्यावहारिक प्राथमिकता सहायता है, निदान या सीकेडी जोखिम स्कोर नहीं।")} />
        <section className={`symptom-result symptom-result--${assessment.level}`}>
          <div className="symptom-result__score"><span>{t("Attention score", "ध्यान स्कोर")}</span><NumberFlow value={assessment.totalScore} /><small>{t("from selected signs", "चुने गए संकेतों से")}</small></div>
          <div className="symptom-result__summary"><p className="section-kicker">{t("Suggested priority", "सुझाई गई प्राथमिकता")}</p><h2>{t(...levelCopy[assessment.level])}</h2><p>{t("The pattern you selected suggests the next step below. A clinician may reach a different conclusion after examination and testing.", "आपके चुने गए लक्षण नीचे दिए अगले कदम का संकेत देते हैं। जांच और परीक्षण के बाद चिकित्सक अलग निष्कर्ष पर पहुंच सकते हैं।")}</p></div>
          <div className="symptom-result__status"><span>{t("Priority", "प्राथमिकता")}</span><strong>{t(assessment.urgency === "urgent" ? "Urgent" : assessment.urgency === "high" ? "Timely" : "Monitor", assessment.urgency === "urgent" ? "तत्काल" : assessment.urgency === "high" ? "समय पर" : "निगरानी")}</strong></div>
        </section>
        <div className="symptom-result-grid">
          <section><p className="section-kicker">{t("What you selected", "आपने क्या चुना")}</p><h2>{t("Selected signs", "चुने गए संकेत")}</h2><div className="selected-signs">{assessment.selectedSymptoms.map((symptom) => <div key={symptom.id}><span>{symptom.severity}</span><p>{t(...symptom.name)}</p></div>)}</div></section>
          <section><p className="section-kicker">{t("Practical next step", "व्यावहारिक अगला कदम")}</p><h2>{t("What to do now", "अब क्या करें")}</h2><ol>{assessment.recommendations.map((recommendation, index) => <li key={recommendation[0]}><span>{String(index + 1).padStart(2, "0")}</span><p>{t(...recommendation)}</p></li>)}</ol></section>
        </div>
        <div className="symptom-result-actions"><Button variant="outline" onClick={() => setAssessment(null)}><ArrowLeft />{t("Review again", "फिर से देखें")}</Button><Button onClick={() => setLocation("/diagnosis")}>{t("Start full assessment", "पूर्ण मूल्यांकन शुरू करें")}<ArrowRight /></Button></div>
      </div>
    );
  }

  return (
    <div className="symptoms-page app-page">
      <PageIntro
        eyebrow={t("Symptom review", "लक्षण समीक्षा")}
        title={t("What are you noticing today?", "आज आप क्या महसूस कर रहे हैं?")}
        description={t("Mark every current symptom. Each entry includes context and a suggested level of attention.", "हर मौजूदा लक्षण चुनें। प्रत्येक संकेत के साथ संदर्भ और ध्यान देने का सुझाया स्तर दिया गया है।")}
        aside={<div className="selection-meter"><NumberFlow value={selectedSymptoms.length} /><span>{t("selected", "चुने गए")}</span><small>{t("of 13 signs", "13 संकेतों में से")}</small></div>}
      />

      <section className="symptom-picker" aria-labelledby="symptom-picker-title">
        <div className="symptom-picker__heading">
          <div><p className="section-kicker">{t("Current symptoms", "वर्तमान लक्षण")}</p><h2 id="symptom-picker-title">{t("A structured symptom register", "व्यवस्थित लक्षण सूची")}</h2></div>
          <p><Info />{t("This review organises signs for discussion; it does not diagnose their cause.", "यह समीक्षा चर्चा के लिए संकेत व्यवस्थित करती है; यह उनके कारण का निदान नहीं करती।")}</p>
        </div>
        <div className="symptom-register">
          {symptomGroups.map((group, groupIndex) => (
            <section className="symptom-group" key={group.name[0]} aria-labelledby={`symptom-group-${groupIndex}`}>
              <header className="symptom-group__header">
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <h3 id={`symptom-group-${groupIndex}`}>{t(...group.name)}</h3>
                <small>{group.symptoms.length} {t(group.symptoms.length === 1 ? "sign" : "signs", "संकेत")}</small>
              </header>
              <div className="symptom-group__rows">
                {group.symptoms.map((symptom) => {
                  const selected = selectedSymptoms.includes(symptom.id);
                  const symptomIndex = symptoms.findIndex((item) => item.id === symptom.id) + 1;
                  return (
                    <Collapsible key={symptom.id}>
                      <div className={`symptom-item symptom-item--${symptom.urgency} ${selected ? "is-selected" : ""}`}>
                        <span className="symptom-item__number">{String(symptomIndex).padStart(2, "0")}</span>
                        <Checkbox
                          id={symptom.id}
                          checked={selected}
                          onCheckedChange={() => toggleSymptom(symptom.id)}
                          aria-label={t(`Select ${symptom.name[0]}`, `${symptom.name[1]} चुनें`)}
                        />
                        <label htmlFor={symptom.id}><strong>{t(...symptom.name)}</strong></label>
                        <span className="symptom-item__priority">{t(...urgencyCopy[symptom.urgency])}</span>
                        <CollapsibleTrigger asChild><button className="symptom-info-button" type="button" aria-label={t("More information", "अधिक जानकारी")}><ChevronDown /></button></CollapsibleTrigger>
                        <CollapsibleContent className="symptom-item__detail"><p>{t(...symptom.description)}</p><span>{t(...urgencyCopy[symptom.urgency])}</span></CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="symptom-action-dock">
        <div><NumberFlow value={selectedSymptoms.length} /><p>{t("signs selected", "संकेत चुने गए")}</p></div>
        <p>{t("Severe or rapidly worsening symptoms need urgent medical care.", "गंभीर या तेजी से बिगड़ते लक्षणों में तुरंत चिकित्सा सहायता लें।")}</p>
        <Button onClick={handleSubmit} disabled={selectedSymptoms.length === 0}>{t("Review pattern", "पैटर्न देखें")}<ArrowRight /></Button>
      </div>
    </div>
  );
}
