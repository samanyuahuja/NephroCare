import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCKDAssessmentSchema, insertDietPlanSchema, insertChatMessageSchema } from "@shared/schema";
import OpenAI from "openai";
import { spawn } from 'child_process';

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

  // CKD Assessment endpoint with ML prediction
  app.post("/api/ckd-assessment", async (req, res) => {
    try {
      const validatedData = insertCKDAssessmentSchema.parse(req.body);
      
      // Create initial assessment
      const assessment = await storage.createCKDAssessment(validatedData);
      
      // Run ML prediction
      try {
        const predictionResult = await runCKDPrediction(validatedData);
        
        if (predictionResult.success) {
          // Update assessment with ML results
          // Generate SHAP/LIME/PDP visualizations
          let visualizationData = null;
          try {
            const modelInput = {
              age: validatedData.age || 45,
              bp: validatedData.bloodPressure || 120,
              al: validatedData.albumin === "unknown" ? 1 : validatedData.albumin,
              su: validatedData.sugar === "unknown" ? 1 : validatedData.sugar,
              rbc: validatedData.redBloodCells === "abnormal" ? "abnormal" : "normal",
              pc: validatedData.pusCell === "abnormal" ? "abnormal" : "normal",
              ba: "notpresent", // Default value
              bgr: validatedData.bloodGlucoseRandom === "unknown" ? 145 : validatedData.bloodGlucoseRandom,
              bu: validatedData.bloodUrea === "unknown" ? 35 : validatedData.bloodUrea,
              sc: validatedData.serumCreatinine === "unknown" ? 1.8 : validatedData.serumCreatinine,
              sod: validatedData.sodium === "unknown" ? 135 : validatedData.sodium,
              pot: validatedData.potassium === "unknown" ? 4.5 : validatedData.potassium,
              hemo: validatedData.hemoglobin === "unknown" ? 12 : validatedData.hemoglobin,
              wbcc: validatedData.wbcCount === "unknown" ? 7600 : validatedData.wbcCount,
              rbcc: validatedData.rbcCount === "unknown" ? 5.2 : validatedData.rbcCount,
              htn: validatedData.hypertension === "yes" ? "yes" : "no",
              dm: validatedData.diabetesMellitus === "yes" ? "yes" : "no",
              appet: validatedData.appetite === "poor" ? "poor" : "good",
              pe: validatedData.pedalEdema === "yes" ? "yes" : "no",
              ane: validatedData.anemia === "yes" ? "yes" : "no"
            };
            
            const vizProcess = spawn('python3', ['generate_shap_data.py', JSON.stringify({
              ...modelInput,
              prediction: predictionResult.probability,
              risk_level: predictionResult.risk_level
            })]);
            
            let vizOutput = '';
            vizProcess.stdout.on('data', (data) => {
              vizOutput += data.toString();
            });
            
            await new Promise((resolve) => {
              vizProcess.on('close', () => {
                if (vizOutput) {
                  try {
                    visualizationData = JSON.parse(vizOutput);
                  } catch (parseError) {
                    console.warn('Visualization parsing failed:', parseError);
                  }
                }
                resolve(null);
              });
            });
          } catch (vizError) {
            console.warn('Visualization generation failed:', vizError);
          }
          
          const updatedAssessment = await storage.updateCKDAssessmentResults(
            assessment.id,
            predictionResult.probability,
            predictionResult.risk_level,
            JSON.stringify({
              prediction: predictionResult.prediction,
              probability: predictionResult.probability,
              risk_level: predictionResult.risk_level,
              risk_color: predictionResult.risk_color,
              model_used: predictionResult.model_used || 'clinical',
              timestamp: new Date().toISOString(),
              visualizations: visualizationData
            })
          );
          
          res.json(updatedAssessment || assessment);
        } else {
          // Return assessment without ML prediction (fallback)
          console.warn('ML prediction failed, returning basic assessment:', predictionResult.error);
          res.json(assessment);
        }
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
        // Return basic assessment even if ML fails
        res.json(assessment);
      }
    } catch (error: any) {
      console.error('CKD Assessment error:', error);
      res.status(400).json({ error: error.message || "Failed to create assessment" });
    }
  });

  // Get CKD assessments (filtered by user's assessment IDs)
  app.get("/api/ckd-assessments/filtered", async (req, res) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== 'string') {
        return res.json([]);
      }
      
      const assessmentIds = JSON.parse(ids);
      const assessments = await storage.getCKDAssessmentsByIds(assessmentIds);
      res.json(assessments);
    } catch (error: any) {
      console.error('Get CKD Assessments error:', error);
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  // Get specific CKD assessment
  app.get("/api/ckd-assessment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getCKDAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error: any) {
      console.error('Get CKD Assessment error:', error);
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  // Diet Plan endpoint
  app.post("/api/diet-plan", async (req, res) => {
    try {
      const validatedData = insertDietPlanSchema.parse(req.body);
      const dietPlan = await storage.createDietPlan(validatedData);
      res.json(dietPlan);
    } catch (error: any) {
      console.error('Diet Plan error:', error);
      res.status(400).json({ error: error.message || "Failed to create diet plan" });
    }
  });

  // Get diet plans (filtered by user's assessment IDs)
  app.get("/api/diet-plans/filtered", async (req, res) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== 'string') {
        return res.json([]);
      }
      
      const assessmentIds = JSON.parse(ids);
      const dietPlans = await storage.getDietPlansByAssessmentIds(assessmentIds);
      res.json(dietPlans);
    } catch (error: any) {
      console.error('Get Diet Plans error:', error);
      res.status(500).json({ error: "Failed to fetch diet plans" });
    }
  });

  // Chat Messages endpoint (for conversation history)
  app.post("/api/chat-message", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const chatMessage = await storage.createChatMessage(validatedData);
      res.json(chatMessage);
    } catch (error: any) {
      console.error('Chat Message error:', error);
      res.status(400).json({ error: error.message || "Failed to create chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}



// ML Prediction Integration
async function runCKDPrediction(assessmentData: any): Promise<any> {
  return new Promise((resolve) => {
    try {
      
      // Map assessment data to model format
      const modelInput = {
        age: assessmentData.age || 45,
        bp: assessmentData.bloodPressure || 120,
        al: assessmentData.albumin === "unknown" ? 1 : assessmentData.albumin,
        su: assessmentData.sugar === "unknown" ? 1 : assessmentData.sugar,
        rbc: assessmentData.redBloodCells === "abnormal" ? "abnormal" : "normal",
        pc: assessmentData.pusCell === "abnormal" ? "abnormal" : "normal",
        ba: "notpresent", // Default value
        bgr: assessmentData.bloodGlucoseRandom === "unknown" ? 145 : assessmentData.bloodGlucoseRandom,
        bu: assessmentData.bloodUrea === "unknown" ? 35 : assessmentData.bloodUrea,
        sc: assessmentData.serumCreatinine === "unknown" ? 1.8 : assessmentData.serumCreatinine,
        sod: assessmentData.sodium === "unknown" ? 135 : assessmentData.sodium,
        pot: assessmentData.potassium === "unknown" ? 4.5 : assessmentData.potassium,
        hemo: assessmentData.hemoglobin === "unknown" ? 12 : assessmentData.hemoglobin,
        wbcc: assessmentData.wbcCount === "unknown" ? 7600 : assessmentData.wbcCount,
        rbcc: assessmentData.rbcCount === "unknown" ? 5.2 : assessmentData.rbcCount,
        htn: assessmentData.hypertension === "yes" ? "yes" : "no",
        dm: assessmentData.diabetesMellitus === "yes" ? "yes" : "no",
        appet: assessmentData.appetite === "poor" ? "poor" : "good",
        pe: assessmentData.pedalEdema === "yes" ? "yes" : "no",
        ane: assessmentData.anemia === "yes" ? "yes" : "no"
      };
      
      // Use python_predictor.py (clinical model - more reliable)
      const pythonProcess = spawn('python3', ['python_predictor.py', JSON.stringify(modelInput)]);
      
      let output = '';
      let error = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0 && output) {
          try {
            const result = JSON.parse(output.trim());
            if (result.success !== false) {
              resolve({ ...result, success: true });
              return;
            }
          } catch (parseError) {
            console.error('Error parsing ML output:', parseError);
          }
        }
        
        // Fallback to model predictor (if clinical fails)
        console.log('Trying ML model predictor...');
        const fallbackProcess = spawn('python3', ['model_predictor.py', JSON.stringify(modelInput)]);
        
        let fallbackOutput = '';
        
        fallbackProcess.stdout.on('data', (data) => {
          fallbackOutput += data.toString();
        });
        
        fallbackProcess.on('close', (fallbackCode) => {
          if (fallbackCode === 0 && fallbackOutput) {
            try {
              const fallbackResult = JSON.parse(fallbackOutput.trim());
              resolve({ ...fallbackResult, success: true, model_used: 'clinical_fallback' });
            } catch (parseError) {
              resolve({
                success: false,
                error: `Fallback prediction parsing failed: ${parseError}`,
                prediction: 0,
                probability: 0.0,
                risk_level: 'Unknown'
              });
            }
          } else {
            resolve({
              success: false,
              error: `Both ML and clinical prediction failed. ML error: ${error}, Fallback code: ${fallbackCode}`,
              prediction: 0,
              probability: 0.0,
              risk_level: 'Error'
            });
          }
        });
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        pythonProcess.kill();
        resolve({
          success: false,
          error: 'ML prediction timeout',
          prediction: 0,
          probability: 0.0,
          risk_level: 'Timeout'
        });
      }, 30000);
      
    } catch (error) {
      resolve({
        success: false,
        error: `ML prediction setup failed: ${error}`,
        prediction: 0,
        probability: 0.0,
        risk_level: 'Error'
      });
    }
  });
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

  // Edema (swelling) questions
  if (/(edema|swelling|pedal|fluid retention|puffiness)/i.test(msg)) {
    return "**Edema (Swelling) in Chronic Kidney Disease**\n\n**WHAT IS PEDAL EDEMA:**\n• Fluid accumulation in tissues, especially legs and ankles\n• Common symptom in moderate to advanced CKD\n• Results from kidney's inability to remove excess fluid and sodium\n\n**WHY IT OCCURS IN CKD:**\n• **Reduced kidney function:** Cannot filter excess fluid effectively\n• **Protein loss:** Low albumin reduces fluid retention in blood vessels\n• **Sodium retention:** Kidneys hold onto salt, causing fluid buildup\n• **Heart complications:** CKD often leads to heart problems\n\n**PROGRESSION PATTERN:**\n• **Early:** Mild ankle swelling at end of day\n• **Moderate:** Persistent leg swelling, weight gain\n• **Advanced:** Facial swelling, shortness of breath, pulmonary edema\n\n**MANAGEMENT STRATEGIES:**\n• **Sodium restriction:** <2,300 mg/day (critical for control)\n• **Fluid limitation:** May be needed in advanced stages\n• **Diuretics:** Loop diuretics (furosemide) for severe cases\n• **Daily weights:** Monitor for sudden increases\n• **Leg elevation:** Helps reduce pooling\n• **Compression stockings:** Improve circulation\n\n**WHEN TO SEEK EMERGENCY CARE:**\n• Sudden, severe swelling\n• Difficulty breathing\n• Chest pain or pressure\n• Rapid weight gain (>3 lbs in 2 days)\n\n*Pedal edema indicates your kidneys need immediate attention. Contact your nephrologist for proper evaluation and treatment.*";
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

  // Dialysis questions
  if (/(dialysis|hemodialysis|peritoneal|transplant|kidney transplant)/i.test(msg)) {
    return "**Renal Replacement Therapy Options**\n\n**WHEN IS RRT NEEDED:**\n• eGFR <15 mL/min (Stage 5 CKD)\n• Severe symptoms (uremia, fluid overload)\n• Life-threatening complications\n\n**HEMODIALYSIS:**\n• **Frequency:** 3 times/week, 4 hours per session\n• **Process:** Blood filtered through artificial kidney\n• **Access:** AV fistula, AV graft, or central catheter\n• **Pros:** Efficient, done at center with support\n• **Cons:** Requires travel, dietary restrictions\n\n**PERITONEAL DIALYSIS:**\n• **Process:** Uses abdominal lining as filter\n• **Types:** CAPD (manual) or APD (machine overnight)\n• **Access:** Permanent catheter in abdomen\n• **Pros:** Done at home, more flexible\n• **Cons:** Risk of infection, daily commitment\n\n**KIDNEY TRANSPLANT:**\n• **Best option:** Longest survival, best quality of life\n• **Sources:** Living donor (best) or deceased donor\n• **Wait time:** 3-5 years for deceased donor\n• **Requirements:** Good overall health, compliance\n\n**PREPARATION STEPS:**\n• Early referral to transplant center\n• AV access creation 6 months before dialysis\n• Vaccinations up to date\n• Family education and support\n\n*Discuss all options with your nephrologist early to make the best choice for your situation.*";
  }

  // General questions - use intelligent analysis for ANY question format
  if (msg.includes('?') || msg.includes('what') || msg.includes('how') || msg.includes('why') || msg.includes('when') || 
      msg.includes('does') || msg.includes('effect') || msg.includes('affect') || msg.includes('cause') || 
      msg.includes('help') || msg.includes('treat') || msg.includes('prevent') || msg.includes('manage') ||
      msg.includes('should') || msg.includes('can') || msg.includes('will') || msg.includes('is') || 
      msg.includes('tell') || msg.includes('explain') || msg.includes('about') || msg.length > 10) {
    return analyzeAndRespondToMedicalQuery(message);
  }

  // Default comprehensive response for any other input
  return "**I'm NephroBot - Your Advanced Kidney Health AI Specialist**\n\nI understand you have a kidney health question. While I have extensive medical knowledge about CKD, lab values, treatments, and management, I'd like to provide you with the most relevant information.\n\n**I can help with:**\n• **Lab results:** Creatinine, eGFR, hemoglobin, electrolytes\n• **CKD stages:** Understanding progression and symptoms\n• **Medications:** Kidney-protective drugs and interactions\n• **Diet & nutrition:** Renal-friendly meal planning\n• **Complications:** Anemia, bone disease, fluid retention\n• **Treatment options:** Dialysis, transplant preparation\n\n**To get the best answer, try asking:**\n- \"What does high creatinine mean?\"\n- \"How can I improve my hemoglobin?\"\n- \"What foods should I avoid with CKD?\"\n- \"Tell me about dialysis options\"\n\n*What specific kidney health topic would you like me to explain in detail?*";

}

// Intelligent medical query analyzer
function analyzeAndRespondToMedicalQuery(message: string): string {
  const msg = message.toLowerCase();
  
  // Specific medical conditions and effects
  if (msg.includes('edema') || msg.includes('pedal') || msg.includes('swelling') || msg.includes('effect')) {
    return "**Pedal Edema (Swelling) Effects in CKD**\n\n**WHAT IS PEDAL EDEMA:**\n• Fluid accumulation in lower legs, ankles, and feet\n• Common in CKD Stages 4-5 when kidneys can't remove excess fluid\n• Often first sign of fluid retention problems\n\n**HOW PEDAL EDEMA AFFECTS YOU:**\n• **Physical impact:** Makes walking difficult, shoes don't fit\n• **Skin problems:** Stretching can cause skin breakdown, infections\n• **Circulation issues:** Poor blood flow, increased clot risk\n• **Heart strain:** Extra fluid forces heart to work harder\n• **Sleep disruption:** Fluid shifts cause nighttime breathing problems\n\n**PROGRESSION OF EFFECTS:**\n• **Mild:** Evening ankle swelling, resolves overnight\n• **Moderate:** Persistent swelling, weight gain, tight shoes\n• **Severe:** Swelling extends to thighs, shortness of breath\n• **Critical:** Pulmonary edema (fluid in lungs) - emergency!\n\n**IMMEDIATE MANAGEMENT:**\n• **Sodium restriction:** <2,000 mg/day strictly\n• **Fluid monitoring:** Track daily weight changes\n• **Leg elevation:** Above heart level when resting\n• **Diuretics:** As prescribed by nephrologist\n• **Compression stockings:** Improve fluid movement\n\n**LONG-TERM EFFECTS:**\n• **Skin damage:** Permanent stretching, scarring\n• **Infection risk:** Poor circulation, skin breakdown\n• **Mobility loss:** Difficulty walking, exercise intolerance\n• **Heart failure:** Chronic fluid overload damages heart\n\n*Pedal edema indicates serious fluid balance problems. Contact your nephrologist immediately for proper evaluation and treatment adjustment.*";
  }

  // Stone-related questions
  if (msg.includes('stone') || msg.includes('kidney stone')) {
    return "**Kidney Stones and Chronic Kidney Disease**\n\n**TYPES OF KIDNEY STONES:**\n• **Calcium stones (80%):** Most common, often due to high calcium/oxalate\n• **Uric acid stones:** More common in CKD patients\n• **Struvite stones:** Associated with infections\n• **Cystine stones:** Rare, genetic condition\n\n**WHY CKD PATIENTS GET MORE STONES:**\n• **Reduced urine volume:** Concentrated urine increases stone risk\n• **pH changes:** Acidic urine promotes uric acid stones\n• **Medication effects:** Some CKD drugs increase stone risk\n• **Metabolic changes:** Altered calcium, phosphate metabolism\n\n**STONE EFFECTS ON CKD:**\n• **Acute kidney injury:** Stones can block urine flow\n• **Infections:** Stones harbor bacteria, cause repeated UTIs\n• **Further kidney damage:** Chronic obstruction worsens CKD\n• **Pain and complications:** May require surgical intervention\n\n**PREVENTION STRATEGIES:**\n• **Adequate hydration:** 2-3 liters fluid/day if not fluid-restricted\n• **Dietary modifications:** Low sodium, moderate calcium, limited oxalate\n• **Citrate supplementation:** Helps prevent stone formation\n• **Medication management:** Avoid stone-promoting drugs when possible\n\n**TREATMENT OPTIONS:**\n• **Small stones:** Conservative management with hydration\n• **Larger stones:** Shock wave lithotripsy, ureteroscopy\n• **Surgical removal:** For complex or large stones\n• **Prevention therapy:** Based on stone analysis\n\n*CKD patients need specialized stone management. Work with both nephrology and urology teams.*";
  }

  // Improvement questions
  if (msg.includes('improve') || msg.includes('increase') || msg.includes('raise') || msg.includes('boost')) {
    return "**Improving Your Kidney Health**\n\nBased on your question about improvement, here are evidence-based strategies:\n\n**PROTECT REMAINING FUNCTION:**\n• **Blood pressure control:** Target <130/80 mmHg\n• **Blood sugar management:** HbA1c <7% if diabetic\n• **Protein intake:** Moderate restriction (0.6-0.8 g/kg/day) in advanced CKD\n• **Avoid nephrotoxins:** NSAIDs, excessive contrast dye\n\n**LIFESTYLE MODIFICATIONS:**\n• **Regular exercise:** 150 minutes/week moderate activity\n• **Smoking cessation:** Critical for slowing progression\n• **Weight management:** Maintain healthy BMI\n• **Stress reduction:** Meditation, adequate sleep\n\n**MEDICAL MANAGEMENT:**\n• **ACE inhibitors/ARBs:** Slow progression, reduce proteinuria\n• **SGLT2 inhibitors:** Revolutionary kidney protection\n• **Phosphate binders:** Control mineral bone disease\n• **Iron/EPO therapy:** Manage anemia\n\n**MONITORING:**\n• Regular lab work every 3-6 months\n• Blood pressure checks\n• Medication adherence\n• Early nephrology care\n\n*Kidney function rarely improves once lost, but these strategies can significantly slow progression and improve quality of life. Work closely with your nephrologist for personalized care.*";
  }

  // Cause questions
  if (msg.includes('cause') || msg.includes('reason') || msg.includes('why')) {
    return "**Understanding CKD Causes and Progression**\n\n**PRIMARY CAUSES OF CKD:**\n• **Diabetes (45%):** High blood sugar damages kidney filters over years\n• **Hypertension (27%):** High blood pressure damages blood vessels in kidneys\n• **Glomerulonephritis:** Immune system attacks kidney filters\n• **Polycystic kidney disease:** Genetic condition with kidney cysts\n• **Autoimmune diseases:** Lupus, vasculitis affecting kidneys\n\n**HOW KIDNEY DAMAGE OCCURS:**\n• **Glomerular damage:** Filtering units become scarred and non-functional\n• **Tubular injury:** Kidney tubules lose ability to concentrate urine\n• **Vascular disease:** Blood vessel damage reduces kidney blood flow\n• **Interstitial fibrosis:** Scar tissue replaces healthy kidney tissue\n\n**PROGRESSION FACTORS:**\n• **Uncontrolled diabetes:** Accelerates damage through high glucose\n• **High blood pressure:** Ongoing vessel damage\n• **Proteinuria:** Excess protein indicates ongoing injury\n• **Smoking:** Reduces blood flow and accelerates progression\n• **Obesity:** Increases metabolic stress on kidneys\n\n**PREVENTION STRATEGIES:**\n• Early detection through regular screening\n• Aggressive control of diabetes and hypertension\n• Lifestyle modifications\n• Appropriate medications\n• Regular nephrology care\n\n*Understanding the cause of your CKD helps guide the most effective treatment approach. Discuss your specific situation with your nephrologist.*";
  }

  // Default comprehensive response for any question
  return "**Comprehensive Kidney Health Guidance**\n\nI understand you have a kidney health question. Let me provide relevant medical information:\n\n**KIDNEY HEALTH FUNDAMENTALS:**\n• **Function:** Your kidneys filter waste, balance fluids, control blood pressure, and produce hormones\n• **CKD stages:** Progressive loss of function from Stage 1 (mild) to Stage 5 (kidney failure)\n• **Early detection:** Regular screening saves kidney function\n\n**COMMON CONCERNS & MANAGEMENT:**\n• **Lab values:** Creatinine, eGFR, and proteinuria indicate kidney health\n• **Symptoms:** Fatigue, swelling, nausea, and changes in urination\n• **Blood pressure:** Most critical factor - target <130/80 mmHg\n• **Diet:** Sodium restriction, protein moderation, phosphorus control\n• **Medications:** ACE inhibitors, ARBs provide kidney protection\n\n**WHEN TO SEEK IMMEDIATE CARE:**\n• Sudden severe swelling or shortness of breath\n• Persistent nausea, vomiting, or loss of appetite\n• Significant changes in urination patterns\n• Uncontrolled blood pressure\n• Signs of infection or fever\n\n**LIFESTYLE PROTECTION:**\n• Regular exercise within your capability\n• Avoid NSAIDs and nephrotoxic substances\n• Stay hydrated (unless fluid-restricted)\n• Smoking cessation is crucial\n• Diabetes and hypertension control\n\n*I can provide more specific information about any kidney health topic. Ask about symptoms, lab results, treatments, diet, or complications for detailed guidance.*";
}