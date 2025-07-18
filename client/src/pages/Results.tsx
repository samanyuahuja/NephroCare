import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Lightbulb, Bot, Utensils, Download, MessageCircle } from "lucide-react";
import { SHAPPlot } from "@/components/charts/SHAPPlot";
import { PDPPlot } from "@/components/charts/PDPPlot";
import { LIMEExplanation } from "@/components/charts/LIMEExplanation";
import type { CKDAssessment } from "@shared/schema";

interface ResultsProps {
  params: { id: string };
}

export default function Results({ params }: ResultsProps) {
  const assessmentId = parseInt(params.id);

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

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Next Steps</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/diet-plan/${assessmentId}`}>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Utensils className="mr-2 h-4 w-4" />
                Generate AI Diet Plan
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Link href="/chatbot">
              <Button size="lg" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask AI Questions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
