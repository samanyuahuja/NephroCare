import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, Stethoscope, CheckCircle, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage, t } from "@/hooks/useLanguage";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Symptom {
  id: string;
  name: string;
  description: string;
  severity: number; // 1-5 scale
  urgency: string; // low, moderate, high, urgent
  possibleCauses: string[];
}

const symptoms: Symptom[] = [
  {
    id: "fatigue",
    name: "Persistent fatigue",
    description: "Constant tiredness not relieved by rest, often due to anemia or toxin buildup in CKD.",
    severity: 2,
    urgency: "moderate",
    possibleCauses: ["Anemia", "Uremia", "Electrolyte imbalance"]
  },
  {
    id: "swelling",
    name: "Swelling in legs or ankles",
    description: "Fluid retention (edema) occurs when kidneys can't remove excess fluid from the body.",
    severity: 3,
    urgency: "high",
    possibleCauses: ["Fluid retention", "Heart failure", "Kidney dysfunction"]
  },
  {
    id: "urination",
    name: "Changes in urination (color, frequency)",
    description: "Frequency, color changes, or difficulty urinating may indicate kidney function decline.",
    severity: 3,
    urgency: "high",
    possibleCauses: ["Kidney function decline", "Urinary tract infection", "Diabetes"]
  },
  {
    id: "foamy",
    name: "Foamy urine",
    description: "Protein in urine (proteinuria) creates foam, indicating kidney filtering problems.",
    severity: 4,
    urgency: "high",
    possibleCauses: ["Proteinuria", "Kidney damage", "Glomerular disease"]
  },
  {
    id: "nausea",
    name: "Nausea or vomiting",
    description: "Toxin buildup in blood (uremia) can cause digestive symptoms in advanced CKD.",
    severity: 3,
    urgency: "moderate",
    possibleCauses: ["Uremia", "Metabolic acidosis", "Electrolyte imbalance"]
  },
  {
    id: "breath",
    name: "Shortness of breath",
    description: "Fluid in lungs or anemia can cause breathing difficulties in CKD patients.",
    severity: 4,
    urgency: "high",
    possibleCauses: ["Pulmonary edema", "Anemia", "Metabolic acidosis"]
  },
  {
    id: "appetite",
    name: "Loss of appetite",
    description: "Uremia and metabolic changes in CKD often reduce appetite and food intake.",
    severity: 2,
    urgency: "moderate",
    possibleCauses: ["Uremia", "Depression", "Medication side effects"]
  },
  {
    id: "blood",
    name: "Blood in urine (Hematuria)",
    description: "Visible or microscopic blood in urine may indicate kidney damage or disease.",
    severity: 5,
    urgency: "urgent",
    possibleCauses: ["Kidney stones", "Glomerulonephritis", "Tumor", "Infection"]
  },
  {
    id: "pressure",
    name: "High blood pressure",
    description: "Kidney disease and hypertension often occur together, worsening each other.",
    severity: 3,
    urgency: "high",
    possibleCauses: ["Kidney disease", "Essential hypertension", "Renovascular disease"]
  },
  {
    id: "skin",
    name: "Itchy or dry skin",
    description: "Persistent itching due to waste buildup in blood and mineral imbalances.",
    severity: 2,
    urgency: "low",
    possibleCauses: ["Uremic toxins", "Mineral imbalance", "Dry skin"]
  },
  {
    id: "concentration",
    name: "Trouble concentrating",
    description: "Mental fog or difficulty focusing on tasks due to uremic toxins.",
    severity: 2,
    urgency: "moderate",
    possibleCauses: ["Uremic encephalopathy", "Anemia", "Sleep disturbances"]
  },
  {
    id: "cramps",
    name: "Muscle cramps",
    description: "Involuntary muscle contractions, especially at night, due to electrolyte imbalances.",
    severity: 2,
    urgency: "low",
    possibleCauses: ["Electrolyte imbalance", "Fluid overload", "Mineral deficiency"]
  },
  {
    id: "backpain",
    name: "Back pain near the kidneys",
    description: "Persistent pain in lower back or flank area, possibly indicating kidney problems.",
    severity: 3,
    urgency: "moderate",
    possibleCauses: ["Kidney stones", "Kidney infection", "Polycystic kidney disease"]
  }
];

interface AssessmentResult {
  totalScore: number;
  riskLevel: string;
  urgency: string;
  recommendations: string[];
  selectedSymptoms: Symptom[];
}

