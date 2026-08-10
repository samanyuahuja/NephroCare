import { useQuery } from "@tanstack/react-query";
import NumberFlow from "@number-flow/react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, TrendingUp, Lightbulb, Bot, Utensils, Download, MessageCircle, AlertTriangle, FileText, ShieldCheck } from "lucide-react";
import { useLanguage, t } from "@/hooks/useLanguage";
import { SHAPPlot } from "@/components/charts/SHAPPlot";
import { PDPPlot } from "@/components/charts/PDPPlot";
import { LIMEExplanation } from "@/components/charts/LIMEExplanation";
import type { CKDAssessment } from "@shared/schema";
import PageIntro from "@/components/PageIntro";
import { hasAssessmentAccess } from "@/lib/assessmentAccess";

interface ResultsProps {
  params: { id: string };
}

export default function Results({ params }: ResultsProps) {
  const assessmentId = parseInt(params.id);
  const { language } = useLanguage();

  const hasAccess = hasAssessmentAccess(assessmentId);

  const { data: assessment, isLoading, error } = useQuery<CKDAssessment>({
    queryKey: ["/api/ckd-assessment", assessmentId],
    enabled: !isNaN(assessmentId) && hasAccess,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600 mb-4">
            {t("Access denied. You can only view your own assessment results.", 
               "पहुंच अस्वीकृत। आप केवल अपने स्वयं के मूल्यांकन परिणाम देख सकते हैं।")}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            {t("If you just completed an assessment, please check your Browse page or try refreshing.", 
               "यदि आपने अभी मूल्यांकन पूरा किया है, तो कृपया अपना ब्राउज़ पृष्ठ देखें या रीफ्रेश करने का प्रयास करें।")}
          </p>
          <div className="space-y-2">
            <Link href="/browse">
              <Button variant="outline" className="w-full">
                {t("View Your Assessments", "अपने मूल्यांकन देखें")}
              </Button>
            </Link>
            <Link href="/diagnosis">
              <Button className="w-full">
                {t("Take New Assessment", "नया मूल्यांकन लें")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !assessment) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600">Failed to load assessment results.</p>
          <Link href="/diagnosis">
            <Button className="mt-4">Take New Assessment</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const riskScore = assessment.riskScore || 0;
  const riskLevel = assessment.riskLevel || "Low";
  
  // Parse SHAP features from visualization data
  let shapFeatures: any[] = [];
  let visualizationData: any = null;
  try {
    if (assessment.shapFeatures && typeof assessment.shapFeatures === 'string') {
      const parsed = JSON.parse(assessment.shapFeatures);
      visualizationData = parsed.visualizations;
      
      // Extract SHAP features from visualizations data
      if (visualizationData?.shap?.features && visualizationData?.shap?.values) {
        shapFeatures = visualizationData.shap.features.map((feature: string, index: number) => ({
          feature: feature,
          impact: visualizationData.shap.values[index] || 0,
          value: visualizationData.shap.values[index] || 0,
          type: (visualizationData.shap.values[index] || 0) > 0 ? 'negative' : 'positive' as 'positive' | 'negative'
        }));
      }
      
      // If no visualization data, create basic feature list for charts
      if (shapFeatures.length === 0) {
        const basicFeatures = [
          { feature: "Serum Creatinine", impact: assessment.serumCreatinine > 1.4 ? 0.3 : -0.1 },
          { feature: "Age", impact: assessment.age > 50 ? 0.1 : -0.05 },
          { feature: "Blood Pressure", impact: assessment.bloodPressure > 140 ? 0.15 : -0.05 },
          { feature: "Hemoglobin", impact: assessment.hemoglobin < 12 ? 0.12 : -0.03 },
          { feature: "Hypertension", impact: assessment.hypertension === "yes" ? 0.08 : -0.02 }
        ];
        
        shapFeatures = basicFeatures.map(f => ({
          ...f,
          value: f.impact,
          type: f.impact > 0 ? 'negative' : 'positive' as 'positive' | 'negative'
        }));
      }
    }
  } catch (error) {
    console.warn('Failed to parse SHAP features:', error);
    shapFeatures = [];
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'risk-high';
      case 'moderate': return 'risk-moderate';
      default: return 'risk-low';
    }
  };

  // Get personalized recommendations based on SHAP feature importance
  const getPersonalizedRecommendations = (assessment: CKDAssessment, shapFeatures: any[]) => {
    const recommendations = [];
    
    // High Creatinine (>1.4)
    if (assessment.serumCreatinine > 1.4) {
      recommendations.push({
        factor: t("High Serum Creatinine", "उच्च सीरम क्रिएटिनिन"),
        value: `${assessment.serumCreatinine} mg/dL`,
        severity: "high",
        causes: t(
          "Kidney damage, dehydration, certain medications, high protein diet",
          "गुर्दे की क्षति, निर्जलीकरण, कुछ दवाएं, उच्च प्रोटीन आहार"
        ),
        remedies: t(
          "Reduce protein intake, stay hydrated, avoid NSAIDs, monitor kidney function regularly",
          "प्रोटीन का सेवन कम करें, हाइड्रेटेड रहें, NSAIDs से बचें, नियमित रूप से गुर्दे की जांच कराएं"
        ),
        treatment: t(
          "Consult nephrologist, ACE inhibitors if prescribed, dietary counseling",
          "नेफ्रोलॉजिस्ट से सलाह लें, यदि निर्धारित हो तो ACE अवरोधक, आहार परामर्श"
        )
      });
    }

    // High Blood Pressure (>140)
    if (assessment.bloodPressure > 140) {
      recommendations.push({
        factor: t("High Blood Pressure", "उच्च रक्तचाप"),
        value: `${assessment.bloodPressure} mmHg`,
        severity: "high",
        causes: t(
          "Genetics, salt intake, stress, obesity, lack of exercise, kidney disease",
          "आनुवंशिकता, नमक का सेवन, तनाव, मोटापा, व्यायाम की कमी, गुर्दे की बीमारी"
        ),
        remedies: t(
          "Low sodium diet, regular exercise, stress management, weight loss, limit alcohol",
          "कम सोडियम आहार, नियमित व्यायाम, तनाव प्रबंधन, वजन कम करना, शराब सीमित करना"
        ),
        treatment: t(
          "BP medications (ACE inhibitors, ARBs), daily monitoring, lifestyle changes",
          "बीपी की दवाएं (ACE अवरोधक, ARBs), दैनिक निगरानी, जीवनशैली में बदलाव"
        )
      });
    }

    // Proteinuria (Albumin > 2)
    if (assessment.albumin > 2) {
      recommendations.push({
        factor: t("Proteinuria (High Albumin)", "प्रोटीनुरिया (उच्च एल्ब्यूमिन)"),
        value: `Level ${assessment.albumin}`,
        severity: "high",
        causes: t(
          "Kidney damage, diabetes, high BP, infections, autoimmune diseases",
          "गुर्दे की क्षति, मधुमेह, उच्च बीपी, संक्रमण, ऑटोइम्यून रोग"
        ),
        remedies: t(
          "Control diabetes and BP, reduce protein intake, avoid infections",
          "मधुमेह और बीपी को नियंत्रित करें, प्रोटीन का सेवन कम करें, संक्रमण से बचें"
        ),
        treatment: t(
          "ACE inhibitors/ARBs, diabetes management, regular urine tests",
          "ACE अवरोधक/ARBs, मधुमेह प्रबंधन, नियमित मूत्र परीक्षण"
        )
      });
    }

    // Low Hemoglobin (<10)
    if (assessment.hemoglobin < 10) {
      recommendations.push({
        factor: t("Low Hemoglobin (Anemia)", "कम हीमोग्लोबिन (एनीमिया)"),
        value: `${assessment.hemoglobin} g/dL`,
        severity: "moderate",
        causes: t(
          "Kidney disease, iron deficiency, chronic inflammation, poor nutrition",
          "गुर्दे की बीमारी, आयरन की कमी, पुरानी सूजन, खराब पोषण"
        ),
        remedies: t(
          "Iron-rich foods, vitamin B12/folate supplements, treat underlying kidney disease",
          "आयरन युक्त खाद्य पदार्थ, विटामिन B12/फोलेट सप्लीमेंट, अंतर्निहित गुर्दे की बीमारी का इलाज"
        ),
        treatment: t(
          "Iron supplements, EPO injections if severe, treat CKD cause",
          "आयरन सप्लीमेंट, यदि गंभीर हो तो EPO इंजेक्शन, CKD के कारण का इलाज"
        )
      });
    }

    // High Blood Glucose / Plasma Glucose (>150)
    if (assessment.bloodGlucoseRandom > 150) {
      recommendations.push({
        factor: t("High Blood Glucose / Plasma Glucose", "उच्च रक्त शर्करा / प्लाज्मा ग्लूकोज"),
        value: `${assessment.bloodGlucoseRandom} mg/dL`,
        severity: "high",
        causes: t(
          "Diabetes, insulin resistance, poor diet, stress, medications",
          "मधुमेह, इंसुलिन प्रतिरोध, खराब आहार, तनाव, दवाएं"
        ),
        remedies: t(
          "Low carb diet, regular exercise, weight management, stress reduction",
          "कम कार्ब आहार, नियमित व्यायाम, वजन प्रबंधन, तनाव कम करना"
        ),
        treatment: t(
          "Diabetes medications, insulin therapy, regular glucose monitoring",
          "मधुमेह की दवाएं, इंसुलिन थेरेपी, नियमित ग्लूकोज निगरानी"
        )
      });
    }

    // Age factor (>60)
    if (assessment.age > 60) {
      recommendations.push({
        factor: t("Advanced Age", "बढ़ती उम्र"),
        value: `${assessment.age} years`,
        severity: "moderate",
        causes: t(
          "Natural aging process, decreased kidney function, accumulation of health issues",
          "प्राकृतिक उम्र बढ़ने की प्रक्रिया, गुर्दे की कार्यप्रणाली में कमी, स्वास्थ्य समस्याओं का संचय"
        ),
        remedies: t(
          "Regular health checkups, gentle exercise, balanced nutrition, medication compliance",
          "नियमित स्वास्थ्य जांच, हल्का व्यायाम, संतुलित पोषण, दवाओं का अनुपालन"
        ),
        treatment: t(
          "Preventive care, regular kidney monitoring, manage comorbidities",
          "निवारक देखभाल, नियमित गुर्दे की निगरानी, सहरुग्णता का प्रबंधन"
        )
      });
    }

    // Medical History factors - Only add if explicitly "yes"
    if (assessment.hypertension === "yes") {
      recommendations.push({
        factor: t("Hypertension History", "उच्च रक्तचाप का इतिहास"),
        value: "Present",
        severity: "high",
        causes: t(
          "Chronic kidney damage, cardiovascular complications, medication side effects",
          "पुरानी गुर्दे की क्षति, हृदय संबंधी जटिलताएं, दवा के दुष्प्रभाव"
        ),
        remedies: t(
          "Strict BP control, DASH diet, regular monitoring, medication adherence",
          "सख्त बीपी नियंत्रण, DASH आहार, नियमित निगरानी, दवा का पालन"
        ),
        treatment: t(
          "Antihypertensive therapy, lifestyle modifications, cardio-renal protection",
          "एंटीहाइपरटेंसिव थेरेपी, जीवनशैली में संशोधन, कार्डियो-रीनल सुरक्षा"
        )
      });
    }

    if (assessment.diabetesMellitus === "yes") {
      recommendations.push({
        factor: t("Diabetes Mellitus", "मधुमेह"),
        value: "Present",
        severity: "high",
        causes: t(
          "Diabetic nephropathy, poor glucose control, advanced glycation",
          "मधुमेह नेफ्रोपैथी, खराब ग्लूकोज नियंत्रण, उन्नत ग्लाइकेशन"
        ),
        remedies: t(
          "Tight glucose control, kidney-friendly diet, regular HbA1c monitoring",
          "सख्त ग्लूकोज नियंत्रण, गुर्दे के अनुकूल आहार, नियमित HbA1c निगरानी"
        ),
        treatment: t(
          "Diabetes management, ACE inhibitors, nephrology referral",
          "मधुमेह प्रबंधन, ACE अवरोधक, नेफ्रोलॉजी रेफरल"
        )
      });
    }

    // If no SHAP features provided, fall back to hardcoded logic
    if (!shapFeatures || shapFeatures.length === 0) {
      // Return top 3 recommendations sorted by severity
      return recommendations
        .sort((a, b) => (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0))
        .slice(0, 3);
    }

    // Use SHAP features to get top 3 features that are negatively affecting (increasing risk)
    const negativeFeatures = shapFeatures
      .filter(feature => feature.impact > 0) // Positive impact means increasing risk (negative for health)
      .sort((a, b) => b.impact - a.impact) // Sort by highest risk contribution first
      .slice(0, 3);
    
    // If no negative features found, fallback to hardcoded recommendations
    if (negativeFeatures.length === 0) {
      return recommendations
        .sort((a, b) => (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0))
        .slice(0, 3);
    }

    const shapRecommendations = negativeFeatures.map(feature => {
      const featureName = feature.feature.toLowerCase();
      
      // Map SHAP features to recommendations
      if (featureName.includes('creatinine')) {
        return {
          factor: t("High Serum Creatinine", "उच्च सीरम क्रिएटिनिन"),
          value: feature.feature.match(/\((.*?)\)/)?.[1] || `${assessment.serumCreatinine} mg/dL`,
          severity: "high",
          shapImpact: Math.abs(feature.impact),
          causes: t(
            "Kidney damage, dehydration, certain medications, high protein diet",
            "गुर्दे की क्षति, निर्जलीकरण, कुछ दवाएं, उच्च प्रोटीन आहार"
          ),
          remedies: t(
            "Reduce protein intake, stay hydrated, avoid NSAIDs, monitor kidney function regularly",
            "प्रोटीन का सेवन कम करें, हाइड्रेटेड रहें, NSAIDs से बचें, नियमित रूप से गुर्दे की जांच कराएं"
          ),
          treatment: t(
            "Consult nephrologist, ACE inhibitors if prescribed, dietary counseling",
            "नेफ्रोलॉजिस्ट से सलाह लें, यदि निर्धारित हो तो ACE अवरोधक, आहार परामर्श"
          )
        };
      } else if (featureName.includes('hemoglobin')) {
        return {
          factor: t("Low Hemoglobin (Anemia)", "कम हीमोग्लोबिन (एनीमिया)"),
          value: feature.feature.match(/\((.*?)\)/)?.[1] || `${assessment.hemoglobin} g/dL`,
          severity: "moderate",
          shapImpact: Math.abs(feature.impact),
          causes: t(
            "Kidney disease, iron deficiency, chronic inflammation, poor nutrition",
            "गुर्दे की बीमारी, आयरन की कमी, पुरानी सूजन, खराब पोषण"
          ),
          remedies: t(
            "Iron-rich foods, vitamin B12/folate supplements, treat underlying kidney disease",
            "आयरन युक्त खाद्य पदार्थ, विटामिन B12/फोलेट सप्लीमेंट, अंतर्निहित गुर्दे की बीमारी का इलाज"
          ),
          treatment: t(
            "Iron supplements, EPO injections if severe, treat CKD cause",
            "आयरन सप्लीमेंट, यदि गंभीर हो तो EPO इंजेक्शन, CKD के कारण का इलाज"
          )
        };
      } else if (featureName.includes('urea')) {
        return {
          factor: t("High Blood Urea", "उच्च रक्त यूरिया"),
          value: feature.feature.match(/\((.*?)\)/)?.[1] || `${assessment.bloodUrea} mg/dL`,
          severity: "moderate", 
          shapImpact: Math.abs(feature.impact),
          causes: t(
            "Kidney function decline, dehydration, high protein diet, certain medications",
            "गुर्दे की कार्यप्रणाली में गिरावट, निर्जलीकरण, उच्च प्रोटीन आहार, कुछ दवाएं"
          ),
          remedies: t(
            "Moderate protein diet, adequate hydration, avoid nephrotoxic drugs",
            "मध्यम प्रोटीन आहार, पर्याप्त हाइड्रेशन, नेफ्रोटॉक्सिक दवाओं से बचें"
          ),
          treatment: t(
            "Kidney function monitoring, dietary counseling, manage underlying conditions",
            "गुर्दे की कार्यप्रणाली की निगरानी, आहार परामर्श, अंतर्निहित स्थितियों का प्रबंधन"
          )
        };
      } else if (featureName.includes('age')) {
        return {
          factor: t("Age-Related Risk", "आयु संबंधी जोखिम"),
          value: feature.feature.match(/\((.*?)\)/)?.[1] || `${assessment.age} years`,
          severity: "moderate",
          shapImpact: Math.abs(feature.impact),
          causes: t(
            "Natural aging process, decreased kidney function, accumulation of health issues",
            "प्राकृतिक उम्र बढ़ने की प्रक्रिया, गुर्दे की कार्यप्रणाली में कमी, स्वास्थ्य समस्याओं का संचय"
          ),
          remedies: t(
            "Regular health checkups, gentle exercise, balanced nutrition, medication compliance",
            "नियमित स्वास्थ्य जांच, हल्का व्यायाम, संतुलित पोषण, दवाओं का अनुपालन"
          ),
          treatment: t(
            "Preventive care, regular kidney monitoring, manage comorbidities",
            "निवारक देखभाल, नियमित गुर्दे की निगरानी, सहरुग्णता का प्रबंधन"
          )
        };
      } else {
        // Default recommendation for any other SHAP feature
        return {
          factor: feature.feature,
          value: feature.feature.match(/\((.*?)\)/)?.[1] || "Abnormal",
          severity: Math.abs(feature.impact) > 0.3 ? "high" : "moderate",
          shapImpact: Math.abs(feature.impact),
          causes: t(
            "Multiple factors contributing to kidney disease risk",
            "गुर्दे की बीमारी के जोखिम में योगदान देने वाले कई कारक"
          ),
          remedies: t(
            "Follow medical advice, maintain healthy lifestyle, regular monitoring",
            "चिकित्सा सलाह का पालन करें, स्वस्थ जीवनशैली बनाए रखें, नियमित निगरानी"
          ),
          treatment: t(
            "Consult healthcare provider for specific management plan",
            "विशिष्ट प्रबंधन योजना के लिए स्वास्थ्य सेवा प्रदाता से सलाह लें"
          )
        };
      }
    });

    return shapRecommendations;
  };

  const personalizedRecommendations = getPersonalizedRecommendations(assessment, shapFeatures);

  const getRiskBadgeVariant = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('high')) return 'destructive' as const;
    if (lowerLevel.includes('moderate')) return 'secondary' as const;
    return 'default' as const;
  };

  const downloadReport = async () => {
    try {
      const { generateAssessmentPDF } = await import("@/lib/pdfGenerator");
      await generateAssessmentPDF(assessment);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  const riskPercent = Math.max(0, Math.min(100, riskScore * 100));
  const riskTone = riskLevel.toLowerCase().includes("high") ? "high" : riskLevel.toLowerCase().includes("moderate") ? "moderate" : "low";
  const topFactors = [...shapFeatures].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5);
  const reportDate = assessment.createdAt
    ? new Date(assessment.createdAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : t("Date unavailable", "तारीख उपलब्ध नहीं");

  return (
    <div className="results-page app-page">
      <PageIntro
        eyebrow={t("Preliminary screening report", "प्रारंभिक स्क्रीनिंग रिपोर्ट")}
        title={t("Your result, with the reasoning visible.", "आपका परिणाम, स्पष्ट कारणों के साथ।")}
        description={t("Review the estimate, inspect the factors behind it, then take the full report to a qualified clinician.", "अनुमान देखें, उसके कारण समझें और पूरी रिपोर्ट योग्य चिकित्सक के पास ले जाएं।")}
        actions={<><Button onClick={downloadReport}><Download />{t("Download report", "रिपोर्ट डाउनलोड करें")}</Button><Button asChild variant="outline"><Link href={`/diet-plan/${assessmentId}`}><Utensils />{t("Open diet guidance", "आहार मार्गदर्शन खोलें")}</Link></Button></>}
        aside={<div className="report-id"><FileText aria-hidden="true" /><span>{t("Report", "रिपोर्ट")}</span><strong>NC-{String(assessmentId).padStart(4, "0")}</strong><small>{reportDate}</small></div>}
      />

      <section className={`risk-summary risk-summary--${riskTone}`} aria-labelledby="risk-summary-title">
        <div className="risk-dial" style={{ "--risk-value": `${riskPercent * 3.6}deg` } as React.CSSProperties}>
          <div><NumberFlow value={riskPercent} format={{ maximumFractionDigits: 1 }} /><span>%</span><small>{t("screening estimate", "स्क्रीनिंग अनुमान")}</small></div>
        </div>
        <div className="risk-summary__copy"><p className="section-kicker">{t("Result context", "परिणाम संदर्भ")}</p><h2 id="risk-summary-title">{riskLevel} {t("risk indication", "जोखिम संकेत")}</h2><p>{t(riskTone === "high" ? "This estimate needs prompt clinical review. It cannot confirm CKD or explain the cause by itself." : riskTone === "moderate" ? "This estimate deserves timely review with a clinician and comparison with repeat laboratory testing." : "This estimate is lower, but it cannot rule out kidney disease or replace recommended testing.", riskTone === "high" ? "इस अनुमान की शीघ्र चिकित्सकीय समीक्षा जरूरी है। यह अकेले सीकेडी की पुष्टि या कारण नहीं बता सकता।" : riskTone === "moderate" ? "इस अनुमान की समय पर चिकित्सकीय समीक्षा और दोबारा लैब जांच से तुलना जरूरी है।" : "यह अनुमान कम है, लेकिन किडनी रोग को खारिज या आवश्यक जांच का स्थान नहीं ले सकता।")}</p></div>
        <div className="risk-summary__facts"><div><span>{t("Patient", "रोगी")}</span><strong>{assessment.patientName}</strong></div><div><span>{t("Age", "आयु")}</span><strong>{assessment.age}</strong></div><div><span>{t("Creatinine", "क्रिएटिनिन")}</span><strong>{assessment.serumCreatinine} mg/dL</strong></div><div><span>{t("Blood pressure", "रक्तचाप")}</span><strong>{assessment.bloodPressure} mmHg</strong></div></div>
      </section>

      <section className="factor-section" aria-labelledby="factor-title">
        <div className="section-intro"><p className="section-kicker">{t("Model explanation", "मॉडल की व्याख्या")}</p><h2 id="factor-title">{t("What influenced this estimate", "इस अनुमान को किसने प्रभावित किया")}</h2><p>{t("Longer bars indicate a stronger influence in the model. They do not prove that a factor caused disease.", "लंबी पट्टियां मॉडल में अधिक प्रभाव दिखाती हैं। वे यह सिद्ध नहीं करतीं कि उसी कारक ने रोग पैदा किया।")}</p></div>
        <div className="factor-studio">
          <div className="factor-chart"><div className="studio-label"><BarChart3 />SHAP {t("feature importance", "फीचर प्रभाव")}</div><SHAPPlot features={shapFeatures} /></div>
          <div className="factor-ledger">
            {topFactors.length > 0 ? topFactors.map((factor, index) => <div key={`${factor.feature}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{factor.feature}</strong><p>{factor.impact > 0 ? t("Raised the model estimate", "मॉडल अनुमान बढ़ाया") : t("Lowered the model estimate", "मॉडल अनुमान घटाया")}</p></div><NumberFlow value={Math.abs(factor.impact * 100)} format={{ maximumFractionDigits: 1 }} /><small>%</small></div>) : <p className="factor-ledger__empty">{t("No factor detail was returned for this report.", "इस रिपोर्ट के लिए कारक विवरण उपलब्ध नहीं है।")}</p>}
          </div>
        </div>
      </section>

      <section className="explanation-section" aria-labelledby="explanation-title">
        <div className="section-intro"><p className="section-kicker">{t("Three ways to inspect", "समझने के तीन तरीके")}</p><h2 id="explanation-title">{t("Explore the model from different angles", "मॉडल को अलग-अलग दृष्टिकोण से देखें")}</h2></div>
        <div className="explanation-grid">
          <article><div className="studio-label"><TrendingUp />PDP</div><h3>{t("How one value changes the estimate", "एक मान अनुमान को कैसे बदलता है")}</h3><p>{t("The line shows the model's response as one input changes while other information is held steady.", "यह रेखा दिखाती है कि एक इनपुट बदलने पर मॉडल कैसे प्रतिक्रिया देता है, जबकि बाकी जानकारी स्थिर रहती है।")}</p><div className="explanation-visual"><PDPPlot assessment={assessment} /></div></article>
          <article><div className="studio-label"><Lightbulb />LIME</div><h3>{t("A local explanation for this report", "इस रिपोर्ट की स्थानीय व्याख्या")}</h3><p>{t("LIME approximates which inputs mattered near this specific prediction.", "LIME अनुमान लगाता है कि इस खास भविष्यवाणी के पास कौन-से इनपुट महत्वपूर्ण थे।")}</p><div className="explanation-visual"><LIMEExplanation features={shapFeatures} /></div></article>
        </div>
      </section>

      {personalizedRecommendations.length > 0 && (
        <section className="review-priorities" aria-labelledby="review-priorities-title">
          <div className="section-intro"><p className="section-kicker">{t("Appointment preparation", "अपॉइंटमेंट की तैयारी")}</p><h2 id="review-priorities-title">{t("Values to discuss with a clinician", "चिकित्सक से चर्चा करने वाले मान")}</h2><p>{t("These are conversation prompts, not treatment instructions.", "ये बातचीत के प्रश्न हैं, उपचार निर्देश नहीं।")}</p></div>
          <div className="priority-list">{personalizedRecommendations.slice(0, 4).map((recommendation, index) => <article key={`${recommendation.factor}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{recommendation.factor}</h3><p>{t("Entered value", "दर्ज मान")}: <strong>{recommendation.value}</strong></p></div><p>{t("Ask what this value means in the context of your history, medicines, symptoms, and repeat tests.", "पूछें कि आपके इतिहास, दवाओं, लक्षणों और दोबारा जांच के संदर्भ में इस मान का क्या अर्थ है।")}</p><AlertTriangle aria-hidden="true" /></article>)}</div>
        </section>
      )}

      <section className="results-next">
        <div><Bot aria-hidden="true" /><div><p className="section-kicker">{t("Need a simpler explanation?", "और आसान व्याख्या चाहिए?")}</p><h2>{t("Take a question to NephroBot", "नेफ्रोबॉट से प्रश्न पूछें")}</h2><p>{t("Use the assistant to unpack a term, then verify medical decisions with a qualified professional.", "किसी शब्द को समझने के लिए सहायक का उपयोग करें, फिर चिकित्सकीय निर्णय योग्य पेशेवर से जांचें।")}</p></div></div>
        <Button asChild><Link href="/chatbot"><MessageCircle />{t("Ask NephroBot", "नेफ्रोबॉट से पूछें")}<ArrowRight /></Link></Button>
      </section>

      <div className="medical-boundary"><ShieldCheck /><p>{t("This preliminary report cannot diagnose CKD, recommend medication, or determine treatment. Seek urgent care for severe or rapidly worsening symptoms.", "यह प्रारंभिक रिपोर्ट सीकेडी का निदान, दवा की सिफारिश या उपचार तय नहीं कर सकती। गंभीर या तेजी से बिगड़ते लक्षणों में तुरंत चिकित्सा सहायता लें।")}</p></div>
    </div>
  );
}
