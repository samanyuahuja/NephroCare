import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Symptom {
  id: string;
  name: string;
  description: string;
  severity: number; // 1-3 scale
}

const symptoms: Symptom[] = [
  {
    id: "fatigue",
    name: "Persistent fatigue",
    description: "Constant tiredness not relieved by rest, often due to anemia or toxin buildup in CKD.",
    severity: 2
  },
  {
    id: "swelling",
    name: "Swelling in legs or ankles",
    description: "Fluid retention (edema) occurs when kidneys can't remove excess fluid from the body.",
    severity: 3
  },
  {
    id: "urination",
    name: "Changes in urination",
    description: "Frequency, color changes, or difficulty urinating may indicate kidney function decline.",
    severity: 2
  },
  {
    id: "foamy",
    name: "Foamy urine",
    description: "Protein in urine (proteinuria) creates foam, indicating kidney filtering problems.",
    severity: 3
  },
  {
    id: "nausea",
    name: "Nausea or vomiting",
    description: "Toxin buildup in blood (uremia) can cause digestive symptoms in advanced CKD.",
    severity: 2
  },
  {
    id: "breath",
    name: "Shortness of breath",
    description: "Fluid in lungs or anemia can cause breathing difficulties in CKD patients.",
    severity: 3
  },
  {
    id: "appetite",
    name: "Loss of appetite",
    description: "Uremia and metabolic changes in CKD often reduce appetite and food intake.",
    severity: 2
  },
  {
    id: "blood",
    name: "Blood in urine (Hematuria)",
    description: "Visible or microscopic blood in urine may indicate kidney damage or disease.",
    severity: 3
  },
  {
    id: "pressure",
    name: "High blood pressure",
    description: "Kidney disease and hypertension often occur together, worsening each other.",
    severity: 2
  },
  {
    id: "skin",
    name: "Itchy or dry skin",
    description: "Mineral imbalances and toxin buildup in CKD can cause skin problems.",
    severity: 1
  },
  {
    id: "concentration",
    name: "Trouble concentrating",
    description: "Uremia can affect brain function, causing confusion and difficulty focusing.",
    severity: 2
  },
  {
    id: "cramps",
    name: "Muscle cramps",
    description: "Electrolyte imbalances (calcium, phosphorus) in CKD can cause muscle issues.",
    severity: 1
  },
  {
    id: "backpain",
    name: "Back pain near kidneys",
    description: "Pain in lower back or sides may indicate kidney stones or infection.",
    severity: 2
  }
];

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();

  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    if (checked) {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    } else {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId));
    }
  };

  const calculateAssessment = () => {
    if (selectedSymptoms.length === 0) return null;

    const selectedSymptomObjects = symptoms.filter(s => selectedSymptoms.includes(s.id));
    const avgSeverity = selectedSymptomObjects.reduce((sum, s) => sum + s.severity, 0) / selectedSymptomObjects.length;
    const highSeverityCount = selectedSymptomObjects.filter(s => s.severity === 3).length;

    let severity: string;
    let urgency: string;
    let recommendation: string;
    let badgeColor: "default" | "secondary" | "destructive" | "outline";

    if (highSeverityCount >= 2 || avgSeverity >= 2.5) {
      severity = "High Concern";
      urgency = "Urgent";
      recommendation = "Please consult a nephrologist immediately. These symptoms may indicate significant kidney function decline.";
      badgeColor = "destructive";
    } else if (selectedSymptoms.length >= 3 || avgSeverity >= 2) {
      severity = "Moderate Concern";
      urgency = "Soon";
      recommendation = "Schedule an appointment with your doctor within 1-2 weeks for kidney function tests.";
      badgeColor = "secondary";
    } else {
      severity = "Low Concern";
      urgency = "Routine";
      recommendation = "Monitor symptoms and consider discussing with your doctor at your next regular visit.";
      badgeColor = "outline";
    }

    return { severity, urgency, recommendation, badgeColor };
  };

  const assessment = showResults ? calculateAssessment() : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Symptom Checker</h1>
        <p className="text-muted-foreground">
          Select symptoms you are experiencing to get an initial assessment
        </p>
        <div className="flex items-center justify-center mt-4 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            This tool is for educational purposes only and does not replace professional medical advice
          </span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="mr-3 h-5 w-5" />
            Select Your Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {symptoms.map((symptom) => (
              <div key={symptom.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={symptom.id}
                    checked={selectedSymptoms.includes(symptom.id)}
                    onCheckedChange={(checked) => 
                      handleSymptomChange(symptom.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={symptom.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {symptom.name}
                    </label>
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center mt-1 text-xs text-muted-foreground hover:text-primary">
                        <Info className="h-3 w-3 mr-1" />
                        Learn more
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          {symptom.description}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button 
          onClick={() => setShowResults(true)}
          disabled={selectedSymptoms.length === 0}
          className="flex-1"
        >
          Assess Symptoms ({selectedSymptoms.length})
        </Button>
        <Button 
          variant="outline"
          onClick={() => setLocation("/diagnosis")}
          className="flex-1"
        >
          Start Full Diagnosis
        </Button>
      </div>

      {assessment && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Assessment Results
              <Badge variant={assessment.badgeColor}>
                {assessment.severity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Urgency Level:</h4>
                <p className="text-sm text-muted-foreground">{assessment.urgency}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Recommendation:</h4>
                <p className="text-sm text-muted-foreground">{assessment.recommendation}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Selected Symptoms:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSymptoms.map(id => {
                    const symptom = symptoms.find(s => s.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {symptom?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Next Step:</strong> For a comprehensive kidney health assessment with 
                  lab values and medical history, use our complete diagnostic tool.
                </p>
                <Button 
                  className="mt-3 w-full"
                  onClick={() => setLocation("/diagnosis")}
                >
                  Start Complete Diagnosis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}