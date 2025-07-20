import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCKDAssessmentSchema, insertDietPlanSchema, insertChatMessageSchema } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI with API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
  });

  // AI-powered medical chatbot endpoint
  app.post("/api/chat-direct", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Use OpenAI GPT-4o for intelligent responses
      const reply = await getAIPoweredNephroBotResponse(message);
      return res.json({ reply });
      
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI-powered NephroBot using OpenAI GPT-4o with intelligent fallback
async function getAIPoweredNephroBotResponse(message: string): Promise<string> {
  try {
    // Use the newest OpenAI model GPT-4o which was released May 13, 2024. Do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are NephroBot, an advanced AI medical specialist focused exclusively on nephrology and kidney health. Your expertise includes:

CORE SPECIALIZATIONS:
- Chronic Kidney Disease (CKD) diagnosis, staging, and management
- Acute kidney injury (AKI) recognition and treatment
- Laboratory interpretation (creatinine, eGFR, BUN, proteinuria, electrolytes)
- Renal replacement therapy (hemodialysis, peritoneal dialysis, transplant)
- Nephrology pharmacology and drug dosing adjustments
- Renal nutrition and dietary management
- Mineral bone disease and CKD complications
- Hypertension management in kidney disease
- Diabetic nephropathy and other glomerular diseases

RESPONSE GUIDELINES:
- Provide detailed, evidence-based medical information
- Use current nephrology guidelines and best practices
- Explain complex concepts clearly for patients and healthcare providers
- Include specific values, ranges, and clinical recommendations
- Always emphasize the importance of consulting healthcare providers
- Be comprehensive but organized with clear sections
- Use medical terminology appropriately with explanations

SAFETY DISCLAIMERS:
- Always remind users that this information is educational
- Emphasize the need for professional medical consultation
- Never provide specific diagnoses for individual cases
- Recommend emergency care when appropriate

Format responses with clear sections, bullet points, and medical accuracy. Be the most knowledgeable kidney specialist the user could consult with.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more accurate medical information
    });

    return response.choices[0].message.content || getEnhancedNephroBotResponse(message);
    
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Check if it's a quota/rate limit error and provide enhanced fallback
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.log('Using enhanced medical knowledge fallback due to API quota limits');
      return getEnhancedNephroBotResponse(message);
    }
    
    // For other errors, use enhanced fallback
    return getEnhancedNephroBotResponse(message);
  }
}

