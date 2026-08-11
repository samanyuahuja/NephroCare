import { Link } from "wouter";
import { ArrowRight, ExternalLink } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/hooks/useLanguage";

const chapters = [
  ["overview", "Overview", "परिचय"],
  ["stages", "CKD stages", "सीकेडी चरण"],
  ["risk", "Risk factors", "जोखिम कारक"],
  ["symptoms", "Warning signs", "चेतावनी संकेत"],
  ["tests", "Useful tests", "महत्वपूर्ण जांच"],
  ["next", "What to do next", "आगे क्या करें"],
];

const stages = [
  { stage: "G1", range: "≥ 90", tone: "stable", title: ["Normal or high filtration", "सामान्य या अधिक फिल्ट्रेशन"], copy: ["CKD requires other evidence of kidney damage at this level.", "इस स्तर पर सीकेडी के लिए किडनी क्षति के अन्य प्रमाण भी आवश्यक हैं।"] },
  { stage: "G2", range: "60–89", tone: "stable", title: ["Mildly reduced", "हल्की कमी"], copy: ["Other evidence of kidney damage is still needed to classify CKD.", "सीकेडी वर्गीकरण के लिए किडनी क्षति के अन्य प्रमाण भी आवश्यक हैं।"] },
  { stage: "G3a", range: "45–59", tone: "watch", title: ["Mild to moderate reduction", "हल्की से मध्यम कमी"], copy: ["A clinician interprets the result with age, albumin, history, and repeat testing.", "चिकित्सक इसे आयु, एल्ब्यूमिन, इतिहास और दोबारा जांच के साथ समझते हैं।"] },
  { stage: "G3b", range: "30–44", tone: "watch", title: ["Moderate to severe reduction", "मध्यम से गंभीर कमी"], copy: ["Closer clinical monitoring is commonly needed.", "आमतौर पर अधिक नियमित चिकित्सकीय निगरानी की आवश्यकता होती है।"] },
  { stage: "G4", range: "15–29", tone: "urgent", title: ["Severely reduced", "गंभीर कमी"], copy: ["Specialist-led care and planning become especially important.", "विशेषज्ञ की देखरेख और आगे की योजना विशेष रूप से महत्वपूर्ण हो जाती है।"] },
  { stage: "G5", range: "< 15", tone: "urgent", title: ["Kidney failure range", "किडनी विफलता की सीमा"], copy: ["This needs urgent specialist interpretation and care planning.", "इसके लिए तत्काल विशेषज्ञ व्याख्या और देखभाल योजना की आवश्यकता होती है।"] },
];

const riskFactors = [
  { title: ["Diabetes", "मधुमेह"], copy: ["High blood glucose can damage the kidneys' filtering system over time.", "लंबे समय तक अधिक रक्त शर्करा किडनी की फिल्टर प्रणाली को नुकसान पहुंचा सकती है।"] },
  { title: ["High blood pressure", "उच्च रक्तचाप"], copy: ["Persistent pressure can damage the small blood vessels in the kidneys.", "लगातार अधिक दबाव किडनी की छोटी रक्त वाहिकाओं को नुकसान पहुंचा सकता है।"] },
  { title: ["Heart disease", "हृदय रोग"], copy: ["Heart and kidney health share important risk pathways.", "हृदय और किडनी स्वास्थ्य के कई जोखिम कारक जुड़े होते हैं।"] },
  { title: ["Family history", "पारिवारिक इतिहास"], copy: ["A family history of kidney failure can increase the need for screening.", "परिवार में किडनी विफलता का इतिहास स्क्रीनिंग की आवश्यकता बढ़ा सकता है।"] },
];

const symptoms = [
  ["Swelling in the legs, feet, ankles, hands, or face", "पैरों, टखनों, हाथों या चेहरे पर सूजन"],
  ["Changes in urination or foamy urine", "पेशाब में बदलाव या झागदार पेशाब"],
  ["Ongoing tiredness or sleep difficulty", "लगातार थकान या नींद में कठिनाई"],
  ["Loss of appetite, nausea, or vomiting", "भूख कम होना, मतली या उल्टी"],
  ["Shortness of breath", "सांस लेने में कठिनाई"],
  ["Difficulty concentrating or confusion", "ध्यान लगाने में कठिनाई या भ्रम"],
];

