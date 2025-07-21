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
        foodsToAvoid: generateFoodToAvoid(dietType, assessment),
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

  const { data: dietPlan, isLoading, refetch } = useQuery<DietPlan>({
    queryKey: ["/api/diet-plan", assessmentId, dietType],
    queryFn: () => {
      // Always create new diet plan when diet type changes
      return dietPlanMutation.mutateAsync({ assessmentId, dietType });
    },
    enabled: !isNaN(assessmentId) && hasAccess(),
  });

  // Function to parse SHAP features for intelligent recommendations
  const parseShapFeatures = (shapFeatures: string | null) => {
    if (!shapFeatures) return [];
    try {
      return JSON.parse(shapFeatures);
    } catch {
      return [];
    }
  };

  // Advanced SHAP-based diet analysis
  const generateShapBasedDietAnalysis = (assessment: CKDAssessment) => {
    const shapFeatures = parseShapFeatures(assessment.shapFeatures);
    
    const analysis = {
      primaryRiskFactors: [] as any[],
      protectiveFactors: [] as any[],
      dietaryInterventions: [] as any[],
      specificRecommendations: [] as any[],
      nutritionalTargets: {} as any
    };

    // Analyze each SHAP feature for dietary implications
    shapFeatures.forEach((feature: any) => {
      const { name, value, impact } = feature;
      
      if (impact > 0.1) { // High risk factors
        analysis.primaryRiskFactors.push({
          factor: name,
          value: value,
          impact: impact,
          intervention: getDietaryIntervention(name, value, 'reduce')
        });
      } else if (impact < -0.05) { // Protective factors
        analysis.protectiveFactors.push({
          factor: name,
          value: value,
          impact: Math.abs(impact),
          intervention: getDietaryIntervention(name, value, 'maintain')
        });
      }
    });

    // Generate specific nutritional targets based on SHAP analysis
    analysis.nutritionalTargets = calculateNutritionalTargets(assessment, shapFeatures);
    
    return analysis;
  };

  // Get specific dietary intervention for each SHAP feature
  const getDietaryIntervention = (factorName: string, value: any, action: 'reduce' | 'maintain') => {
    const interventions = {
      'Serum Creatinine': {
        reduce: {
          foods: ['Low-protein grains (rice, pasta in moderation)', 'Plant proteins (small portions)', 'Low-phosphorus vegetables'],
          avoid: ['High-protein meats', 'Processed foods', 'Excessive dairy'],
          explanation: 'High creatinine indicates kidney stress. Reducing protein load helps preserve kidney function.'
        },
        maintain: {
          foods: ['Lean proteins in moderation', 'Fresh vegetables', 'Adequate hydration'],
          explanation: 'Normal creatinine levels support continuing balanced protein intake.'
        }
      },
      'Blood Urea': {
        reduce: {
          foods: ['Low-protein vegetables', 'Complex carbohydrates', 'Controlled protein portions'],
          avoid: ['Excessive meat', 'High-nitrogen foods', 'Dehydration'],
          explanation: 'Elevated urea suggests protein metabolism stress. Reducing protein intake decreases kidney workload.'
        },
        maintain: {
          foods: ['Balanced protein sources', 'Adequate fluids'],
          explanation: 'Normal urea levels allow for standard protein recommendations.'
        }
      },
      'Blood Pressure': {
        reduce: {
          foods: ['Low-sodium vegetables', 'Potassium-rich foods (if allowed)', 'DASH diet foods'],
          avoid: ['High-sodium processed foods', 'Excessive salt', 'Canned foods with sodium'],
          explanation: 'High blood pressure damages kidneys. Sodium restriction and potassium balance help control BP.'
        },
        maintain: {
          foods: ['Moderate sodium intake', 'Heart-healthy foods'],
          explanation: 'Normal blood pressure supports standard heart-healthy dietary guidelines.'
        }
      },
      'Blood Glucose Random': {
        reduce: {
          foods: ['Low-glycemic vegetables', 'Complex carbohydrates', 'High-fiber foods'],
          avoid: ['Simple sugars', 'Refined carbohydrates', 'Sugary drinks'],
          explanation: 'High glucose accelerates kidney damage. Controlling blood sugar slows CKD progression.'
        },
        maintain: {
          foods: ['Balanced carbohydrates', 'Regular meal timing'],
          explanation: 'Normal glucose levels support standard carbohydrate recommendations.'
        }
      },
      'Albumin': {
        reduce: {
          foods: ['Low-protein alternatives', 'Plant-based proteins', 'Kidney-friendly vegetables'],
          avoid: ['High-protein foods', 'Excessive dairy', 'Red meat'],
          explanation: 'High albumin in urine indicates kidney damage. Protein restriction may slow progression.'
        },
        maintain: {
          foods: ['Adequate protein for nutrition'],
          explanation: 'Normal albumin levels allow for standard protein intake.'
        }
      },
      'Sodium': {
        reduce: {
          foods: ['Fresh vegetables', 'Herbs and spices', 'Low-sodium alternatives'],
          avoid: ['Processed foods', 'Restaurant foods', 'Canned foods'],
          explanation: 'High sodium worsens blood pressure and fluid retention. Restriction is crucial for kidney health.'
        },
        maintain: {
          foods: ['Moderate sodium intake', 'Fresh foods'],
          explanation: 'Normal sodium levels support moderate sodium dietary guidelines.'
        }
      },
      'Potassium': {
        reduce: {
          foods: ['Low-potassium vegetables (cabbage, green beans)', 'White rice', 'Apples'],
          avoid: ['High-potassium foods (bananas, oranges)', 'Nuts', 'Dried fruits'],
          explanation: 'High potassium can cause dangerous heart rhythms in kidney disease. Restriction is essential.'
        },
        maintain: {
          foods: ['Moderate potassium foods', 'Balanced fruit/vegetable intake'],
          explanation: 'Normal potassium levels allow for standard fruit and vegetable recommendations.'
        }
      },
      'Hemoglobin': {
        reduce: {
          foods: ['Iron-rich foods', 'Vitamin C sources', 'Lean proteins'],
          avoid: ['Iron inhibitors (tea with meals)', 'Excessive calcium'],
          explanation: 'Low hemoglobin indicates anemia. Iron-rich foods help improve oxygen delivery.'
        },
        maintain: {
          foods: ['Balanced iron sources'],
          explanation: 'Normal hemoglobin supports standard iron intake recommendations.'
        }
      }
    };

    const factor = interventions[factorName as keyof typeof interventions];
    return factor ? factor[action] : { foods: [], avoid: [], explanation: 'Maintain balanced nutrition.' };
  };

  // Calculate specific nutritional targets based on SHAP analysis
  const calculateNutritionalTargets = (assessment: CKDAssessment, shapFeatures: any[]) => {
    const targets = {
      protein: { min: 0.6, max: 0.8, unit: 'g/kg body weight', reasoning: '' },
      sodium: { max: 2000, unit: 'mg/day', reasoning: '' },
      potassium: { max: 3000, unit: 'mg/day', reasoning: '' },
      phosphorus: { max: 1000, unit: 'mg/day', reasoning: '' },
      fluids: { target: 1500, unit: 'ml/day', reasoning: '' }
    };

    // Adjust targets based on SHAP analysis
    const highRiskFeatures = shapFeatures.filter(f => f.impact > 0.1);
    
    if (highRiskFeatures.some(f => f.name === 'Serum Creatinine')) {
      targets.protein.max = 0.6;
      targets.protein.reasoning = 'Reduced due to elevated creatinine indicating kidney stress';
    }
    
    if (highRiskFeatures.some(f => f.name === 'Blood Pressure')) {
      targets.sodium.max = 1500;
      targets.sodium.reasoning = 'Strictly limited due to hypertension risk';
    }
    
    if (assessment.potassium > 5.0) {
      targets.potassium.max = 2000;
      targets.potassium.reasoning = 'Restricted due to elevated serum potassium levels';
    }

    return targets;
  };

  const toggleDietType = async (type: 'vegetarian' | 'non-vegetarian') => {
    setDietType(type);
    // Force refetch with new diet type
    setTimeout(() => {
      refetch();
    }, 100);
  };

  // Helper functions to generate SHAP-based comprehensive diet plan
  const generateFoodToEat = (dietType: string, assessment?: CKDAssessment) => {
    if (!assessment) {
      return dietType === 'vegetarian' ? 
        "Fresh vegetables, whole grains, moderate protein from plant sources" :
        "Fresh vegetables, whole grains, lean proteins (chicken, fish, egg whites)";
    }

    const foods = [];
    
    // Base foods for CKD
    if (dietType === 'vegetarian') {
      foods.push("Low-sodium vegetables (cabbage, cauliflower, green beans)");
      foods.push("Controlled protein sources (tofu, small amounts of paneer)");
    } else {
      foods.push("Low-sodium vegetables (cabbage, cauliflower, green beans)");
      foods.push("Lean proteins (skinless chicken breast, fish, egg whites only)");
    }

    // SHAP-based recommendations for negative factors
    const shapFeatures = parseShapFeatures(assessment.shapFeatures);
    
    // High Serum Creatinine (>1.5) - reduce protein, add kidney-friendly foods
    if (assessment.serumCreatinine && parseFloat(assessment.serumCreatinine.toString()) > 1.5) {
      foods.push("Low-protein vegetables (bottle gourd, ridge gourd, papaya)");
      foods.push("Watermelon and cucumber for gentle hydration");
    }

    // High Blood Urea (>40) - very low protein
    if (assessment.bloodUrea && assessment.bloodUrea > 40) {
      foods.push("Ultra-low protein vegetables (lauki, tinda, ghiya)");
      foods.push("Limited whole grains (small portions of rice, oats)");
    }

    // High Blood Pressure - potassium-rich foods (if potassium normal)
    if (assessment.bloodPressure && assessment.bloodPressure > 130) {
      const potassium = parseFloat(assessment.potassium?.toString() || "4");
      if (potassium <= 5.0) {
        foods.push("Potassium-rich foods (spinach in moderation, oranges, banana - small portions)");
      }
      foods.push("DASH diet foods (oats, beetroot, low-fat options)");
    }

    // High Albumin - anti-inflammatory foods
    if (assessment.albumin && assessment.albumin >= 2) {
      foods.push("Anti-inflammatory foods (turmeric, flaxseed, ginger)");
    }

    // High Sugar/Glucose - low GI foods
    if ((assessment.sugar && assessment.sugar > 1) || (assessment.bloodGlucoseRandom && assessment.bloodGlucoseRandom > 140)) {
      foods.push("Low-GI foods (bitter gourd, methi leaves, cinnamon tea)");
      foods.push("Whole grains (barley, dalia in small portions)");
    }

    // Abnormal RBC - iron-rich foods
    if (assessment.redBloodCells === "abnormal") {
      foods.push("Iron-rich foods with vitamin C (spinach with lemon, beetroot)");
      foods.push("B12 sources (fortified cereals, nutritional yeast for vegetarians)");
    }

    // Low Hemoglobin - iron absorption enhancers
    if (assessment.hemoglobin && assessment.hemoglobin < 12) {
      foods.push("Iron-rich foods (palak, jaggery in moderation, sprouts)");
      foods.push("Vitamin C enhancers (amla, guava - small portions)");
    }

    // High WBC - anti-inflammatory foods
    if (assessment.wbcCount && assessment.wbcCount > 11000) {
      foods.push("Anti-inflammatory foods (turmeric milk, garlic, ginger tea)");
    }

    // Edema - diuretic foods
    if (assessment.pedalEdema === "yes") {
      foods.push("Natural diuretics (cucumber, parsley, celery)");
    }

    // Poor appetite - easy-to-digest foods
    if (assessment.appetite === "poor") {
      foods.push("Easily digestible foods (khichdi, curd rice, soft-cooked vegetables)");
    }

    return foods.join(", ");
  };

  const generateFoodToAvoid = (dietType: string, assessment?: CKDAssessment) => {
    if (!assessment) {
      return "High-sodium processed foods, excessive protein, high-potassium fruits in excess";
    }

    const avoidFoods = [];
    
    // Base CKD restrictions with diet-specific modifications
    avoidFoods.push("High-sodium foods (processed foods, canned soups, pickles, papad)");
    
    if (dietType === 'vegetarian') {
      avoidFoods.push("Excessive protein sources (red meat, excessive dal, soy products in large amounts)");
      avoidFoods.push("High-protein vegetarian foods in excess (paneer, cheese, nuts)");
    } else {
      avoidFoods.push("Excessive protein sources (red meat, organ meats, processed meats)");
      avoidFoods.push("High-fat animal proteins (fatty cuts of meat, full-fat dairy)");
    }

    // High Serum Creatinine - avoid protein and processed foods (diet-specific)
    if (assessment.serumCreatinine && parseFloat(assessment.serumCreatinine.toString()) > 1.5) {
      if (dietType === 'vegetarian') {
        avoidFoods.push("Excessive plant proteins (large portions of dal, legumes, tofu)");
        avoidFoods.push("High-protein nuts and seeds in large quantities");
      } else {
        avoidFoods.push("All red meat, organ meats, processed fish products");
        avoidFoods.push("High-protein animal products in excess");
      }
      avoidFoods.push("Alcohol and processed foods");
    }

    // High Blood Urea - strict protein restriction (diet-specific)
    if (assessment.bloodUrea && assessment.bloodUrea > 40) {
      if (dietType === 'vegetarian') {
        avoidFoods.push("Excessive pulses, dal, soy products, protein-rich legumes");
      } else {
        avoidFoods.push("All meat, fish, poultry in large portions, high-protein animal products");
      }
    }

    // High Blood Pressure - sodium restriction
    if (assessment.bloodPressure && assessment.bloodPressure > 130) {
      avoidFoods.push("Salt, chips, namkeen, bakery items with high sodium");
      avoidFoods.push("Fried and processed snacks");
    }

    // High Potassium - avoid high-potassium foods
    if (assessment.potassium && parseFloat(assessment.potassium.toString()) > 5.5) {
      avoidFoods.push("High-potassium foods (banana, coconut water, oranges, tomatoes)");
      avoidFoods.push("Spinach in large quantities, potato");
    }

    // High Sodium - strict sodium restriction
    if (assessment.sodium && assessment.sodium > 145) {
      avoidFoods.push("All salted snacks, namkeen, processed cheese");
      avoidFoods.push("Restaurant food with high sodium");
    }

    // High Sugar/Glucose - avoid sugary foods
    if ((assessment.sugar && assessment.sugar > 1) || (assessment.bloodGlucoseRandom && assessment.bloodGlucoseRandom > 140)) {
      avoidFoods.push("Sugar, sweets, soft drinks, white rice, maida");
      avoidFoods.push("High-GI fruits (mango, banana in excess, dates)");
    }

    // High Albumin - reduce dairy and excess protein
    if (assessment.albumin && assessment.albumin >= 2) {
      avoidFoods.push("Excess dairy products, cheese, heavy protein meals");
    }

    // Abnormal Pus Cells - avoid inflammatory foods
    if (assessment.pusCell === "abnormal") {
      avoidFoods.push("Spicy food, street food, contaminated water sources");
    }

    // High WBC - avoid inflammatory foods
    if (assessment.wbcCount && assessment.wbcCount > 11000) {
      avoidFoods.push("Fried foods, sugar, inflammatory oils, processed foods");
    }

    // Diabetes - strict sugar control
    if (assessment.diabetesMellitus === "yes") {
      avoidFoods.push("All sugars, juices, rice, potatoes in large quantities");
    }

    // Hypertension - sodium restriction
    if (assessment.hypertension === "yes") {
      avoidFoods.push("Processed snacks, bakery items, high-sodium ready meals");
    }

    // Edema - fluid and sodium restriction
    if (assessment.pedalEdema === "yes") {
      avoidFoods.push("High-salt foods, excess fluids, sugar");
    }

    // Poor appetite - avoid heavy foods
    if (assessment.appetite === "poor") {
      avoidFoods.push("Oily, rich, strong-smelling foods that may worsen appetite");
    }

    return avoidFoods.join(", ");
  };

  const generateWaterIntake = (assessment?: CKDAssessment) => {
    if (!assessment) return "Maintain adequate hydration - 6-8 glasses of water daily. Monitor urine output and adjust intake based on kidney function. Drink water between meals rather than with meals. Spread intake throughout the day. Consult healthcare provider if you have fluid retention or swelling.";
    
    const advice = [];
    const riskScore = assessment.riskScore || 0;
    const creatinine = parseFloat(assessment.serumCreatinine?.toString() || "0");
    
    // Base water intake advice based on kidney function
    if (riskScore > 0.6 || creatinine > 1.5) {
      advice.push("Moderate water intake - 4-6 glasses daily (1000-1500ml)");
      advice.push("Monitor fluid balance carefully and watch for signs of fluid overload like swelling in ankles or shortness of breath");
      advice.push("Include all fluids (tea, coffee, soups) in daily count");
      advice.push("Consult nephrologist for personalized fluid restrictions");
    } else {
      advice.push("Maintain adequate hydration - 6-8 glasses of water daily (1500-2000ml)");
      advice.push("Drink more in hot weather or during physical activity");
      advice.push("Monitor urine color - pale yellow indicates good hydration");
    }

    // Additional advice based on specific conditions
    if (assessment.pedalEdema === "yes") {
      advice.push("Limit fluid intake due to edema - follow medical advice for exact amounts");
    }

    if (assessment.hypertension === "yes") {
      advice.push("Monitor fluid balance as part of blood pressure management");
    }

    if (assessment.bloodUrea && assessment.bloodUrea > 40) {
      advice.push("Moderate fluid intake to prevent further kidney stress");
    }

    advice.push("Space water intake throughout the day rather than drinking large amounts at once");
    advice.push("Avoid excessive water during meals to prevent diluting digestive enzymes");
    advice.push("Reduce intake 2-3 hours before bedtime to improve sleep quality");

    return advice.join(". ");
  };

  const generateSpecialInstructions = (assessment?: CKDAssessment) => {
    if (!assessment) return "Regular monitoring of kidney function, follow medical advice, maintain healthy weight";
    
    const instructions = [];
    const riskScore = assessment.riskScore || 0;
    
    if (riskScore > 0.6) {
      instructions.push("Strict monitoring of kidney function, regular nephrology consultations");
      instructions.push("Blood pressure control and diabetes management if applicable");
    } else {
      instructions.push("Regular monitoring of kidney function, follow medical advice");
      instructions.push("Maintain healthy weight, preventive care");
    }

    // SHAP-based specific instructions
    if (assessment.serumCreatinine && parseFloat(assessment.serumCreatinine.toString()) > 1.5) {
      instructions.push("Work with renal dietitian for protein management");
    }

    if (assessment.potassium && parseFloat(assessment.potassium.toString()) > 5.0) {
      instructions.push("Monitor blood potassium levels regularly");
    }

    if (assessment.diabetesMellitus === "yes") {
      instructions.push("Coordinate with diabetes care team");
    }

    instructions.push("Keep food diary and track response to dietary changes");

    return instructions.join(", ");
  };

  const downloadDietPlan = async () => {
    if (!dietPlan) return;
    await generateDietPlanPDF(dietPlan, assessment);
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
          {/* SHAP-Based Analysis Section */}
          {assessment && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t("AI-Powered SHAP Analysis for Your Diet Plan", "आपकी आहार योजना के लिए AI-संचालित SHAP विश्लेषण")}
              </h3>
              
              {(() => {
                const shapAnalysis = generateShapBasedDietAnalysis(assessment);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Primary Risk Factors */}
                    {shapAnalysis.primaryRiskFactors.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          High Risk Factors Requiring Dietary Intervention
                        </h4>
                        {shapAnalysis.primaryRiskFactors.map((factor: any, index: number) => (
                          <div key={index} className="mb-4 p-3 bg-white rounded border border-red-100">
                            <div className="font-medium text-red-900 mb-1">
                              {factor.factor}: {factor.value} (Impact: {(factor.impact * 100).toFixed(1)}%)
                            </div>
                            <div className="text-sm text-red-700 mb-2">{factor.intervention.explanation}</div>
                            <div className="text-sm">
                              <span className="font-medium text-green-700">Recommended: </span>
                              {factor.intervention.foods?.join(', ')}
                            </div>
                            {factor.intervention.avoid && (
                              <div className="text-sm mt-1">
                                <span className="font-medium text-red-700">Avoid: </span>
                                {factor.intervention.avoid.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Protective Factors */}
                    {shapAnalysis.protectiveFactors.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Protective Factors to Maintain
                        </h4>
                        {shapAnalysis.protectiveFactors.map((factor: any, index: number) => (
                          <div key={index} className="mb-3 p-3 bg-white rounded border border-green-100">
                            <div className="font-medium text-green-900 mb-1">
                              {factor.factor}: {factor.value} (Protective Impact: {(factor.impact * 100).toFixed(1)}%)
                            </div>
                            <div className="text-sm text-green-700">{factor.intervention.explanation}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Nutritional Targets */}
                    <div className="lg:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Personalized Nutritional Targets Based on SHAP Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(shapAnalysis.nutritionalTargets).map(([nutrient, target]: [string, any]) => (
                          <div key={nutrient} className="bg-white p-3 rounded border border-blue-100">
                            <div className="font-medium text-blue-900 capitalize">{nutrient}</div>
                            <div className="text-sm text-blue-700">
                              {target.min && `${target.min}-`}{target.max || target.target} {target.unit}
                            </div>
                            {target.reasoning && (
                              <div className="text-xs text-blue-600 mt-1">{target.reasoning}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

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
          <div id="diet-plan-content" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
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
              <div className="text-blue-700 space-y-3">
                {dietPlan?.waterIntakeAdvice.split('. ').map((sentence, index) => (
                  <div key={index} className="flex items-start">
                    <Droplets className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{sentence.trim()}.</p>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    {t("Important Water Intake Tips:", "महत्वपूर्ण पानी सेवन सुझाव:")}
                  </p>
                  <ul className="text-xs space-y-1 text-blue-700">
                    <li>• {t("Track your daily fluid intake including all beverages", "सभी पेय पदार्थों सहित अपने दैनिक तरल सेवन को ट्रैक करें")}</li>
                    <li>• {t("Sip small amounts throughout the day", "दिन भर में छोटी मात्रा में घूंट लें")}</li>
                    <li>• {t("Monitor for swelling or breathing difficulties", "सूजन या सांस लेने में कठिनाई की निगरानी करें")}</li>
                    <li>• {t("Adjust based on activity level and weather", "गतिविधि स्तर और मौसम के आधार पर समायोजित करें")}</li>
                  </ul>
                </div>
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
