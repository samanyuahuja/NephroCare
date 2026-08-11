import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage, t } from "@/hooks/useLanguage";
import type { DietPlan, CKDAssessment } from "@shared/schema";
import PageIntro from "@/components/PageIntro";
import { hasAssessmentAccess } from "@/lib/assessmentAccess";

interface DietPlanProps {
  params: { id: string };
}

export default function DietPlan({ params }: DietPlanProps) {
  const assessmentId = parseInt(params.id);
  const [dietType, setDietType] = useState<'vegetarian' | 'non-vegetarian'>('vegetarian');
  const { language } = useLanguage();

  const hasAccess = hasAssessmentAccess(assessmentId);

  const { data: assessment } = useQuery<CKDAssessment>({
    queryKey: ["/api/ckd-assessment", assessmentId],
    enabled: !isNaN(assessmentId) && hasAccess,
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
      return response.json();
    },
  });

  const { data: dietPlan, isLoading, refetch } = useQuery<DietPlan>({
    queryKey: ["/api/diet-plan", assessmentId, dietType],
    queryFn: () => {
      // Always create new diet plan when diet type changes
      return dietPlanMutation.mutateAsync({ assessmentId, dietType });
    },
    enabled: !isNaN(assessmentId) && hasAccess,
  });

  // Parse stored factors used to organise the discussion guide.
  const parseShapFeatures = (shapFeatures: string | null) => {
    if (!shapFeatures) return [];
    try {
      return JSON.parse(shapFeatures);
    } catch {
      return [];
    }
  };

  // Build the factor summary shown alongside the discussion guide.
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
    if (Array.isArray(shapFeatures)) {
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
    }

    // Generate specific nutritional targets based on SHAP analysis
    analysis.nutritionalTargets = calculateNutritionalTargets(assessment, shapFeatures);
    
    // If no SHAP features available, create basic analysis from assessment data
    if (!Array.isArray(shapFeatures) || shapFeatures.length === 0) {
      // Add basic risk factors based on assessment values
      if (assessment.serumCreatinine && parseFloat(assessment.serumCreatinine.toString()) > 1.2) {
        analysis.primaryRiskFactors.push({
          factor: 'Serum Creatinine',
          value: `${assessment.serumCreatinine} mg/dL`,
          impact: 0.3,
          intervention: getDietaryIntervention('Serum Creatinine', assessment.serumCreatinine, 'reduce')
        });
      }
      
      if (assessment.bloodUrea && assessment.bloodUrea > 40) {
        analysis.primaryRiskFactors.push({
          factor: 'Blood Urea',
          value: `${assessment.bloodUrea} mg/dL`,
          impact: 0.2,
          intervention: getDietaryIntervention('Blood Urea', assessment.bloodUrea, 'reduce')
        });
      }
      
      if (assessment.bloodPressure && assessment.bloodPressure > 140) {
        analysis.primaryRiskFactors.push({
          factor: 'Blood Pressure',
          value: `${assessment.bloodPressure} mmHg`,
          impact: 0.15,
          intervention: getDietaryIntervention('Blood Pressure', assessment.bloodPressure, 'reduce')
        });
      }
    }
    
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
  const calculateNutritionalTargets = (assessment: CKDAssessment, shapFeatures: any) => {
    const targets = {
      protein: { min: 0.6, max: 0.8, unit: 'g/kg body weight', reasoning: '' },
      sodium: { max: 2000, unit: 'mg/day', reasoning: '' },
      potassium: { max: 3000, unit: 'mg/day', reasoning: '' },
      phosphorus: { max: 1000, unit: 'mg/day', reasoning: '' },
      fluids: { target: 1500, unit: 'ml/day', reasoning: '' }
    };

    // Adjust targets based on SHAP analysis
    const highRiskFeatures = Array.isArray(shapFeatures) ? shapFeatures.filter(f => f.impact > 0.1) : [];
    
    if (highRiskFeatures.some(f => f.name === 'Serum Creatinine')) {
      targets.protein.max = 0.6;
      targets.protein.reasoning = 'Reduced due to elevated creatinine indicating kidney stress';
    }
    
    if (highRiskFeatures.some(f => f.name === 'Blood Pressure')) {
      targets.sodium.max = 1500;
      targets.sodium.reasoning = 'Strictly limited due to hypertension risk';
    }
    
    // Basic assessment-based adjustments when SHAP not available
    if (assessment.serumCreatinine && parseFloat(assessment.serumCreatinine.toString()) > 1.5) {
      targets.protein.max = 0.6;
      targets.protein.reasoning = 'Reduced due to elevated creatinine levels';
    }
    
    if (assessment.bloodPressure && assessment.bloodPressure > 140) {
      targets.sodium.max = 1500;
      targets.sodium.reasoning = 'Restricted due to high blood pressure';
    }
    
    if (assessment.potassium && parseFloat(assessment.potassium.toString()) > 5.0) {
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
    const advice = [
      "Discuss your personal fluid target with a qualified clinician",
      "Count all beverages when tracking fluid intake",
      "Watch for changes in swelling, breathing, thirst, or urine output",
      "Do not restrict or substantially increase fluids based only on this educational report",
    ];

    if (assessment?.pedalEdema === "yes") {
      advice.push("Mention the reported swelling when asking for an individualized fluid plan");
    }

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
    const { generateDietPlanPDF } = await import("@/lib/pdfGenerator");
    await generateDietPlanPDF(dietPlan, assessment);
  };

  if (!hasAccess) {
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
        <div className="loading-indicator" role="status" aria-label="Loading diet plan"><i /><i /><i /></div>
      </div>
    );
  }

  const foodsToEat = dietPlan ? dietPlan.foodsToEat.split(', ') : [];
  const foodsToAvoid = dietPlan ? dietPlan.foodsToAvoid.split(', ') : [];

  const factorLabel = (factor: string) => {
    const labels: Record<string, [string, string]> = {
      "Serum Creatinine": ["Serum creatinine", "सीरम क्रिएटिनिन"],
      "Blood Urea": ["Blood urea", "ब्लड यूरिया"],
      "Blood Pressure": ["Blood pressure", "रक्तचाप"],
      "Blood Glucose Random": ["Random blood glucose", "रैंडम ब्लड ग्लूकोज"],
      Albumin: ["Albumin", "एल्ब्यूमिन"],
      Sodium: ["Sodium", "सोडियम"],
      Potassium: ["Potassium", "पोटैशियम"],
      Hemoglobin: ["Hemoglobin", "हीमोग्लोबिन"],
    };

    const label = labels[factor];
    return label ? t(label[0], label[1]) : factor;
  };

  return (
    <div className="diet-page app-page">
      <PageIntro
        eyebrow={t("Food and fluid guidance", "भोजन और तरल मार्गदर्शन")}
        title={t("A practical diet brief for discussion.", "चर्चा के लिए एक व्यावहारिक आहार सारांश।")}
        description={t("Use this educational plan to prepare questions for a renal dietitian or clinician. Individual needs can differ significantly.", "इस शैक्षिक योजना का उपयोग रीनल डाइटिशियन या चिकित्सक के लिए प्रश्न तैयार करने में करें। व्यक्तिगत जरूरतें काफी अलग हो सकती हैं।")}
        actions={<Button onClick={downloadDietPlan}><Download />{t("Download diet brief", "आहार सारांश डाउनलोड करें")}</Button>}
        aside={<div className="diet-intro-signal"><span aria-hidden="true">DIET VIEW</span><strong>{dietType === "vegetarian" ? t("Vegetarian view", "शाकाहारी दृश्य") : t("Non-vegetarian view", "मांसाहारी दृश्य")}</strong><p>{t("Switch the view below without losing this report.", "नीचे दृश्य बदलें, रिपोर्ट सुरक्षित रहेगी।")}</p></div>}
      />

      <section className="diet-workspace">
        <div className="diet-workspace__content">
          {assessment && (() => {
            const shapAnalysis = generateShapBasedDietAnalysis(assessment);
            const factors = [...shapAnalysis.primaryRiskFactors, ...shapAnalysis.protectiveFactors].slice(0, 5);

            return (
              <div className="diet-analysis">
                <header className="diet-section-heading">
                  <span>01</span>
                  <div>
                    <p className="section-kicker">{t("Assessment context", "मूल्यांकन संदर्भ")}</p>
                    <h2>{t("Signals to bring into the diet conversation", "आहार संबंधी बातचीत में शामिल करने योग्य संकेत")}</h2>
                    <p>{t("These values explain why some foods may need a closer look. They do not set a diet or nutrient target on their own.", "ये मान बताते हैं कि किन खाद्य पदार्थों पर अधिक ध्यान देने की जरूरत हो सकती है। ये अपने आप आहार या पोषक लक्ष्य तय नहीं करते।")}</p>
                  </div>
                </header>

                <div className="diet-factor-ledger">
                  {factors.length > 0 ? factors.map((factor: any, index: number) => (
                    <article className="diet-factor-row" key={`${factor.factor}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{factorLabel(factor.factor)}</strong>
                        <small>{String(factor.value)}</small>
                      </div>
                      <div className="diet-factor-meter" aria-label={`${Math.round(factor.impact * 100)}% model influence`}>
                        <i style={{ width: `${Math.min(Math.max(Math.abs(factor.impact) * 100, 8), 100)}%` }} />
                      </div>
                      <b>{Math.round(Math.abs(factor.impact) * 100)}%</b>
                    </article>
                  )) : (
                    <p className="diet-analysis__empty">{t("No individual factor weighting was available for this report.", "इस रिपोर्ट के लिए व्यक्तिगत कारक भार उपलब्ध नहीं था।")}</p>
                  )}
                </div>

                <div className="diet-context-strip">
                  <span aria-hidden="true">DISCUSS</span>
                  <div>
                    <strong>{t("Use this as appointment preparation", "इसे मुलाकात की तैयारी के रूप में उपयोग करें")}</strong>
                    <p>{t("Ask a renal dietitian to interpret these signals alongside medicines, repeat labs, body weight and stage of kidney disease.", "रीनल डाइटिशियन से इन संकेतों को दवाओं, दोबारा किए गए लैब टेस्ट, शरीर के वजन और किडनी रोग की अवस्था के साथ समझने के लिए कहें।")}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          <header className="diet-section-heading diet-section-heading--compact">
            <span>02</span>
            <div>
              <p className="section-kicker">{t("Preference", "पसंद")}</p>
              <h2>{t("Choose the food pattern to review", "समीक्षा के लिए भोजन का प्रकार चुनें")}</h2>
            </div>
          </header>

          <div className="diet-mode" role="group" aria-label={t("Diet type", "आहार प्रकार")}>
            <div>
              <Button
                variant={dietType === 'vegetarian' ? 'default' : 'ghost'}
                onClick={() => toggleDietType('vegetarian')}
                aria-pressed={dietType === 'vegetarian'}
              >
                {t("Vegetarian", "शाकाहारी")}
              </Button>
              <Button
                variant={dietType === 'non-vegetarian' ? 'default' : 'ghost'}
                onClick={() => toggleDietType('non-vegetarian')}
                aria-pressed={dietType === 'non-vegetarian'}
              >
                {t("Non-Vegetarian", "मांसाहारी")}
              </Button>
            </div>
          </div>

          <div id="diet-plan-content" className="diet-columns">
            <article className="diet-column diet-column--eat">
              <header><strong aria-hidden="true">A</strong><div><span>{t("Review list A", "समीक्षा सूची ए")}</span><h3>{t("Food examples to discuss", "चर्चा के लिए भोजन के उदाहरण")}</h3></div></header>
              <ul>
                {foodsToEat.map((food: string, index: number) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{food}</p></li>)}
              </ul>
            </article>

            <article className="diet-column diet-column--avoid">
              <header><strong aria-hidden="true">B</strong><div><span>{t("Review list B", "समीक्षा सूची बी")}</span><h3>{t("Foods to ask about limiting", "सीमित करने के बारे में पूछने योग्य खाद्य पदार्थ")}</h3></div></header>
              <ul>
                {foodsToAvoid.map((food: string, index: number) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{food}</p></li>)}
              </ul>
            </article>
          </div>

          <section className="fluid-guidance">
            <div className="fluid-guidance__icon" aria-hidden="true"><span>FLUID / 03</span></div>
            <div>
              <p className="section-kicker">{t("Fluid discussion", "तरल संबंधी चर्चा")}</p>
              <h2>{t("Do not guess a personal fluid target", "व्यक्तिगत तरल लक्ष्य का अनुमान न लगाएं")}</h2>
              <p>{t("Kidney function, swelling, urine output, medicines and heart health can all change what is appropriate. Confirm any increase or restriction with a qualified clinician.", "किडनी की कार्यप्रणाली, सूजन, पेशाब की मात्रा, दवाएं और हृदय स्वास्थ्य सभी सही मात्रा को बदल सकते हैं। किसी भी बढ़ोतरी या कमी की पुष्टि योग्य चिकित्सक से करें।")}</p>
            </div>
            <ul>
              <li>{t("Track all drinks, not only water.", "केवल पानी ही नहीं, सभी पेय नोट करें।")}</li>
              <li>{t("Mention swelling or shortness of breath promptly.", "सूजन या सांस फूलने की जानकारी तुरंत दें।")}</li>
              <li>{t("Bring recent lab results to the discussion.", "हाल के लैब परिणाम साथ लेकर जाएं।")}</li>
            </ul>
          </section>

          <div className="diet-download">
            <div>
              <p className="section-kicker">{t("Take it with you", "इसे साथ ले जाएं")}</p>
              <h2>{t("Bring the brief to a professional review.", "सारांश को पेशेवर समीक्षा के लिए ले जाएं।")}</h2>
              <p>{t("Use the PDF to support a conversation, not as a prescription.", "पीडीएफ का उपयोग बातचीत के सहायक के रूप में करें, न कि चिकित्सकीय निर्देश के रूप में।")}</p>
            </div>
            <Button size="lg" onClick={downloadDietPlan}>
              <Download aria-hidden="true" />
              {t("Download diet brief", "आहार सारांश डाउनलोड करें")}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
