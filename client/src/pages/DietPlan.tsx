import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Droplets, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { generateDietPlanPDF } from "@/lib/pdfGenerator";
import { useLanguage, t } from "@/hooks/useLanguage";
import type { DietPlan, CKDAssessment } from "@shared/schema";

interface DietPlanProps {
  params: { id: string };
}

export default function DietPlan({ params }: DietPlanProps) {
  const assessmentId = parseInt(params.id);
  const [dietType, setDietType] = useState<'vegetarian' | 'non-vegetarian'>('vegetarian');
  const { language } = useLanguage();

  // Check if user has access to this assessment
  const hasAccess = () => {
    return true; // Allow access for all users for testing
  };

  const { data: assessment } = useQuery<CKDAssessment>({
    queryKey: ["/api/ckd-assessment", assessmentId],
    enabled: !isNaN(assessmentId) && hasAccess(),
  });

  const dietPlanMutation = useMutation({
    mutationFn: async ({ assessmentId, dietType }: { assessmentId: number, dietType: string }) => {
      // Create a complete diet plan payload with all required fields
      const dietPlanData = {
        assessmentId,
        dietType,
        foodsToEat: generateFoodToEat(dietType, assessment),
        foodsToAvoid: generateFoodToAvoid(assessment),
        waterIntakeAdvice: generateWaterIntake(assessment),
        specialInstructions: generateSpecialInstructions(assessment)
      };
      
      const response = await apiRequest("POST", "/api/diet-plan", dietPlanData);
      const result = await response.json();
      console.log('Diet plan API response:', result);
      return result;
    },
  });

  const { data: existingDietPlan } = useQuery<DietPlan>({
    queryKey: ["/api/diet-plan", assessmentId],
    enabled: !isNaN(assessmentId) && hasAccess(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: dietPlan, isLoading } = useQuery<DietPlan>({
    queryKey: ["/api/diet-plan", assessmentId, dietType],
    queryFn: () => {
      // If diet plan already exists and matches the current diet type, use it
      if (existingDietPlan && existingDietPlan.dietType === dietType) {
        return Promise.resolve(existingDietPlan);
      }
      // Otherwise create a new one
      return dietPlanMutation.mutateAsync({ assessmentId, dietType });
    },
    enabled: !isNaN(assessmentId) && hasAccess(),
  });

  const toggleDietType = (type: 'vegetarian' | 'non-vegetarian') => {
    setDietType(type);
  };

  // Helper functions to generate diet plan content
  const generateFoodToEat = (dietType: string, assessment?: CKDAssessment) => {
    const baseVeg = "Fresh vegetables (spinach, cauliflower, cabbage), low-potassium fruits (apples, berries), whole grains (oats, quinoa), lean proteins (tofu, lentils in moderation)";
    const baseNonVeg = "Fresh vegetables (spinach, cauliflower, cabbage), low-potassium fruits (apples, berries), whole grains (oats, quinoa), lean proteins (chicken, fish, egg whites)";
    
    if (!assessment) return dietType === 'vegetarian' ? baseVeg : baseNonVeg;
    
    const riskScore = assessment.riskScore || 0;
    if (riskScore > 0.6) {
      return dietType === 'vegetarian' ? 
        baseVeg + ", kidney-friendly herbs (parsley, cilantro), low-sodium options" :
        baseNonVeg + ", kidney-friendly herbs (parsley, cilantro), low-sodium options";
    }
    return dietType === 'vegetarian' ? baseVeg : baseNonVeg;
  };

  const generateFoodToAvoid = (assessment?: CKDAssessment) => {
    const base = "High-sodium foods (processed foods, canned soups), high-potassium foods (bananas, oranges, tomatoes), high-phosphorus foods (nuts, seeds, dairy), excessive protein";
    
    if (!assessment) return base;
    
    const riskScore = assessment.riskScore || 0;
    if (riskScore > 0.6) {
      return base + ", caffeine, alcohol, artificial sweeteners, red meat in excess";
    }
    return base;
  };

  const generateWaterIntake = (assessment?: CKDAssessment) => {
    if (!assessment) return "Maintain adequate hydration - 6-8 glasses of water daily, adjust based on kidney function";
    
    const riskScore = assessment.riskScore || 0;
    if (riskScore > 0.6) {
      return "Moderate water intake - 4-6 glasses daily, monitor fluid balance, consult healthcare provider for specific limits";
    }
    return "Maintain adequate hydration - 6-8 glasses of water daily, adjust based on kidney function";
  };

  const generateSpecialInstructions = (assessment?: CKDAssessment) => {
    if (!assessment) return "Regular monitoring of kidney function, follow medical advice, maintain healthy weight";
    
    const riskScore = assessment.riskScore || 0;
    if (riskScore > 0.6) {
      return "Strict monitoring of kidney function, regular nephrology consultations, blood pressure control, diabetes management if applicable";
    }
    return "Regular monitoring of kidney function, follow medical advice, maintain healthy weight, preventive care";
  };

  const downloadDietPlan = () => {
    if (!dietPlan) return;
    generateDietPlanPDF(dietPlan, assessment);
  };

  if (!hasAccess()) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600">Access denied. You can only view diet plans for your own assessments.</p>
          <Link href="/diagnosis">
            <Button className="mt-4">Take New Assessment</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const foodsToEat = dietPlan ? dietPlan.foodsToEat.split(', ') : [];
  const foodsToAvoid = dietPlan ? dietPlan.foodsToAvoid.split(', ') : [];

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold">{t("Personalized Diet Plan", "व्यक्तिगत आहार योजना")}</CardTitle>
          <p className="text-gray-600">
            {t("Based on your CKD risk assessment and analysis of your health parameters", "आपके CKD जोखिम मूल्यांकन और स्वास्थ्य पैरामीटर के विश्लेषण के आधार पर")}
          </p>
        </CardHeader>
        <CardContent>
          {/* Diet Type Toggle */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              <Button
                variant={dietType === 'vegetarian' ? 'default' : 'ghost'}
                onClick={() => toggleDietType('vegetarian')}
                className="flex-1 sm:flex-none sm:px-6 py-2"
              >
                {t("Vegetarian", "शाकाहारी")}
              </Button>
              <Button
                variant={dietType === 'non-vegetarian' ? 'default' : 'ghost'}
                onClick={() => toggleDietType('non-vegetarian')}
                className="flex-1 sm:flex-none sm:px-6 py-2"
              >
                {t("Non-Vegetarian", "मांसाहारी")}
              </Button>
            </div>
          </div>

          {/* Diet Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {/* Foods to Eat */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="mr-3 h-5 w-5" />
                  {t("Foods to Eat", "खाने योग्य खाद्य पदार्थ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-green-700">
                  {foodsToEat.map((food: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{food}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Foods to Avoid */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <XCircle className="mr-3 h-5 w-5" />
                  {t("Foods to Avoid", "बचने योग्य खाद्य पदार्थ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-red-700">
                  {foodsToAvoid.map((food: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{food}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Water Intake Advice */}
          <Card className="border-blue-200 bg-blue-50 mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Droplets className="mr-3 h-5 w-5" />
                {t("Water Intake Advice", "पानी का सेवन सलाह")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-blue-700">
                {dietPlan?.waterIntakeAdvice.split('. ').map((sentence, index) => (
                  <p key={index} className="mb-2">
                    <strong>{sentence.split(':')[0]}:</strong> {sentence.split(':').slice(1).join(':')}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Download Button */}
          <div className="text-center">
            <Button size="lg" onClick={downloadDietPlan} className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-green-600 hover:bg-green-700">
              <Download className="mr-3 h-5 w-5" />
              {t("Download PDF Diet Plan", "पीडीएफ आहार योजना डाउनलोड करें")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
