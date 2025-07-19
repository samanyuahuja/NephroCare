import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Lightbulb, Bot, Utensils, Download, MessageCircle, Heart, Stethoscope, Pill, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage, t } from "@/hooks/useLanguage";
import { SHAPPlot } from "@/components/charts/SHAPPlot";
import { PDPPlot } from "@/components/charts/PDPPlot";
import { LIMEExplanation } from "@/components/charts/LIMEExplanation";
import type { CKDAssessment } from "@shared/schema";

interface ResultsProps {
  params: { id: string };
}

export default function Results({ params }: ResultsProps) {
  const assessmentId = parseInt(params.id);
  const { language } = useLanguage();

  const { data: assessment, isLoading, error } = useQuery<CKDAssessment>({
    queryKey: ["/api/ckd-assessment", assessmentId],
    enabled: !isNaN(assessmentId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
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
  const shapFeatures = assessment.shapFeatures ? JSON.parse(assessment.shapFeatures) : [];

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

    // High Blood Glucose (>150)
    if (assessment.bloodGlucoseRandom > 150) {
      recommendations.push({
        factor: t("High Blood Glucose", "उच्च रक्त शर्करा"),
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

    // Medical History factors
    if (assessment.hypertension) {
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

    if (assessment.diabetesMellitus) {
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

  const downloadReport = () => {
    // Generate and download PDF report
    const reportData = {
      riskScore,
      riskLevel,
      assessment,
      shapFeatures
    };
    
    // Create a simple text report for now
    const reportText = `
CKD Risk Assessment Report
==========================

Patient Information:
- Age: ${assessment.age}
- Blood Pressure: ${assessment.bloodPressure}
- Serum Creatinine: ${assessment.serumCreatinine}
- Hemoglobin: ${assessment.hemoglobin}

Risk Assessment:
- Risk Score: ${riskScore}%
- Risk Level: ${riskLevel}

Top Risk Factors:
${shapFeatures.map((f: any) => `- ${f.feature}: ${f.impact > 0 ? '+' : ''}${(f.impact * 100).toFixed(1)}%`).join('\n')}

Recommendations:
- Consult with a nephrologist for comprehensive evaluation
- Follow personalized diet plan recommendations
- Monitor kidney function regularly
- Maintain healthy lifestyle habits

This report is for informational purposes only and should not replace professional medical advice.
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ckd-assessment-report-${assessmentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Risk Score Card */}
      <Card>
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            CKD Risk Assessment Results
          </h1>
          
          <div className={`${
            riskLevel.toLowerCase().includes('high') ? 'bg-red-600' :
            riskLevel.toLowerCase().includes('moderate') ? 'bg-orange-600' :
            'bg-green-600'
          } text-white rounded-xl p-8 mb-6 inline-block`}>
            <div className="text-6xl font-bold mb-2">{(riskScore * 100).toFixed(1)}%</div>
            <div className="text-xl">CKD Risk Score</div>
          </div>
          
          <Badge variant={getRiskBadgeVariant(riskLevel)} className={`text-lg px-4 py-2 mb-6 ${
            riskLevel.toLowerCase().includes('high') ? 'bg-red-100 text-red-800 border-red-300' :
            riskLevel.toLowerCase().includes('moderate') ? 'bg-orange-100 text-orange-800 border-orange-300' :
            'bg-green-100 text-green-800 border-green-300'
          }`}>
            {riskLevel}
          </Badge>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Based on your medical parameters, our ML model indicates a {riskLevel.toLowerCase()} 
            for Chronic Kidney Disease. {riskLevel.toLowerCase().includes('high') ? 
            'Please consult with a healthcare professional for proper medical evaluation.' :
            'Continue monitoring your kidney health and maintain healthy lifestyle habits.'}
          </p>
        </CardContent>
      </Card>

      {/* Visual Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SHAP Plot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-primary" />
              SHAP Feature Importance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900">How to Read This Chart:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Red bars show factors increasing CKD risk</li>
                <li>• Blue bars show factors decreasing CKD risk</li>
                <li>• Longer bars = stronger impact on prediction</li>
                <li>• Numbers show how much each factor affects your risk score</li>
              </ul>
            </div>
            <SHAPPlot features={shapFeatures} />
          </CardContent>
        </Card>

        {/* PDP Plot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-3 h-5 w-5 text-primary" />
              Partial Dependence Plot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-900">How to Read This Chart:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Shows how changing one value affects CKD risk</li>
                <li>• Your current value is marked with a red dot</li>
                <li>• Higher line = higher CKD risk at that value</li>
                <li>• Normal ranges are shaded in green</li>
              </ul>
            </div>
            <PDPPlot 
              feature="Serum Creatinine" 
              value={assessment.serumCreatinine}
              unit="mg/dL"
            />
          </CardContent>
        </Card>

        {/* LIME Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-3 h-5 w-5 text-primary" />
              LIME Local Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-purple-900">How to Read This Analysis:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Shows which factors contributed most to YOUR specific result</li>
                <li>• Green text = factors that decreased your risk</li>
                <li>• Red text = factors that increased your risk</li>
                <li>• Percentages show the strength of each factor's influence</li>
              </ul>
            </div>
            <LIMEExplanation features={shapFeatures} />
          </CardContent>
        </Card>

        {/* AI Chatbot Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-3 h-5 w-5 text-primary" />
              NephroBot Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">NephroBot:</div>
              <div className="text-gray-800">
                {shapFeatures.length > 0 && shapFeatures[0].feature.includes('Creatinine') ? 
                  `Your ${shapFeatures[0].feature.toLowerCase()} is the primary risk factor. Normal levels are typically 0.6-1.2 mg/dL. Would you like to know more about managing creatinine levels?` :
                  "I can help explain your results and provide guidance on managing your kidney health. Feel free to ask any questions!"
                }
              </div>
            </div>
            <Link href="/chatbot">
              <Button className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask AI Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Recommendations */}
      {personalizedRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Pill className="mr-3 h-6 w-6 text-green-600" />
              {t("Personalized Health Recommendations", "व्यक्तिगत स्वास्थ्य सिफारिशें")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t("Top risk factors affecting your CKD assessment with causes, remedies, and treatments", "आपके CKD मूल्यांकन को प्रभावित करने वाले शीर्ष जोखिम कारक कारणों, उपचारों और उपचारों के साथ")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {personalizedRecommendations.map((rec, index) => (
                <Card key={index} className={`border-l-4 ${rec.severity === 'high' ? 'border-l-red-500 bg-red-50' : 'border-l-orange-500 bg-orange-50'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {index + 1}. {rec.factor}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t("Current Value", "वर्तमान मूल्य")}: <span className="font-medium">{rec.value}</span>
                        </p>
                      </div>
                      <Badge variant={rec.severity === 'high' ? 'destructive' : 'secondary'}>
                        {t(rec.severity === 'high' ? 'High Risk' : 'Moderate Risk', rec.severity === 'high' ? 'उच्च जोखिम' : 'मध्यम जोखिम')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <h4 className="font-semibold text-red-800">
                            {t("Causes", "कारण")}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {rec.causes}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-blue-600 mr-2" />
                          <h4 className="font-semibold text-blue-800">
                            {t("Remedies", "उपचार")}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {rec.remedies}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Stethoscope className="h-4 w-4 text-green-600 mr-2" />
                          <h4 className="font-semibold text-green-800">
                            {t("Medical Treatment", "चिकित्सा उपचार")}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {rec.treatment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {t("Important Note", "महत्वपूर्ण नोट")}
                  </h4>
                  <p className="text-sm text-blue-800">
                    {t(
                      "These recommendations are based on your assessment data and are for educational purposes only. Always consult with your healthcare provider before making any medical decisions or changes to your treatment plan.",
                      "ये सिफारिशें आपके मूल्यांकन डेटा पर आधारित हैं और केवल शैक्षिक उद्देश्यों के लिए हैं। कोई भी चिकित्सा निर्णय लेने या अपनी उपचार योजना में बदलाव करने से पहले हमेशा अपने स्वास्थ्य सेवा प्रदाता से सलाह लें।"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {t("Next Steps", "अगले कदम")}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/diet-plan/${assessmentId}`}>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Utensils className="mr-2 h-4 w-4" />
                {t("Generate AI Diet Plan", "AI आहार योजना बनाएं")}
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" />
              {t("Download Report", "रिपोर्ट डाउनलोड करें")}
            </Button>
            <Link href="/chatbot">
              <Button size="lg" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("Ask AI Questions", "AI से प्रश्न पूछें")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