const tests = [
  { code: "eGFR", title: ["Estimated filtration rate", "अनुमानित फिल्ट्रेशन दर"], copy: ["A blood-test estimate of how well the kidneys filter blood. It is interpreted over time, not from a single number alone.", "रक्त जांच से किडनी के फिल्ट्रेशन का अनुमान। इसे केवल एक संख्या से नहीं, समय के साथ समझा जाता है।"] },
  { code: "uACR", title: ["Urine albumin-to-creatinine ratio", "मूत्र एल्ब्यूमिन-टू-क्रिएटिनिन अनुपात"], copy: ["Checks whether albumin is passing into urine, which can be a sign of kidney damage.", "यह जांचता है कि एल्ब्यूमिन मूत्र में जा रहा है या नहीं, जो किडनी क्षति का संकेत हो सकता है।"] },
  { code: "SCr", title: ["Serum creatinine", "सीरम क्रिएटिनिन"], copy: ["A waste-product measurement used by clinicians to estimate eGFR and assess trends.", "एक अपशिष्ट उत्पाद का माप, जिसका उपयोग चिकित्सक eGFR का अनुमान और समय के साथ बदलाव देखने में करते हैं।"] },
  { code: "BP", title: ["Blood pressure", "रक्तचाप"], copy: ["A key measurement because blood pressure and kidney function affect one another.", "एक महत्वपूर्ण माप क्योंकि रक्तचाप और किडनी कार्य एक-दूसरे को प्रभावित करते हैं।"] },
];

