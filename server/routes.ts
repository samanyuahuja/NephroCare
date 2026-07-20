import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCKDAssessmentSchema, insertDietPlanSchema, insertChatMessageSchema } from "../shared/schema";
import OpenAI from "openai";
import { z } from "zod";

// --- SECURITY: OpenAI key loaded from environment variable only (OWASP A07:2021) ---
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface PredictionResult {
  success: boolean;
  prediction: number;
  probability: number;
  risk_level: string;
  risk_color: string;
  model_used: string;
  reasoning: string;
  primary_factors: string[];
}

// --- SECURITY: Input sanitization helper - strips HTML/script tags (OWASP A03:2021) ---
function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

// --- SECURITY: Validate and parse integer URL params safely ---
function parseIntParam(value: string): number | null {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > 2147483647) return null;
  return num;
}

// --- SECURITY: Schema for chat message validation (length + type checks) ---
const chatInputSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message too long"),
}).strict();

// --- SECURITY: Schema for filtered ID queries (prevents JSON injection) ---
const filteredIdsSchema = z.array(z.number().int().positive().max(2147483647)).max(100);

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/health", (_req, res) => {
    res.json({ status: "OK" });
  });

  // --- SECURITY: Chat endpoint with strict input validation ---
  app.post("/api/chat-direct", async (req, res) => {
    try {
      const parsed = chatInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input. Please provide a valid message (max 2000 characters)." });
      }

      const sanitizedMessage = sanitizeString(parsed.data.message);
      if (!sanitizedMessage) {
        return res.status(400).json({ error: "Message is required" });
      }

      const reply = await getAIPoweredNephroBotResponse(sanitizedMessage);
      return res.json({ reply });
      
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // --- SECURITY: CKD Assessment endpoint with schema-based validation ---
  app.post("/api/ckd-assessment", async (req, res) => {
    try {
      const validatedData = insertCKDAssessmentSchema.parse(req.body);
      
      // --- SECURITY: Sanitize patient name to prevent stored XSS ---
      validatedData.patientName = sanitizeString(validatedData.patientName).substring(0, 100);
      if (!validatedData.patientName) {
        return res.status(400).json({ error: "Patient name is required" });
      }
      
      // UCI CKD Dataset median values for "Don't Know" imputation
      // These are the actual median values from the training dataset (400 patients)
      // Using median provides balanced, unbiased predictions when values are unknown
      const datasetMedians = {
        age: 51,                    // Median age in dataset
        bloodPressure: 80,          // Median BP (diastolic) in dataset
        albumin: 1,                 // Normal albumin level (trace)
        sugar: 1,                   // Normal sugar level (trace)
        bloodGlucoseRandom: 121,    // Median blood glucose
        bloodUrea: 36,              // Median blood urea
        serumCreatinine: 1.2,       // Median serum creatinine
        sodium: 138,                // Median sodium
        potassium: 4.4,             // Median potassium
        hemoglobin: 12.5,           // Median hemoglobin
        wbcCount: 7800,             // Median WBC count
        rbcCount: 4.8,              // Median RBC count
      };

      // Transform "unknown" values to dataset medians for database storage
      const transformedData = {
        patientName: validatedData.patientName,
        age: validatedData.age || datasetMedians.age,
        bloodPressure: validatedData.bloodPressure || datasetMedians.bloodPressure,
        albumin: validatedData.albumin === "unknown" ? datasetMedians.albumin : Number(validatedData.albumin),
        sugar: validatedData.sugar === "unknown" ? datasetMedians.sugar : Number(validatedData.sugar),
        bloodGlucoseRandom: validatedData.bloodGlucoseRandom === "unknown" ? datasetMedians.bloodGlucoseRandom : Number(validatedData.bloodGlucoseRandom),
        bloodUrea: validatedData.bloodUrea === "unknown" ? datasetMedians.bloodUrea : Number(validatedData.bloodUrea),
        serumCreatinine: validatedData.serumCreatinine === "unknown" ? datasetMedians.serumCreatinine : Number(validatedData.serumCreatinine),
        sodium: validatedData.sodium === "unknown" ? datasetMedians.sodium : Number(validatedData.sodium),
        potassium: validatedData.potassium === "unknown" ? datasetMedians.potassium : Number(validatedData.potassium),
        hemoglobin: validatedData.hemoglobin === "unknown" ? datasetMedians.hemoglobin : Number(validatedData.hemoglobin),
        wbcCount: validatedData.wbcCount === "unknown" ? datasetMedians.wbcCount : Number(validatedData.wbcCount),
        rbcCount: validatedData.rbcCount === "unknown" ? datasetMedians.rbcCount : Number(validatedData.rbcCount),
        redBloodCells: validatedData.redBloodCells === "unknown" ? "normal" : validatedData.redBloodCells,
        pusCell: validatedData.pusCell === "unknown" ? "normal" : validatedData.pusCell,
        hypertension: validatedData.hypertension === "unknown" ? "no" : validatedData.hypertension,
        diabetesMellitus: validatedData.diabetesMellitus === "unknown" ? "no" : validatedData.diabetesMellitus,
        appetite: validatedData.appetite === "unknown" ? "good" : validatedData.appetite,
        pedalEdema: validatedData.pedalEdema === "unknown" ? "no" : validatedData.pedalEdema,
        anemia: validatedData.anemia === "unknown" ? "no" : validatedData.anemia,
      };
      
      // Create initial assessment
      const assessment = await storage.createCKDAssessment(transformedData);
      
      // Run ML prediction
      try {
        // Use the fixed model predictor with real trained models
        // Using dataset medians for "unknown" values
        const modelInput = {
          age: validatedData.age || datasetMedians.age,
          bp: validatedData.bloodPressure || datasetMedians.bloodPressure,
          al: validatedData.albumin === "unknown" ? datasetMedians.albumin : validatedData.albumin,
          su: validatedData.sugar === "unknown" ? datasetMedians.sugar : validatedData.sugar,
          rbc: validatedData.redBloodCells === "abnormal" ? "abnormal" : "normal",
          pc: validatedData.pusCell === "abnormal" ? "abnormal" : "normal",
          ba: "notpresent",
          bgr: validatedData.bloodGlucoseRandom === "unknown" ? datasetMedians.bloodGlucoseRandom : validatedData.bloodGlucoseRandom,
          bu: validatedData.bloodUrea === "unknown" ? datasetMedians.bloodUrea : validatedData.bloodUrea,
          sc: validatedData.serumCreatinine === "unknown" ? datasetMedians.serumCreatinine : validatedData.serumCreatinine,
          sod: validatedData.sodium === "unknown" ? datasetMedians.sodium : validatedData.sodium,
          pot: validatedData.potassium === "unknown" ? datasetMedians.potassium : validatedData.potassium,
          hemo: validatedData.hemoglobin === "unknown" ? datasetMedians.hemoglobin : validatedData.hemoglobin,
          wbcc: validatedData.wbcCount === "unknown" ? datasetMedians.wbcCount : validatedData.wbcCount,
          htn: validatedData.hypertension === "yes" ? "yes" : "no",
          dm: validatedData.diabetesMellitus === "yes" ? "yes" : "no",
          appet: validatedData.appetite === "poor" ? "poor" : "good",
          pe: validatedData.pedalEdema === "yes" ? "yes" : "no",
          ane: validatedData.anemia === "yes" ? "yes" : "no"
        };
        
        const predictionResult = runCKDPrediction(modelInput);
        console.log('Prediction result:', predictionResult);
        
        if (predictionResult.success) {
          const updatedAssessment = await storage.updateCKDAssessmentResults(
            assessment.id,
            predictionResult.probability,
            predictionResult.risk_level,
            JSON.stringify({
              prediction: predictionResult.prediction,
              probability: predictionResult.probability,
              risk_level: predictionResult.risk_level,
              risk_color: predictionResult.risk_color,
              model_used: predictionResult.model_used,
              reasoning: predictionResult.reasoning,
              primary_factors: predictionResult.primary_factors,
              timestamp: new Date().toISOString(),
              visualizations: null
            })
          );
          
          res.json(updatedAssessment || assessment);
        } else {
          // Return assessment without ML prediction (fallback)
          console.warn('Clinical scoring failed, returning basic assessment');
          res.json(assessment);
        }
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
        // Return basic assessment even if ML fails
        res.json(assessment);
      }
    } catch (error: any) {
      console.error('CKD Assessment error:', error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid assessment data. Please check all fields." });
      }
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  // Get all CKD assessments (for Browse section)
  app.get("/api/ckd-assessments", async (req, res) => {
    try {
      const assessments = await storage.getAllCKDAssessments();
      res.json(assessments);
    } catch (error: any) {
      console.error('Get all CKD Assessments error:', error);
      res.status(500).json({ error: "Failed to fetch CKD assessments" });
    }
  });

  // --- SECURITY: Filtered assessments with validated ID array ---
  app.get("/api/ckd-assessments/filtered", async (req, res) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== 'string') {
        return res.json([]);
      }
      
      let parsedIds: unknown;
      try {
        parsedIds = JSON.parse(ids);
      } catch {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const validated = filteredIdsSchema.safeParse(parsedIds);
      if (!validated.success) {
        return res.status(400).json({ error: "Invalid assessment IDs" });
      }
      
      const assessments = await storage.getCKDAssessmentsByIds(validated.data);
      res.json(assessments);
    } catch (error: any) {
      console.error('Get CKD Assessments error:', error);
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  // --- SECURITY: Single assessment with validated integer param ---
  app.get("/api/ckd-assessment/:id", async (req, res) => {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid assessment ID" });
      }
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

  // --- SECURITY: Diet plan endpoint with sanitized text fields ---
  app.post("/api/diet-plan", async (req, res) => {
    try {
      const validatedData = insertDietPlanSchema.parse(req.body);
      validatedData.foodsToEat = sanitizeString(validatedData.foodsToEat);
      validatedData.foodsToAvoid = sanitizeString(validatedData.foodsToAvoid);
      validatedData.waterIntakeAdvice = sanitizeString(validatedData.waterIntakeAdvice);
      const dietPlan = await storage.createDietPlan(validatedData);
      res.json(dietPlan);
    } catch (error: any) {
      console.error('Diet Plan error:', error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid diet plan data. Please check all fields." });
      }
      res.status(500).json({ error: "Failed to create diet plan" });
    }
  });

  // Get all diet plans
  app.get("/api/diet-plans", async (req, res) => {
    try {
      const dietPlans = await storage.getAllDietPlans();
      res.json(dietPlans);
    } catch (error: any) {
      console.error('Get All Diet Plans error:', error);
      res.status(500).json({ error: "Failed to fetch diet plans" });
    }
  });

  // --- SECURITY: Diet plan with validated integer param ---
  app.get("/api/diet-plan/:assessmentId", async (req, res) => {
    try {
      const assessmentId = parseIntParam(req.params.assessmentId);
      if (assessmentId === null) {
        return res.status(400).json({ error: "Invalid assessment ID" });
      }
      const dietPlan = await storage.getDietPlanByAssessmentId(assessmentId);
      if (!dietPlan) {
        return res.status(404).json({ error: "Diet plan not found" });
      }
      res.json(dietPlan);
    } catch (error: any) {
      console.error('Get Diet Plan error:', error);
      res.status(500).json({ error: "Failed to fetch diet plan" });
    }
  });

  // --- SECURITY: Filtered diet plans with validated ID array ---
  app.get("/api/diet-plans/filtered", async (req, res) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== 'string') {
        return res.json([]);
      }
      
      let parsedIds: unknown;
      try {
        parsedIds = JSON.parse(ids);
      } catch {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const validated = filteredIdsSchema.safeParse(parsedIds);
      if (!validated.success) {
        return res.status(400).json({ error: "Invalid assessment IDs" });
      }
      
      const dietPlans = await storage.getDietPlansByAssessmentIds(validated.data);
      res.json(dietPlans);
    } catch (error: any) {
      console.error('Get Diet Plans error:', error);
      res.status(500).json({ error: "Failed to fetch diet plans" });
    }
  });

  // --- SECURITY: Chat message endpoint with sanitized input ---
  app.post("/api/chat-message", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      validatedData.message = sanitizeString(validatedData.message);
      if (!validatedData.message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const chatMessage = await storage.createChatMessage(validatedData);
      res.json(chatMessage);
    } catch (error: any) {
      console.error('Chat Message error:', error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid message data." });
      }
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}



// Mirrors the existing Python clinical scorer without spawning a subprocess,
// which keeps assessment requests compatible with Vercel Functions.
function runCKDPrediction(data: Record<string, unknown>): PredictionResult {
  const numberValue = (key: string, fallback = 0) => {
    const value = Number(data[key]);
    return Number.isFinite(value) ? value : fallback;
  };

  const age = numberValue("age");
  const bp = numberValue("bp");
  const sc = numberValue("sc");
  const hemo = numberValue("hemo");
  const bu = numberValue("bu");
  const al = numberValue("al");
  const sod = numberValue("sod", 140);
  const pot = numberValue("pot", 4);
  let riskScore = 0;

  if (age > 60) riskScore += 0.15;
  else if (age > 45) riskScore += 0.08;

  if (sc > 1.5) riskScore += 0.42;
  else if (sc > 1.2) riskScore += 0.25;
  else if (sc > 1.0) riskScore += 0.1;

  if (hemo < 10) riskScore += 0.28;
  else if (hemo < 12) riskScore += 0.15;

  if (bu > 40) riskScore += 0.2;
  else if (bu > 25) riskScore += 0.1;

  if (bp > 140) riskScore += 0.12;
  else if (bp > 130) riskScore += 0.06;

  if (data.dm === "yes") riskScore += 0.15;
  if (data.htn === "yes") riskScore += 0.1;
  if (al > 2) riskScore += 0.18;
  else if (al > 1) riskScore += 0.08;
  if (data.pe === "yes") riskScore += 0.08;
  if (data.ane === "yes") riskScore += 0.06;
  if (data.appet === "poor") riskScore += 0.05;
  if (data.rbc === "abnormal") riskScore += 0.07;
  if (data.pc === "abnormal") riskScore += 0.05;
  if (sod < 135 || sod > 145) riskScore += 0.04;
  if (pot > 5) riskScore += 0.06;
  if (sc > 0 && bu / sc > 20) riskScore += 0.08;

  riskScore = Math.min(riskScore, 0.95);
  const probability = Math.round(riskScore * 1000) / 1000;
  const [riskLevel, riskColor] = probability < 0.3
    ? ["Low Risk", "success"]
    : probability < 0.6
      ? ["Moderate Risk", "warning"]
      : probability < 0.85
        ? ["High Risk", "danger"]
        : ["Very High Risk", "danger"];

  const primaryFactors: string[] = [];
  if (sc > 1.2) primaryFactors.push(`Elevated creatinine (${sc} mg/dL)`);
  if (hemo < 12) primaryFactors.push(`Low hemoglobin (${hemo} g/dL)`);
  if (bu > 25) primaryFactors.push(`High blood urea (${bu} mg/dL)`);
  if (bp > 140) primaryFactors.push(`High blood pressure (${bp} mmHg)`);

  return {
    success: true,
    prediction: probability > 0.5 ? 1 : 0,
    probability,
    risk_level: riskLevel,
    risk_color: riskColor,
    model_used: "clinical_rules_v1",
    reasoning: `Educational risk estimate based on: ${primaryFactors.length ? primaryFactors.join("; ") : "parameters within the scorer's lower-risk ranges"}`,
    primary_factors: primaryFactors,
  };
}

// AI-powered NephroBot using OpenAI GPT-4o with intelligent fallback
async function getAIPoweredNephroBotResponse(message: string): Promise<string> {
  if (!openai) {
    return getEnhancedNephroBotResponse(message);
  }

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
