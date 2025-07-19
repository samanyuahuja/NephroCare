import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, AlertTriangle, Shield, User, Code, Globe, TrendingDown, Calendar, Stethoscope } from "lucide-react";
import { useLanguage, t } from "@/hooks/useLanguage";

export default function AboutCKD() {
  const { language } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">
          {t("About Chronic Kidney Disease", "क्रोनिक किडनी रोग के बारे में")}
        </h1>
        <p className="text-muted-foreground">
          {t("Complete guide to understanding CKD, stages, and prevention", "सीकेडी, चरणों और रोकथाम को समझने के लिए पूर्ण गाइड")}
        </p>
      </div>

      {/* What is CKD Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-3 h-5 w-5 text-red-500" />
            {t("What is Chronic Kidney Disease?", "क्रोनिक किडनी रोग क्या है?")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t("Chronic Kidney Disease (CKD) is a long-term condition where the kidneys gradually lose their ability to filter waste and excess water from the blood. Unlike acute kidney injury, CKD develops slowly over months or years and is usually irreversible.", "क्रोनिक किडनी रोग (सीकेडी) एक दीर्घकालिक स्थिति है जहां गुर्दे धीरे-धीरे रक्त से अपशिष्ट और अतिरिक्त पानी को फिल्टर करने की अपनी क्षमता खो देते हैं। तीव्र गुर्दे की चोट के विपरीत, सीकेडी महीनों या वर्षों में धीरे-धीरे विकसित होता है और आमतौर पर अपरिवर्तनीय होता है।")}
          </p>
          
          <p className="text-muted-foreground">
            {t("Your kidneys filter about 50 gallons of blood every day, removing toxins and maintaining the right balance of water, salts, and minerals in your body. When kidney function declines, harmful wastes can build up, leading to serious health complications.", "आपके गुर्दे प्रतिदिन लगभग 50 गैलन रक्त को फिल्टर करते हैं, विषाक्त पदार्थों को हटाते हैं और आपके शरीर में पानी, नमक और खनिजों का सही संतुलन बनाए रखते हैं। जब गुर्दे की कार्यक्षमता घटती है, तो हानिकारक अपशिष्ट जमा हो सकते हैं, जिससे गंभीर स्वास्थ्य जटिलताएं हो सकती हैं।")}
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900">{t("Key Facts About CKD:", "सीकेडी के बारे में मुख्य तथ्य:")}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t("Affects over 850 million people worldwide", "दुनियाभर में 85 करोड़ से अधिक लोगों को प्रभावित करता है")}</li>
              <li>• {t("Often called a \"silent killer\" - symptoms appear late", "अक्सर \"मूक हत्यारा\" कहा जाता है - लक्षण देर से दिखाई देते हैं")}</li>
              <li>• {t("Leading cause of kidney failure requiring dialysis", "डायलिसिस की आवश्यकता वाली गुर्दे की विफलता का प्रमुख कारण")}</li>
              <li>• {t("Major risk factor for heart disease and stroke", "हृदय रोग और स्ट्रोक के लिए प्रमुख जोखिम कारक")}</li>
              <li>• {t("Early detection can slow or prevent progression", "प्रारंभिक पहचान प्रगति को धीमा या रोक सकती है")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* CKD Stages */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="mr-3 h-5 w-5 text-orange-500" />
            {t("CKD Stages (1-5)", "सीकेडी चरण (1-5)")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground mb-4">
            {t("CKD is classified into 5 stages based on estimated Glomerular Filtration Rate (eGFR), which measures how well your kidneys filter blood.", "सीकेडी को अनुमानित ग्लोमेरुलर फिल्ट्रेशन रेट (ईजीएफआर) के आधार पर 5 चरणों में वर्गीकृत किया गया है, जो मापता है कि आपके गुर्दे कितनी अच्छी तरह रक्त को फिल्टर करते हैं।")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Stage 1 - Normal/High</h4>
                  <Badge variant="default" className="bg-green-100 text-green-800">eGFR ≥90</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Normal kidney function with kidney damage (protein in urine, structural abnormalities)
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Stage 2 - Mild</h4>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">eGFR 60-89</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mild decrease in kidney function with evidence of kidney damage
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Stage 3a - Moderate</h4>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">eGFR 45-59</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Moderate decrease in kidney function. Time to see a nephrologist.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Stage 3b - Moderate</h4>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">eGFR 30-44</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Moderate to severe decrease. Prepare for kidney replacement therapy.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Stage 4 - Severe</h4>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">eGFR 15-29</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Severe decrease in kidney function. Plan for dialysis or transplant.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Stage 5 - Kidney Failure</h4>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">eGFR &lt;15</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Kidney failure. Dialysis or kidney transplant needed to sustain life.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-3 h-5 w-5 text-yellow-500" />
            CKD Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-red-700">High Risk Factors</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Diabetes:</strong> Leading cause of CKD worldwide</li>
                <li>• <strong>High Blood Pressure:</strong> Damages kidney blood vessels</li>
                <li>• <strong>Family History:</strong> Genetic predisposition to kidney disease</li>
                <li>• <strong>Age 60+:</strong> Natural decline in kidney function</li>
                <li>• <strong>Heart Disease:</strong> Shared risk factors with CKD</li>
                <li>• <strong>Obesity:</strong> Increases diabetes and hypertension risk</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-orange-700">Moderate Risk Factors</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Smoking:</strong> Damages blood vessels and reduces flow</li>
                <li>• <strong>Ethnicity:</strong> Higher rates in South Asian, African populations</li>
                <li>• <strong>Autoimmune Diseases:</strong> Lupus, vasculitis</li>
                <li>• <strong>Kidney Stones:</strong> Recurrent stones can cause damage</li>
                <li>• <strong>Medications:</strong> Long-term NSAIDs, certain antibiotics</li>
                <li>• <strong>Urinary Tract Issues:</strong> Blockages, infections</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms and Warning Signs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="mr-3 h-5 w-5 text-blue-500" />
            Symptoms and Warning Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 font-medium">
              ⚠️ Important: CKD often has no symptoms in early stages. Regular screening is essential for those at risk.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Early Stage Symptoms</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Fatigue and weakness</li>
                <li>• Difficulty concentrating</li>
                <li>• Trouble sleeping</li>
                <li>• Decreased appetite</li>
                <li>• Muscle cramps</li>
                <li>• Swollen feet and ankles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Advanced Stage Symptoms</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Nausea and vomiting</li>
                <li>• Changes in urination (frequency, color)</li>
                <li>• Shortness of breath</li>
                <li>• Metallic taste in mouth</li>
                <li>• Persistent itching</li>
                <li>• High blood pressure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prevention and Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-3 h-5 w-5 text-green-500" />
            Prevention and Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Lifestyle Modifications</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Control Blood Sugar:</strong> Keep HbA1c &lt; 7% for diabetics</li>
                <li>• <strong>Manage Blood Pressure:</strong> Target &lt; 130/80 mmHg</li>
                <li>• <strong>Healthy Diet:</strong> Low sodium, limit protein if advanced CKD</li>
                <li>• <strong>Regular Exercise:</strong> 150 minutes moderate activity per week</li>
                <li>• <strong>Quit Smoking:</strong> Improves circulation and slows progression</li>
                <li>• <strong>Maintain Healthy Weight:</strong> BMI 18.5-24.9</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Medical Management</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Regular Monitoring:</strong> Blood tests every 3-6 months</li>
                <li>• <strong>ACE Inhibitors/ARBs:</strong> Protect kidney function</li>
                <li>• <strong>Treat Complications:</strong> Anemia, bone disease, acidosis</li>
                <li>• <strong>Avoid Nephrotoxins:</strong> NSAIDs, contrast dyes</li>
                <li>• <strong>Vaccinations:</strong> Flu, pneumonia, hepatitis B</li>
                <li>• <strong>Prepare for RRT:</strong> Dialysis access or transplant planning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing and Diagnosis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-3 h-5 w-5 text-purple-500" />
            Key Laboratory Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Blood Tests</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Serum Creatinine:</strong> Normal: 0.6-1.2 mg/dL</li>
                <li>• <strong>eGFR:</strong> Normal: ≥90 mL/min/1.73m²</li>
                <li>• <strong>Blood Urea Nitrogen (BUN):</strong> Normal: 7-20 mg/dL</li>
                <li>• <strong>Hemoglobin:</strong> CKD anemia if &lt;13 (men), &lt;12 (women)</li>
                <li>• <strong>Phosphorus:</strong> Elevated in advanced CKD</li>
                <li>• <strong>Calcium:</strong> Often low in CKD</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Urine Tests</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Protein (Albumin):</strong> Normal: &lt;30 mg/g creatinine</li>
                <li>• <strong>Specific Gravity:</strong> Normal: 1.005-1.030</li>
                <li>• <strong>Microscopy:</strong> RBCs, WBCs, casts</li>
                <li>• <strong>24-hour Collection:</strong> Total protein excretion</li>
                <li>• <strong>Microalbumin:</strong> Early diabetic nephropathy marker</li>
                <li>• <strong>Creatinine Clearance:</strong> Direct GFR measurement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* When to See a Doctor */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-3 h-5 w-5 text-red-500" />
            When to See a Doctor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-red-800 font-medium">
              🚨 Seek immediate medical attention if you experience:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-red-700">Emergency Signs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Severe swelling (face, hands, feet)</li>
                <li>• Difficulty breathing or chest pain</li>
                <li>• Seizures or confusion</li>
                <li>• Blood in urine or very dark urine</li>
                <li>• Severe nausea and vomiting</li>
                <li>• Extreme fatigue or weakness</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-orange-700">Regular Screening Needed</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• People with diabetes (annually)</li>
                <li>• High blood pressure patients</li>
                <li>• Family history of kidney disease</li>
                <li>• Age 60+ (every 2 years)</li>
                <li>• Taking nephrotoxic medications</li>
                <li>• Previous kidney problems</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About NephroCare */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-3 h-5 w-5 text-blue-500" />
            About NephroCare Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            NephroCare is an intelligent CKD screening and awareness platform built to help users 
            assess their kidney health using clinical lab values, symptoms, and medical history. 
            The platform delivers personalized insights, diet recommendations, and risk assessments 
            to support early detection and management of chronic kidney disease.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900">Platform Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Advanced ML-based CKD risk prediction using 20+ clinical parameters</li>
              <li>• Interactive symptom checker for quick self-assessment</li>
              <li>• Personalized diet plans with vegetarian/non-vegetarian options</li>
              <li>• NephroBot chatbot for medical questions and guidance</li>
              <li>• Hindi/English language support for wider accessibility</li>
              <li>• Visual explanations (SHAP, PDP, LIME) for prediction transparency</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800 font-medium">
              ⚠️ Medical Disclaimer: This platform is for educational and screening purposes only. 
              Always consult healthcare professionals for proper medical diagnosis and treatment. 
              Do not use this tool as a substitute for professional medical advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}