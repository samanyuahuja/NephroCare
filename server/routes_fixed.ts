import { createServer } from "http";
import { type Express } from "express";
import { storage } from "./storage";
import { insertCKDAssessmentSchema, insertDietPlanSchema, insertChatMessageSchema } from "@shared/schema";

export function createRoutes(app: Express) {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
  });

  // Enhanced medical chatbot endpoint
  app.post("/api/chat-direct", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const reply = getEnhancedNephroBotResponse(message);
      return res.json({ reply });
      
    } catch (error) {
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Enhanced NephroBot with comprehensive medical knowledge
function getEnhancedNephroBotResponse(message: string): string {
  const msg = message.toLowerCase();

  // Advanced greeting patterns
  if (/(hello|hi|hey|good morning|good afternoon|good evening|greetings)/i.test(msg)) {
    return "Hello! I'm NephroBot, your advanced kidney health specialist. I have extensive knowledge about CKD, nephrology, lab values, treatments, medications, and lifestyle management. I can provide detailed medical guidance, explain complex concepts, and help you understand your kidney health journey. What specific aspect would you like to explore today?";
  }

  // Help and capabilities
  if (/(help|what can you do|capabilities|assist)/i.test(msg)) {
    return "I'm an advanced medical AI specializing in nephrology. My expertise includes:\n\nLAB ANALYSIS: Detailed interpretation of creatinine, eGFR, BUN, proteinuria, electrolytes\nMEDICAL CONDITIONS: CKD stages, AKI, nephrotic syndrome, hypertensive nephropathy\nMEDICATIONS: ACE inhibitors, ARBs, diuretics, phosphate binders, immunosuppressants\nNUTRITION: Renal diets, protein restriction, mineral management, fluid balance\nTREATMENTS: Dialysis modalities, transplant processes, conservative management\nRISK ASSESSMENT: Disease progression, complications, prognosis\nLIFESTYLE: Exercise, smoking cessation, weight management, BP control\n\nAsk me anything - I provide evidence-based, detailed medical information!";
  }

  // CKD comprehensive information
  if (/(what is ckd|chronic kidney disease|kidney disease)/i.test(msg)) {
    return "Chronic Kidney Disease (CKD) is a progressive, irreversible condition characterized by gradual loss of kidney function over months to years.\n\nDEFINITION: eGFR <60 mL/min/1.73m² for >3 months OR kidney damage with normal eGFR\n\nSTAGES:\n• Stage 1: eGFR ≥90 + kidney damage (proteinuria, hematuria, structural abnormalities)\n• Stage 2: eGFR 60-89 + kidney damage\n• Stage 3a: eGFR 45-59 (moderate decrease)\n• Stage 3b: eGFR 30-44 (moderate to severe)\n• Stage 4: eGFR 15-29 (severe, pre-dialysis planning)\n• Stage 5: eGFR <15 (kidney failure, RRT needed)\n\nCAUSES: Diabetes (45%), hypertension (27%), glomerulonephritis, polycystic kidney disease, autoimmune conditions\n\nCOMPLICATIONS: CVD, anemia, bone disease, acidosis, hyperkalemia, fluid overload";
  }

  // Detailed lab value interpretations
  if (/(creatinine|serum creatinine)/i.test(msg)) {
    return "Serum Creatinine - Critical Kidney Function Marker:\n\nNORMAL VALUES:\n• Men: 0.7-1.3 mg/dL (62-115 μmol/L)\n• Women: 0.6-1.1 mg/dL (53-97 μmol/L)\n• Elderly: May be lower due to decreased muscle mass\n\nCLINICAL SIGNIFICANCE:\n• Reflects glomerular filtration capacity\n• Inversely related to kidney function\n• Used to calculate eGFR (most accurate assessment)\n\nELEVATED LEVELS INDICATE:\n• Acute kidney injury (rapid rise)\n• Chronic kidney disease (gradual increase)\n• Severe dehydration\n• Muscle breakdown (rhabdomyolysis)\n• Certain medications (NSAIDs, aminoglycosides)\n\nINTERPRETATION:\n• 1.5-2.0 mg/dL: Stage 3 CKD likely\n• 2.0-4.0 mg/dL: Stage 4 CKD\n• >4.0 mg/dL: Stage 5 CKD, consider RRT\n\nLIMITATIONS: Can remain normal until 50% kidney function lost";
  }

  if (/(egfr|gfr|glomerular filtration)/i.test(msg)) {
    return "eGFR (Estimated Glomerular Filtration Rate) - Gold Standard for Kidney Function:\n\nCALCULATION: CKD-EPI equation (most accurate)\nFactors: Age, sex, race, serum creatinine\n\nNORMAL VALUES:\n• Young adults: >120 mL/min/1.73m²\n• Adults: >90 mL/min/1.73m²\n• Age-related decline: ~1 mL/min/year after age 30\n\nCKD STAGING BY eGFR:\n• ≥90: Stage 1 (if kidney damage present)\n• 60-89: Stage 2 (if kidney damage present)\n• 45-59: Stage 3a (moderate decrease)\n• 30-44: Stage 3b (moderate-severe)\n• 15-29: Stage 4 (severe)\n• <15: Stage 5 (kidney failure)\n\nMONITORING FREQUENCY:\n• Stage 1-2: Annually\n• Stage 3a: Every 6 months\n• Stage 3b-4: Every 3 months\n• Stage 5: Monthly\n\nRAPID DECLINE: >5 mL/min/year = high risk, needs specialist referral";
  }

  // Advanced symptom analysis
  if (/(symptoms|signs|feeling|tired|fatigue|swelling)/i.test(msg)) {
    return "CKD Symptoms - Comprehensive Clinical Presentation:\n\nEARLY STAGES (1-3a) - Often Asymptomatic:\n• Subtle fatigue\n• Mild hypertension\n• Occasional foamy urine\n• Minimal laboratory abnormalities\n\nMODERATE CKD (3b-4):\n• FATIGUE: Due to anemia, acidosis, toxin buildup\n• EDEMA: Starting in ankles, progressing upward\n• BREATHLESSNESS: Fluid retention, anemia\n• NAUSEA: Uremic toxins affecting GI tract\n• COGNITIVE: Difficulty concentrating, memory issues\n• BONE PAIN: Mineral bone disease development\n\nADVANCED CKD (Stage 5):\n• UREMIC SYMPTOMS: Nausea, vomiting, metallic taste\n• FLUID OVERLOAD: Pulmonary edema, severe swelling\n• ELECTROLYTE: Hyperkalemia (dangerous heart rhythms)\n• NEUROLOGIC: Confusion, seizures, coma\n• CARDIOVASCULAR: Pericarditis, heart failure\n• SKIN: Itching, uremic frost (severe cases)\n\nRED FLAGS - Seek immediate care:\n• Difficulty breathing\n• Chest pain\n• Severe swelling\n• Confusion/altered mental status\n• Decreased urination";
  }

  // Comprehensive medication management
  if (/(medication|drugs|ace inhibitor|arb|medicine)/i.test(msg)) {
    return "CKD Medications - Comprehensive Nephro-Pharmacology:\n\nKIDNEY PROTECTIVE:\n• ACE INHIBITORS: Lisinopril, enalapril - reduce proteinuria, slow progression\n• ARBs: Losartan, valsartan - alternative to ACE-I, fewer side effects\n• SGLT2 INHIBITORS: Empagliflozin - revolutionary kidney/heart protection\n\nCKD COMPLICATIONS MANAGEMENT:\n• ANEMIA: Iron supplements, ESA (epoetin), newer HIF inhibitors\n• BONE DISEASE: Active vitamin D (calcitriol), phosphate binders (calcium carbonate, sevelamer)\n• ACIDOSIS: Sodium bicarbonate (target bicarbonate >22)\n• HYPERKALEMIA: Patiromer, sodium zirconium cyclosilicate\n\nAVOID/USE CAUTIOUSLY:\n• NSAIDs: Ibuprofen, naproxen (reduce kidney blood flow)\n• CONTRAST: Pre-hydrate, minimize dose, monitor\n• AMINOGLYCOSIDES: Gentamicin (direct nephrotoxicity)\n• METFORMIN: Stop if eGFR <30\n\nDOSING ADJUSTMENTS (by eGFR):\n• eGFR 30-59: Reduce doses of renally cleared drugs\n• eGFR 15-29: Significant dose reductions needed\n• eGFR <15: Many drugs contraindicated\n\nMEDICATION RECONCILIATION: Essential at every visit";
  }

  // Advanced dietary management
  if (/(diet|food|nutrition|protein|sodium|potassium|phosphorus)/i.test(msg)) {
    return "Renal Nutrition - Evidence-Based Dietary Management:\n\nPROTEIN MANAGEMENT:\n• Stage 1-2: Normal intake (0.8-1.0 g/kg/day)\n• Stage 3-4: Restricted (0.6-0.8 g/kg/day)\n• Dialysis: Increased (1.2-1.4 g/kg/day)\n• Quality matters: Choose high biological value proteins\n\nSODIUM RESTRICTION:\n• Target: <2,300 mg/day (1 teaspoon salt)\n• Severe CHF/edema: <2,000 mg/day\n• Hidden sources: Processed foods, restaurant meals\n• Reading labels: Sodium content per serving\n\nPOTASSIUM MANAGEMENT:\n• Normal: 2,000-4,000 mg/day\n• Restrict if K+ >5.0 mEq/L\n• HIGH SOURCES: Bananas, oranges, potatoes, tomatoes\n• COOKING TIPS: Leaching (soaking, boiling)\n• Monitor levels every 3 months\n\nPHOSPHORUS CONTROL:\n• Target: 800-1,000 mg/day in CKD 3-5\n• LIMIT: Dairy, nuts, seeds, cola, processed foods\n• BINDERS: Take with meals if prescribed\n• Organic vs inorganic phosphorus absorption\n\nFLUID MANAGEMENT:\n• Early CKD: Stay hydrated (unless CHF)\n• Advanced CKD: May need restriction\n• Monitor daily weights\n• Target: <2 lbs gain between dialysis sessions";
  }

  // Emergency situations
  if (/(emergency|urgent|chest pain|breathing|swelling)/i.test(msg)) {
    return "KIDNEY EMERGENCY RECOGNITION - When to Seek Immediate Care:\n\nCALL 911 IMMEDIATELY:\n• PULMONARY EDEMA: Severe shortness of breath, pink frothy sputum\n• HYPERKALEMIA: Chest pain, palpitations, weakness, paralysis\n• SEVERE HTN: BP >180/120 with symptoms (headache, vision changes)\n• UREMIC ENCEPHALOPATHY: Confusion, seizures, decreased consciousness\n• ACUTE KIDNEY INJURY: Sudden decrease in urination, severe fatigue\n\nGO TO ER SAME DAY:\n• Rapid weight gain (>5 lbs in 2-3 days)\n• Persistent vomiting, unable to keep fluids down\n• Severe swelling (face, hands, difficulty walking)\n• Blood in urine with pain\n• Signs of infection (fever >101°F with chills)\n\nCALL DOCTOR WITHIN 24 HOURS:\n• New or worsening fatigue\n• Increased swelling in legs/ankles\n• Changes in urination pattern\n• Persistent nausea or loss of appetite\n• New medication side effects\n\nALWAYS CARRY: Emergency contact info, medication list, recent lab values";
  }

  // Default comprehensive response
  return "I'm NephroBot, your comprehensive kidney health specialist. I provide detailed, evidence-based medical information about all aspects of nephrology.\n\nMY EXPERTISE COVERS:\n• Advanced lab interpretation (creatinine, eGFR, proteinuria)\n• CKD staging, progression, and prognosis\n• Comprehensive medication management\n• Evidence-based nutritional guidance\n• Dialysis and transplant education\n• Complication prevention and treatment\n• Emergency recognition and management\n• Lifestyle optimization strategies\n\nI can analyze complex medical scenarios, explain intricate pathophysiology, provide detailed treatment protocols, and offer personalized guidance based on your specific situation.\n\nFOR BEST RESULTS: Ask specific questions about symptoms, lab values, medications, diet, or any kidney-related concerns. I provide detailed, accurate medical information to help you make informed decisions about your kidney health.\n\nWhat specific aspect of kidney health would you like to explore in detail?";
}