export default function SymptomChecker() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const calculateAssessment = (): AssessmentResult => {
    const selectedSymptomData = symptoms.filter(s => selectedSymptoms.includes(s.id));
    
    if (selectedSymptomData.length === 0) {
      return {
        totalScore: 0,
        riskLevel: "No Symptoms",
        urgency: "none",
        recommendations: ["No symptoms selected. Consider regular health checkups."],
        selectedSymptoms: []
      };
    }

    const totalScore = selectedSymptomData.reduce((sum, symptom) => sum + symptom.severity, 0);
    const avgSeverity = totalScore / selectedSymptomData.length;
    const hasUrgentSymptoms = selectedSymptomData.some(s => s.urgency === "urgent");
    const hasHighUrgency = selectedSymptomData.some(s => s.urgency === "high");

    let riskLevel: string;
    let urgency: string;
    let recommendations: string[];

    if (hasUrgentSymptoms || totalScore >= 15) {
      riskLevel = "High Concern";
      urgency = "urgent";
      recommendations = [
        "Seek immediate medical attention",
        "Contact a nephrologist or emergency department",
        "Do not delay treatment",
        "Bring a list of all medications and medical history"
      ];
    } else if (hasHighUrgency || totalScore >= 10) {
      riskLevel = "Moderate Concern";
      urgency = "high";
      recommendations = [
        "Schedule an appointment with your doctor within 1-2 weeks",
        "Consider consulting a nephrologist",
        "Monitor symptoms closely",
        "Start keeping a symptom diary"
      ];
    } else if (totalScore >= 5) {
      riskLevel = "Low Concern";
      urgency = "moderate";
      recommendations = [
        "Discuss symptoms with your primary care physician",
        "Consider basic kidney function tests",
        "Maintain healthy lifestyle habits",
        "Monitor blood pressure regularly"
      ];
    } else {
      riskLevel = "Minimal Concern";
      urgency = "low";
      recommendations = [
        "Continue regular health maintenance",
        "Stay hydrated and maintain healthy diet",
        "Monitor for any worsening symptoms",
        "Consider annual kidney function screening"
      ];
    }

    return {
      totalScore,
      riskLevel,
      urgency,
      recommendations,
      selectedSymptoms: selectedSymptomData
    };
  };

  const handleSubmit = () => {
    const result = calculateAssessment();
    setAssessment(result);
    setShowResults(true);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High Concern": return "bg-red-100 text-red-800 border-red-300";
      case "Moderate Concern": return "bg-orange-100 text-orange-800 border-orange-300";
      case "Low Concern": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "urgent": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "high": return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "moderate": return <Info className="h-5 w-5 text-blue-600" />;
      default: return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  if (showResults && assessment) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">{t("Symptom Assessment Results", "लक्षण मूल्यांकन परिणाम")}</h1>
          <p className="text-muted-foreground">
            {t("Based on your selected symptoms, here's your kidney health assessment", "आपके चुने गए लक्षणों के आधार पर, यहाँ आपका गुर्दे स्वास्थ्य मूल्यांकन है")}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Assessment Summary</span>
              {getUrgencyIcon(assessment.urgency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Symptoms Selected</p>
                <p className="text-2xl font-bold">{selectedSymptoms.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Severity Score</p>
                <p className="text-2xl font-bold">{assessment.totalScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <Badge className={`text-sm ${getRiskColor(assessment.riskLevel)}`}>
                  {assessment.riskLevel}
                </Badge>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Selected Symptoms:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assessment.selectedSymptoms.map(symptom => (
                  <div key={symptom.id} className="flex items-center p-2 bg-muted/50 rounded">
                    <Badge variant="outline" className="mr-2">
                      Severity: {symptom.severity}
                    </Badge>
                    <span className="text-sm">{symptom.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recommendations:</h4>
              <ul className="space-y-2">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button onClick={() => setShowResults(false)} variant="outline">
            {t("Check Again", "फिर से जांचें")}
          </Button>
          <Button onClick={() => setLocation("/diagnosis")} className="flex items-center">
            <Stethoscope className="mr-2 h-4 w-4" />
            {t("Start Full Assessment", "पूर्ण मूल्यांकन शुरू करें")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">{t("CKD Symptom Checker", "सीकेडी लक्षण जांचकर्ता")}</h1>
        <p className="text-muted-foreground">
          {t("Select symptoms you're experiencing to get an initial kidney health assessment", "प्रारंभिक गुर्दे स्वास्थ्य मूल्यांकन प्राप्त करने के लिए आप जो लक्षण अनुभव कर रहे हैं उन्हें चुनें")}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("Common CKD-Related Symptoms", "सामान्य सीकेडी संबंधित लक्षण")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("Click on symptoms you're currently experiencing. Each has detailed medical information.", "उन लक्षणों पर क्लिक करें जो आप वर्तमान में अनुभव कर रहे हैं। प्रत्येक में विस्तृत चिकित्सा जानकारी है।")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {symptoms.map((symptom) => (
              <Collapsible key={symptom.id}>
                <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={symptom.id}
                    checked={selectedSymptoms.includes(symptom.id)}
                    onCheckedChange={() => handleSymptomToggle(symptom.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={symptom.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {symptom.name}
                      </label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          Severity: {symptom.severity}
                        </Badge>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                            <Info className="h-3 w-3" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground space-y-2">
                        <p>{symptom.description}</p>
                        <div>
                          <span className="font-medium">Possible causes: </span>
                          {symptom.possibleCauses.join(", ")}
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          symptom.urgency === 'urgent' ? 'border-red-500 text-red-700' :
                          symptom.urgency === 'high' ? 'border-orange-500 text-orange-700' :
                          symptom.urgency === 'moderate' ? 'border-blue-500 text-blue-700' :
                          'border-green-500 text-green-700'
                        }`}>
                          {symptom.urgency.charAt(0).toUpperCase() + symptom.urgency.slice(1)} urgency
                        </Badge>
                      </div>
                    </CollapsibleContent>
                  </div>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={handleSubmit} 
          disabled={selectedSymptoms.length === 0}
          className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
        >
          <AlertCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Get Assessment ({selectedSymptoms.length} symptoms selected)</span>
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4 max-w-2xl mx-auto">
          {t("This tool provides preliminary guidance only. Always consult healthcare professionals for proper diagnosis and treatment. Emergency symptoms require immediate medical attention.", "यह उपकरण केवल प्रारंभिक मार्गदर्शन प्रदान करता है। उचित निदान और उपचार के लिए हमेशा स्वास्थ्य पेशेवरों से सलाह लें। आपातकालीन लक्षणों के लिए तत्काल चिकित्सा ध्यान की आवश्यकता होती है।")}
        </p>
      </div>
    </div>
  );
}