export default function AboutCKD() {
  useLanguage();

  return (
    <div className="guide-page app-page">
      <PageIntro
        eyebrow={t("NephroCare field guide", "नेफ्रोकेयर मार्गदर्शिका")}
        title={t("CKD, explained without the fog.", "सीकेडी, सरल और स्पष्ट भाषा में।")}
        description={t(
          "A bilingual guide to the terms, tests, stages, and warning signs that often appear in kidney-health conversations.",
          "किडनी स्वास्थ्य से जुड़ी बातचीत में आने वाले शब्दों, जांचों, चरणों और चेतावनी संकेतों की द्विभाषी मार्गदर्शिका।",
        )}
        actions={
          <Button asChild>
            <Link href="/diagnosis">{t("Start an assessment", "मूल्यांकन शुरू करें")}<ArrowRight /></Link>
          </Button>
        }
        aside={
          <div className="guide-intro-signal">
            <span aria-hidden="true">READ 01</span>
            <strong>{t("Start with two ideas", "दो बातों से शुरू करें")}</strong>
            <p>{t("Early CKD may have no symptoms. Blood and urine tests are central to checking kidney health.", "शुरुआती सीकेडी में लक्षण न भी हों। रक्त और मूत्र जांच किडनी स्वास्थ्य की जांच के मुख्य तरीके हैं।")}</p>
          </div>
        }
      />

      <div className="guide-layout">
        <aside className="guide-nav" aria-label={t("Guide chapters", "गाइड के अध्याय")}>
          <span>{t("On this page", "इस पेज पर")}</span>
          <nav>
            {chapters.map(([id, en, hi], index) => (
              <a href={`#${id}`} key={id}><b>{String(index + 1).padStart(2, "0")}</b>{t(en, hi)}</a>
            ))}
          </nav>
        </aside>

        <article className="guide-article">
          <section id="overview" className="guide-chapter guide-overview">
            <div className="guide-chapter__heading">
              <span>01</span>
              <div><p className="section-kicker">{t("The foundation", "बुनियादी जानकारी")}</p><h2>{t("What CKD means", "सीकेडी का अर्थ")}</h2></div>
            </div>
            <p className="guide-lede">{t("Chronic kidney disease means the kidneys are damaged or have a structural problem that prevents them from filtering blood as well as they should.", "क्रोनिक किडनी रोग का अर्थ है कि किडनी क्षतिग्रस्त है या उसकी संरचना में ऐसी समस्या है जिससे वह रक्त को ठीक से फिल्टर नहीं कर पाती।")}</p>
            <div className="guide-definition">
              <span aria-hidden="true">NOTE</span>
              <div>
                <strong>{t("One result is not the whole diagnosis", "एक परिणाम पूरा निदान नहीं है")}</strong>
                <p>{t("Clinicians generally look for kidney damage or reduced function that persists for more than three months, using history, examination, and repeat tests.", "चिकित्सक आमतौर पर तीन महीने से अधिक समय तक बनी किडनी क्षति या कम कार्यक्षमता को इतिहास, जांच और दोबारा परीक्षण के साथ देखते हैं।")}</p>
              </div>
            </div>
          </section>

          <section id="stages" className="guide-chapter">
            <div className="guide-chapter__heading">
              <span>02</span>
              <div><p className="section-kicker">{t("Filtration categories", "फिल्ट्रेशन श्रेणियां")}</p><h2>{t("The eGFR stage map", "eGFR चरण मानचित्र")}</h2></div>
            </div>
            <p>{t("The G categories below describe eGFR ranges in mL/min/1.73m². G1 and G2 do not establish CKD without other evidence of kidney damage.", "नीचे G श्रेणियां eGFR सीमा को mL/min/1.73m² में दिखाती हैं। G1 और G2 में अन्य किडनी क्षति के प्रमाण के बिना सीकेडी तय नहीं होती।")}</p>
            <div className="stage-map" role="list">
              {stages.map((stage) => (
                <div className={`stage-map__row stage-map__row--${stage.tone}`} key={stage.stage} role="listitem">
                  <strong>{stage.stage}</strong>
                  <span className="stage-map__range">{stage.range}</span>
                  <div><h3>{t(stage.title[0], stage.title[1])}</h3><p>{t(stage.copy[0], stage.copy[1])}</p></div>
                </div>
              ))}
            </div>
            <p className="guide-note">{t("Albumin in urine adds important risk information. A clinician reads eGFR and uACR together and considers whether results persist.", "मूत्र में एल्ब्यूमिन जोखिम की महत्वपूर्ण जानकारी देता है। चिकित्सक eGFR और uACR को साथ देखकर और परिणामों के बने रहने पर विचार करते हैं।")}</p>
          </section>

          <section id="risk" className="guide-chapter">
            <div className="guide-chapter__heading">
              <span>03</span>
              <div><p className="section-kicker">{t("Who should discuss testing", "किसे जांच पर बात करनी चाहिए")}</p><h2>{t("Common risk factors", "सामान्य जोखिम कारक")}</h2></div>
            </div>
            <div className="risk-ledger">
              {riskFactors.map((factor, index) => <div key={factor.title[0]}><span>{String(index + 1).padStart(2, "0")}</span><h3>{t(factor.title[0], factor.title[1])}</h3><p>{t(factor.copy[0], factor.copy[1])}</p></div>)}
            </div>
          </section>

          <section id="symptoms" className="guide-chapter">
            <div className="guide-chapter__heading">
              <span>04</span>
              <div><p className="section-kicker">{t("What the body may signal", "शरीर क्या संकेत दे सकता है")}</p><h2>{t("Symptoms and warning signs", "लक्षण और चेतावनी संकेत")}</h2></div>
            </div>
            <div className="silent-warning"><strong>{t("Important", "महत्वपूर्ण")}</strong><p>{t("Early kidney disease often causes no obvious symptoms. Symptoms alone cannot confirm or rule out CKD.", "शुरुआती किडनी रोग में अक्सर स्पष्ट लक्षण नहीं होते। केवल लक्षण सीकेडी की पुष्टि या उसे खारिज नहीं कर सकते।")}</p></div>
            <ul className="symptom-ledger">
              {symptoms.map(([en, hi], index) => <li key={en}><span>{String(index + 1).padStart(2, "0")}</span>{t(en, hi)}</li>)}
            </ul>
            <div className="urgent-strip">
              <span aria-hidden="true">URGENT</span>
              <div><strong>{t("Get urgent help for severe symptoms", "गंभीर लक्षणों में तुरंत मदद लें")}</strong><p>{t("Seek urgent medical care for chest pain, severe breathing difficulty, fainting, confusion, sudden major swelling, or very low urine output.", "सीने में दर्द, सांस लेने में गंभीर कठिनाई, बेहोशी, भ्रम, अचानक बहुत अधिक सूजन या बहुत कम पेशाब होने पर तुरंत चिकित्सा सहायता लें।")}</p></div>
            </div>
          </section>

          <section id="tests" className="guide-chapter">
            <div className="guide-chapter__heading">
              <span>05</span>
              <div><p className="section-kicker">{t("Useful measurements", "उपयोगी माप")}</p><h2>{t("Four results worth recognising", "चार परिणाम जिन्हें समझना उपयोगी है")}</h2></div>
            </div>
            <div className="test-index">
              {tests.map((test) => <div key={test.code}><code>{test.code}</code><div><h3>{t(test.title[0], test.title[1])}</h3><p>{t(test.copy[0], test.copy[1])}</p></div></div>)}
            </div>
          </section>

          <section id="next" className="guide-chapter guide-next">
            <div className="guide-chapter__heading">
              <span>06</span>
              <div><p className="section-kicker">{t("Prepare for a conversation", "बातचीत की तैयारी")}</p><h2>{t("What to ask next", "आगे क्या पूछें")}</h2></div>
            </div>
            <ol>
              <li>{t("Do my eGFR and urine albumin results need to be repeated?", "क्या मेरे eGFR और मूत्र एल्ब्यूमिन परिणाम दोबारा जांचे जाने चाहिए?")}</li>
              <li>{t("How do these results compare with my previous reports?", "ये परिणाम मेरी पिछली रिपोर्टों से कैसे तुलना करते हैं?")}</li>
              <li>{t("Could medicines, dehydration, infection, or another condition affect these numbers?", "क्या दवाएं, पानी की कमी, संक्रमण या कोई अन्य स्थिति इन आंकड़ों को प्रभावित कर सकती है?")}</li>
              <li>{t("Should I speak with a kidney specialist?", "क्या मुझे किडनी विशेषज्ञ से बात करनी चाहिए?")}</li>
            </ol>
            <div className="guide-next__actions">
              <Button asChild><Link href="/diagnosis">{t("Organise my report", "अपनी रिपोर्ट व्यवस्थित करें")}<ArrowRight /></Link></Button>
              <Button asChild variant="outline"><Link href="/symptom-checker">{t("Review symptoms", "लक्षण देखें")}</Link></Button>
            </div>
          </section>

          <section className="guide-sources" aria-labelledby="guide-sources-title">
            <h2 id="guide-sources-title">{t("Clinical reading sources", "चिकित्सकीय जानकारी के स्रोत")}</h2>
            <p>{t("These links provide fuller clinical context. NephroCare summarises them for education and does not replace professional interpretation.", "ये लिंक अधिक विस्तृत चिकित्सकीय संदर्भ देते हैं। नेफ्रोकेयर इन्हें शिक्षा के लिए सरल रूप में प्रस्तुत करता है और पेशेवर व्याख्या का स्थान नहीं लेता।")}</p>
            <a href="https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis" target="_blank" rel="noopener noreferrer">NIDDK: CKD tests and diagnosis <ExternalLink /></a>
            <a href="https://www.nhs.uk/conditions/kidney-disease/diagnosis/" target="_blank" rel="noopener noreferrer">NHS: CKD diagnosis and stages <ExternalLink /></a>
          </section>
        </article>
      </div>
    </div>
  );
}