// Enhanced medical knowledge fallback system
function getEnhancedNephroBotResponse(message: string): string {
  const msg = message.toLowerCase();

  // Greetings with medical focus
  if (/(hello|hi|hey|good morning|good afternoon|good evening|greetings)/i.test(msg)) {
    return "Hello! I'm NephroBot, your AI-powered kidney health specialist. I'm equipped with comprehensive medical knowledge about chronic kidney disease, lab interpretations, treatments, and lifestyle management. Whether you need help understanding lab results, CKD stages, medications, or dietary recommendations, I'm here to provide detailed, evidence-based information. What kidney health question can I help you with today?";
  }

  // Hemoglobin questions
  if (/(hemo|hemoglobin|hgb|anemia)/i.test(msg)) {
    return "**Hemoglobin in Chronic Kidney Disease**\n\n**NORMAL VALUES:**\n• **Men:** 13.8-17.2 g/dL\n• **Women:** 12.1-15.1 g/dL\n• **CKD Target:** 11-12 g/dL (to avoid complications)\n\n**WHY HEMOGLOBIN DROPS IN CKD:**\n• **Reduced EPO production:** Kidneys produce erythropoietin hormone\n• **Iron deficiency:** Poor absorption, chronic inflammation\n• **Uremic toxins:** Suppress bone marrow function\n• **Shortened red cell life:** Uremic environment damages cells\n\n**SYMPTOMS OF LOW HEMOGLOBIN:**\n• Fatigue and weakness\n• Shortness of breath\n• Cold hands and feet\n• Pale skin, nail beds\n• Difficulty concentrating\n• Rapid heartbeat\n\n**TREATMENT OPTIONS:**\n• **Iron supplements:** Oral or IV iron therapy\n• **ESA therapy:** Epoetin alfa, darbepoetin\n• **Newer agents:** HIF inhibitors (roxadustat)\n• **Dietary support:** Iron-rich foods, vitamin B12, folate\n\n*Anemia management requires close monitoring. Work with your nephrologist for optimal treatment.*";
  }

  // CKD comprehensive information
  if (/(what is ckd|chronic kidney disease|kidney disease|ckd)/i.test(msg)) {
    return "**Chronic Kidney Disease (CKD) - Comprehensive Overview**\n\n**DEFINITION:** CKD is the gradual, progressive loss of kidney function over months to years, defined as eGFR <60 mL/min/1.73m² for >3 months OR evidence of kidney damage.\n\n**STAGES & eGFR VALUES:**\n• **Stage 1:** eGFR ≥90 + kidney damage (proteinuria/hematuria)\n• **Stage 2:** eGFR 60-89 + kidney damage\n• **Stage 3a:** eGFR 45-59 (moderate decrease)\n• **Stage 3b:** eGFR 30-44 (moderate-severe decrease)\n• **Stage 4:** eGFR 15-29 (severe, pre-dialysis planning)\n• **Stage 5:** eGFR <15 (kidney failure, RRT needed)\n\n**PRIMARY CAUSES:**\n• Diabetes mellitus (45% of cases)\n• Hypertension (27% of cases)\n• Glomerulonephritis\n• Polycystic kidney disease\n• Autoimmune conditions\n\n**KEY COMPLICATIONS:**\n• Cardiovascular disease (leading cause of death)\n• Anemia and bone disease\n• Electrolyte imbalances\n• Fluid retention and edema\n\n*This information is educational. Consult your nephrologist for personalized medical advice.*";
  }

  // Lab values - Creatinine
  if (/(creatinine|serum creatinine|high creatinine)/i.test(msg)) {
    return "**Serum Creatinine - Critical Kidney Function Marker**\n\n**NORMAL REFERENCE RANGES:**\n• **Men:** 0.7-1.3 mg/dL (62-115 μmol/L)\n• **Women:** 0.6-1.1 mg/dL (53-97 μmol/L)\n• **Elderly:** May be lower due to decreased muscle mass\n\n**CLINICAL SIGNIFICANCE:**\n• Waste product of muscle metabolism\n• Filtered by glomeruli, minimally reabsorbed\n• Inversely proportional to kidney function\n• Used to calculate eGFR (most accurate assessment)\n\n**INTERPRETATION BY LEVELS:**\n• **1.4-1.9 mg/dL:** Suggests Stage 3 CKD\n• **2.0-4.0 mg/dL:** Likely Stage 4 CKD\n• **>4.0 mg/dL:** Stage 5 CKD, consider renal replacement therapy\n\n**FACTORS AFFECTING LEVELS:**\n• Muscle mass, age, diet, medications\n• Dehydration, certain drugs (NSAIDs, contrast)\n• Can remain normal until 50% kidney function is lost\n\n**CLINICAL PEARL:** Rising creatinine indicates worsening kidney function and requires nephrology evaluation.\n\n*Always consult your healthcare provider for proper interpretation of your specific lab results.*";
  }

  // Blood pressure questions
  if (/(blood pressure|hypertension|high bp|bp)/i.test(msg)) {
    return "**Blood Pressure in Chronic Kidney Disease**\n\n**TARGET BP IN CKD:**\n• **General CKD:** <130/80 mmHg\n• **With proteinuria:** <120/80 mmHg for maximum kidney protection\n• **Diabetes + CKD:** <130/80 mmHg\n\n**WHY BP CONTROL IS CRITICAL:**\n• Slows CKD progression significantly\n• Reduces cardiovascular risk (leading cause of death)\n• Protects remaining kidney function\n• Prevents heart disease and stroke\n\n**FIRST-LINE MEDICATIONS:**\n• **ACE Inhibitors:** Lisinopril, enalapril - reduce proteinuria\n• **ARBs:** Losartan, valsartan - kidney protective\n• **Calcium Channel Blockers:** Amlodipine for additional control\n• **Diuretics:** Help with fluid management\n\n**LIFESTYLE MODIFICATIONS:**\n• **Sodium restriction:** <2,300 mg/day (1 teaspoon salt)\n• **Weight management:** Lose excess weight\n• **Regular exercise:** 150 minutes/week moderate activity\n• **Limit alcohol:** <2 drinks/day men, <1 drink/day women\n• **Stress management:** Meditation, yoga, adequate sleep\n\n*Uncontrolled hypertension accelerates kidney damage. Work closely with your healthcare team for optimal BP management.*";
  }

  // eGFR information
  if (/(egfr|gfr|glomerular filtration)/i.test(msg)) {
    return "**eGFR (Estimated Glomerular Filtration Rate) - Gold Standard**\n\n**CALCULATION METHOD:**\n• CKD-EPI equation (most accurate)\n• Factors: Age, sex, race, serum creatinine\n• Expressed as mL/min/1.73m² body surface area\n\n**NORMAL VALUES & INTERPRETATION:**\n• **Young adults:** >120 mL/min/1.73m²\n• **Adults >40 years:** >90 mL/min/1.73m²\n• **Age-related decline:** ~1 mL/min/year after age 30\n\n**MONITORING FREQUENCY BY STAGE:**\n• **Stages 1-2:** Annual monitoring\n• **Stage 3a:** Every 6 months\n• **Stage 3b-4:** Every 3 months\n• **Stage 5:** Monthly monitoring\n\n**RAPID DECLINE ALERT:**\n• >5 mL/min/year decline = High risk\n• Requires urgent nephrology referral\n• May indicate progressive kidney disease\n\n**CLINICAL APPLICATIONS:**\n• Drug dosing adjustments\n• Referral timing for specialists\n• Dialysis/transplant planning\n• Cardiovascular risk assessment\n\n*eGFR is the most reliable measure of kidney function. Discuss trends with your nephrologist.*";
  }

  // Symptoms
  if (/(symptoms|signs|feel|tired|fatigue|swelling|nausea)/i.test(msg)) {
    return "**CKD Symptoms by Stage - Clinical Presentation**\n\n**EARLY STAGES (1-3a) - Often Silent:**\n• Subtle fatigue or weakness\n• Mild blood pressure elevation\n• Occasional foamy urine (proteinuria)\n• Generally asymptomatic (why screening is crucial)\n\n**MODERATE CKD (3b-4) - Symptoms Emerge:**\n• **Fatigue:** Due to anemia, toxin buildup, acidosis\n• **Edema:** Starting in ankles, progressing upward\n• **Breathlessness:** From fluid retention and anemia\n• **Nausea/Loss of appetite:** Uremic toxin effects\n• **Cognitive issues:** Concentration difficulties\n• **Bone/joint pain:** Mineral bone disease onset\n\n**ADVANCED CKD (Stage 5) - Multiple Systems:**\n• **Uremic symptoms:** Severe nausea, metallic taste\n• **Fluid overload:** Pulmonary edema, severe swelling\n• **Electrolyte disorders:** Dangerous heart rhythms\n• **Neurologic:** Confusion, seizures (uremic encephalopathy)\n• **Cardiovascular:** Pericarditis, heart failure\n• **Dermatologic:** Severe itching, uremic frost (rare)\n\n**🚨 EMERGENCY WARNING SIGNS:**\n• Difficulty breathing or chest pain\n• Severe swelling (face, hands)\n• Confusion or altered mental status\n• Significant decrease in urination\n• Persistent vomiting\n\n*Early CKD detection through lab screening is vital since symptoms appear late. Seek immediate medical attention for warning signs.*";
  }

  // Medications
  if (/(medication|drugs|medicine|pills|treatment)/i.test(msg)) {
    return "**CKD Medications - Comprehensive Nephropharmacology**\n\n**KIDNEY PROTECTIVE AGENTS:**\n• **ACE Inhibitors:** Lisinopril, enalapril - reduce proteinuria, slow progression\n• **ARBs:** Losartan, valsartan - alternative to ACE-I, fewer side effects\n• **SGLT2 Inhibitors:** Empagliflozin, dapagliflozin - revolutionary kidney/heart protection\n\n**COMPLICATION MANAGEMENT:**\n• **Anemia:** Iron supplements, ESAs (epoetin alfa), newer HIF inhibitors\n• **Bone Disease:** Active vitamin D (calcitriol), phosphate binders\n• **Acidosis:** Sodium bicarbonate (target >22 mEq/L)\n• **Hyperkalemia:** Patiromer, sodium zirconium cyclosilicate\n• **Hypertension:** Multiple agents often needed\n\n**⚠️ NEPHROTOXIC - AVOID/USE CAUTIOUSLY:**\n• **NSAIDs:** Ibuprofen, naproxen (reduce kidney blood flow)\n• **Contrast agents:** Pre-hydration essential, minimize exposure\n• **Aminoglycosides:** Gentamicin (direct nephrotoxicity)\n• **Metformin:** Discontinue if eGFR <30\n• **Proton pump inhibitors:** Long-term use linked to CKD progression\n\n**DOSE ADJUSTMENTS BY eGFR:**\n• **30-59 mL/min:** Reduce doses of renally cleared drugs\n• **15-29 mL/min:** Significant dose modifications needed\n• **<15 mL/min:** Many medications contraindicated\n\n*Medication management in CKD is complex. Work closely with your nephrologist and pharmacist for safe, effective treatment.*";
  }

  // Diet and nutrition
  if (/(diet|food|nutrition|eat|protein|sodium|potassium)/i.test(msg)) {
    return "**Renal Nutrition - Evidence-Based Dietary Management**\n\n**PROTEIN MANAGEMENT:**\n• **Stages 1-2:** Normal intake (0.8-1.0 g/kg/day)\n• **Stages 3-4:** Moderate restriction (0.6-0.8 g/kg/day)\n• **Dialysis:** Increased needs (1.2-1.4 g/kg/day)\n• **Focus:** High biological value proteins (eggs, fish, lean meat)\n\n**SODIUM RESTRICTION:**\n• **Target:** <2,300 mg/day (1 teaspoon salt)\n• **Severe cases:** <2,000 mg/day\n• **Hidden sources:** Processed foods, restaurant meals, canned goods\n• **Reading labels:** Check sodium content per serving\n\n**POTASSIUM MANAGEMENT:**\n• **Normal intake:** 2,000-4,000 mg/day\n• **Restrict if K+ >5.0 mEq/L**\n• **High K+ foods:** Bananas, oranges, potatoes, tomatoes, nuts\n• **Cooking tips:** Leaching (soaking/boiling removes potassium)\n\n**PHOSPHORUS CONTROL:**\n• **Target:** 800-1,000 mg/day in advanced CKD\n• **Limit:** Dairy products, nuts, seeds, cola drinks\n• **Phosphate binders:** Take with meals if prescribed\n• **Organic vs inorganic:** Natural phosphorus better absorbed\n\n**FLUID MANAGEMENT:**\n• **Early CKD:** Maintain adequate hydration\n• **Advanced CKD:** May require restriction\n• **Monitor:** Daily weight checks\n• **Dialysis:** <2 lbs gain between sessions\n\n*Work with a certified renal dietitian for personalized meal planning. Dietary needs vary significantly by CKD stage.*";
  }

  // Default comprehensive response
  return "**I'm NephroBot - Your Advanced Kidney Health AI Specialist**\n\n🧠 **MY EXPERTISE:**\n• Advanced laboratory interpretation (creatinine, eGFR, proteinuria)\n• CKD staging, progression monitoring, and prognosis\n• Comprehensive medication management and drug interactions\n• Evidence-based renal nutrition and dietary planning\n• Dialysis education and transplant preparation\n• Complication prevention and symptom management\n• Emergency recognition and when to seek care\n\n🎯 **I PROVIDE:**\n• Detailed explanations of complex kidney conditions\n• Interpretation of lab values and trends\n• Medication guidance and safety information\n• Dietary recommendations by CKD stage\n• Treatment options and decision support\n• Lifestyle modifications for kidney health\n\n💡 **FOR OPTIMAL HELP:**\nAsk specific questions about:\n- Lab results or symptoms\n- CKD stages or progression\n- Medications or treatments\n- Diet and lifestyle changes\n- Dialysis or transplant questions\n\n*I provide evidence-based medical education to help you make informed decisions about your kidney health. Always consult your healthcare team for personalized medical advice and treatment decisions.*\n\nWhat kidney health topic would you like to explore in detail?";
}