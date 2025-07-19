import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCKDAssessmentSchema, insertDietPlanSchema, insertChatMessageSchema } from "@shared/schema";

// Flask backend URL - points to our Python Flask API
const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:8080";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // CKD Assessment endpoint - integrates with Flask backend
  app.post("/api/ckd-assessment", async (req, res) => {
    try {
      console.log("📝 Received assessment data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertCKDAssessmentSchema.parse(req.body);
      
      // Transform "unknown" values to defaults before database storage
      const transformedData = {
        ...validatedData,
        albumin: validatedData.albumin === "unknown" ? 1 : validatedData.albumin,
        sugar: validatedData.sugar === "unknown" ? 0 : validatedData.sugar,
        redBloodCells: validatedData.redBloodCells === "unknown" ? "normal" : validatedData.redBloodCells,
        pusCell: validatedData.pusCell === "unknown" ? "normal" : validatedData.pusCell,
        bloodGlucoseRandom: validatedData.bloodGlucoseRandom === "unknown" ? 120 : validatedData.bloodGlucoseRandom,
        bloodUrea: validatedData.bloodUrea === "unknown" ? 30 : validatedData.bloodUrea,
        serumCreatinine: validatedData.serumCreatinine === "unknown" ? 1.2 : validatedData.serumCreatinine,
        sodium: validatedData.sodium === "unknown" ? 140 : validatedData.sodium,
        potassium: validatedData.potassium === "unknown" ? 4.5 : validatedData.potassium,
        hemoglobin: validatedData.hemoglobin === "unknown" ? 13 : validatedData.hemoglobin,
        wbcCount: validatedData.wbcCount === "unknown" ? 7500 : validatedData.wbcCount,
        rbcCount: validatedData.rbcCount === "unknown" ? 5.0 : validatedData.rbcCount,
        hypertension: validatedData.hypertension === "unknown" ? "no" : validatedData.hypertension,
        diabetesMellitus: validatedData.diabetesMellitus === "unknown" ? "no" : validatedData.diabetesMellitus,
        appetite: validatedData.appetite === "unknown" ? "good" : validatedData.appetite,
        pedalEdema: validatedData.pedalEdema === "unknown" ? "no" : validatedData.pedalEdema,
        anemia: validatedData.anemia === "unknown" ? "no" : validatedData.anemia,
      };
      
      const assessment = await storage.createCKDAssessment(transformedData);
      
      // Convert to Flask format for ML prediction (use transformed data with defaults applied)
      const flaskData = {
        age: transformedData.age.toString(),
        bp: transformedData.bloodPressure.toString(),
        al: transformedData.albumin.toString(),
        su: transformedData.sugar.toString(),
        rbc: transformedData.redBloodCells === "normal" ? "normal" : "abnormal",
        pc: transformedData.pusCell === "normal" ? "normal" : "abnormal",
        ba: "notpresent", // Default value
        bgr: transformedData.bloodGlucoseRandom.toString(),
        bu: transformedData.bloodUrea.toString(),
        sc: transformedData.serumCreatinine.toString(),
        sod: transformedData.sodium.toString(),
        pot: transformedData.potassium.toString(),
        hemo: transformedData.hemoglobin.toString(),
        wbcc: transformedData.wbcCount.toString(),
        rbcc: transformedData.rbcCount.toString(),
        htn: transformedData.hypertension,
        dm: transformedData.diabetesMellitus,
        cad: "no", // Default value
        appet: transformedData.appetite,
        pe: transformedData.pedalEdema,
        ane: transformedData.anemia
      };

      try {
        // Use Python predictor based on your clinical logic
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        const pythonCommand = `python model_predictor.py '${JSON.stringify(flaskData).replace(/'/g, "\\'")}'`;
        
        try {
          const { stdout, stderr } = await execAsync(pythonCommand);
          
          if (stderr) {
            console.log(`⚠️ Python predictor warning: ${stderr}`);
          }
          
          const pythonResult = JSON.parse(stdout.trim());
          
          if (pythonResult.error) {
            throw new Error(pythonResult.error);
          }
          
          // Use Python clinical prediction results
          const riskScore = pythonResult.probability;
          const riskLevel = pythonResult.risk_level;
          const shapFeatures = generateSHAPFeatures(transformedData); // Keep SHAP for visualization
          
          const updatedAssessment = await storage.updateCKDAssessmentResults(
            assessment.id, 
            riskScore, 
            riskLevel, 
            JSON.stringify(shapFeatures)
          );
          
          console.log(`🧠 ML Model prediction: ${riskLevel} (${(riskScore * 100).toFixed(1)}%) using ${pythonResult.model_used}`);
          res.json(updatedAssessment);
          
        } catch (pythonError: any) {
          console.log(`⚠️ ML model predictor failed: ${pythonError?.message || pythonError}, using fallback`);
          
          // Fallback to original calculation
          const riskScore = calculateCKDRisk(transformedData);
          const riskLevel = getRiskLevel(riskScore);
          const shapFeatures = generateSHAPFeatures(transformedData);
          
          const updatedAssessment = await storage.updateCKDAssessmentResults(
            assessment.id, 
            riskScore, 
            riskLevel, 
            JSON.stringify(shapFeatures)
          );
          
          res.json(updatedAssessment);
        }
      } catch (importError) {
        // Fallback if import fails
        console.log('⚠️ Could not import child_process, using basic calculation');
        const riskScore = calculateCKDRisk(transformedData);
        const riskLevel = getRiskLevel(riskScore);
        const shapFeatures = generateSHAPFeatures(transformedData);
        
        const updatedAssessment = await storage.updateCKDAssessmentResults(
          assessment.id, 
          riskScore, 
          riskLevel, 
          JSON.stringify(shapFeatures)
        );
        
        res.json(updatedAssessment);
      }
    } catch (error) {
      console.error("❌ Assessment validation error:", error);
      res.status(400).json({ error: "Invalid assessment data", details: error instanceof Error ? error.message : error });
    }
  });

  // Get CKD Assessment
  app.get("/api/ckd-assessment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getCKDAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment ID" });
    }
  });

  // Get all CKD Assessments (history)
  app.get("/api/ckd-assessments", async (req, res) => {
    try {
      const assessments = await storage.getAllCKDAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve assessment history" });
    }
  });

  // Generate Diet Plan
  app.post("/api/diet-plan", async (req, res) => {
    try {
      const { assessmentId, dietType } = req.body;
      
      const assessment = await storage.getCKDAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Check if diet plan already exists
      const existingPlan = await storage.getDietPlanByAssessmentId(assessmentId);
      if (existingPlan && existingPlan.dietType === dietType) {
        return res.json(existingPlan);
      }

      const dietPlanData = generateDietPlan(assessment, dietType);
      const dietPlan = await storage.createDietPlan({
        assessmentId,
        dietType,
        ...dietPlanData
      });
      
      res.json(dietPlan);
    } catch (error) {
      res.status(400).json({ error: "Failed to generate diet plan" });
    }
  });

  // Get Diet Plan
  app.get("/api/diet-plan/:assessmentId", async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.assessmentId);
      const dietPlan = await storage.getDietPlanByAssessmentId(assessmentId);
      
      if (!dietPlan) {
        return res.status(404).json({ error: "Diet plan not found" });
      }
      
      res.json(dietPlan);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment ID" });
    }
  });

  // Get All Diet Plans
  app.get("/api/diet-plans", async (req, res) => {
    try {
      const dietPlans = await storage.getAllDietPlans();
      res.json(dietPlans);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve diet plans" });
    }
  });

  // Chat endpoint - integrates with Flask chatbot or uses NephroBot responses
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Try Flask chatbot first, fallback to local NephroBot
      try {
        const flaskResponse = await fetch(`${FLASK_API_URL}/api/chatbot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: validatedData.message })
        });

        if (flaskResponse.ok) {
          const flaskData = await flaskResponse.json();
          if (flaskData.reply) {
            const chatMessage = {
              ...validatedData,
              id: Date.now(),
              response: flaskData.reply,
              createdAt: new Date()
            };
            console.log(`🤖 NephroBot (Flask): ${flaskData.reply.substring(0, 50)}...`);
            return res.json(chatMessage);
          }
        }
      } catch (fetchError) {
        // Fallback to local NephroBot if Flask is not available
        console.log('⚠️ Flask chatbot unavailable, using local NephroBot');
      }

      // Use local NephroBot responses
      const chatMessage = await storage.createChatMessage(validatedData);
      res.json(chatMessage);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Get chat history
  app.get("/api/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve chat messages" });
    }
  });

  // Direct chat endpoint - simple chatbot responses
  app.post("/api/chat-direct", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Simple NephroBot responses
      const msg = message.toLowerCase();
      let reply = "I understand you're asking about kidney health. Could you be more specific? I can help with CKD stages, symptoms, diet, medications, lab results, or lifestyle questions.";

      if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        reply = "Hello! I'm NephroBot, your kidney health assistant. I can help you understand CKD, symptoms, treatments, and lifestyle changes. What would you like to know?";
      } else if (msg.includes("what is ckd") || msg.includes("chronic kidney disease")) {
        reply = "Chronic Kidney Disease (CKD) is a condition where kidneys gradually lose function over time. It's classified into 5 stages based on eGFR (kidney filtration rate). Early detection and treatment can slow progression.";
      } else if (msg.includes("symptoms")) {
        reply = "Common CKD symptoms include:\n• Fatigue and weakness\n• Swelling in legs, ankles, or feet\n• Changes in urination\n• Foamy urine (protein)\n• Nausea and loss of appetite\n• Muscle cramps\n• High blood pressure\n\nEarly stages often have no symptoms - that's why regular testing is important.";
      } else if (msg.includes("diet") || msg.includes("food")) {
        reply = "CKD diet focuses on:\n• Limit protein (0.6-0.8g/kg body weight)\n• Reduce sodium (<2,300mg/day)\n• Control potassium if elevated\n• Limit phosphorus (dairy, nuts, seeds)\n• Stay hydrated unless fluid-restricted\n• Work with a renal dietitian for personalized plans.";
      } else if (msg.includes("stages")) {
        reply = "CKD has 5 stages:\n• Stage 1: eGFR ≥90 (normal function with kidney damage)\n• Stage 2: eGFR 60-89 (mild decrease)\n• Stage 3a: eGFR 45-59 (moderate decrease)\n• Stage 3b: eGFR 30-44 (moderate to severe)\n• Stage 4: eGFR 15-29 (severe decrease)\n• Stage 5: eGFR <15 (kidney failure)";
      } else if (msg.includes("help")) {
        reply = "I can help you with:\n• CKD stages and symptoms\n• Diet and lifestyle recommendations\n• Lab test explanations\n• Medication information\n• When to see a doctor\n• Treatment options\n\nAsk me anything about kidney health!";
      }

      return res.json({ reply });
      
    } catch (error) {
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for AI calculations
function calculateCKDRisk(data: any): number {
  let risk = 0;
  
  // Age factor
  if (data.age > 60) risk += 0.15;
  else if (data.age > 45) risk += 0.08;
  
  // Creatinine - major factor
  if (data.serumCreatinine > 1.5) risk += 0.42;
  else if (data.serumCreatinine > 1.2) risk += 0.25;
  
  // Hemoglobin - anemia indicator
  if (data.hemoglobin < 10) risk += 0.28;
  else if (data.hemoglobin < 12) risk += 0.15;
  
  // Blood Urea
  if (data.bloodUrea > 40) risk += 0.20;
  else if (data.bloodUrea > 25) risk += 0.10;
  
  // Blood Pressure
  if (data.bloodPressure > 140) risk += 0.12;
  
  // Diabetes and Hypertension
  if (data.diabetesMellitus === 'yes') risk += 0.15;
  if (data.hypertension === 'yes') risk += 0.10;
  
  // Proteinuria indicators
  if (data.albumin > 2) risk += 0.18;
  
  // Other factors
  if (data.pedalEdema === 'yes') risk += 0.08;
  if (data.anemia === 'yes') risk += 0.06;
  if (data.appetite === 'poor') risk += 0.05;
  
  // Cap at 95%
  return Math.min(risk * 100, 95);
}

function getRiskLevel(score: number): string {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

function generateSHAPFeatures(data: any) {
  const features = [];
  
  if (data.serumCreatinine > 1.2) {
    features.push({
      feature: `Serum Creatinine (${data.serumCreatinine})`,
      impact: data.serumCreatinine > 1.5 ? 0.42 : 0.25,
      type: 'negative'
    });
  }
  
  if (data.hemoglobin < 12) {
    features.push({
      feature: `Hemoglobin (${data.hemoglobin})`,
      impact: data.hemoglobin < 10 ? 0.28 : 0.15,
      type: 'negative'
    });
  }
  
  if (data.bloodUrea > 25) {
    features.push({
      feature: `Blood Urea (${data.bloodUrea})`,
      impact: data.bloodUrea > 40 ? 0.20 : 0.10,
      type: 'negative'
    });
  }
  
  features.push({
    feature: `Age (${data.age})`,
    impact: data.age > 60 ? 0.15 : (data.age > 45 ? 0.08 : -0.05),
    type: data.age > 45 ? 'negative' : 'positive'
  });
  
  return features.slice(0, 4); // Return top 4 features
}

function generateDietPlan(assessment: any, dietType: string) {
  const isVegetarian = dietType === 'vegetarian';
  
  let foodsToEat, foodsToAvoid;
  
  if (isVegetarian) {
    foodsToEat = [
      "Low-protein grains: White rice, refined wheat",
      "Iron-rich foods: Spinach, beetroot, pomegranate", 
      "Low-potassium fruits: Apples, berries, grapes",
      "Vegetables: Cabbage, cauliflower, carrots",
      "Healthy fats: Olive oil, coconut oil (limited)"
    ];
    
    foodsToAvoid = [
      "High-protein foods: Pulses, legumes, nuts",
      "High-potassium foods: Bananas, oranges, potatoes", 
      "Processed foods: Packaged snacks, canned foods",
      "High-sodium foods: Pickles, papad, salt",
      "Dark leafy greens: Excess spinach, methi"
    ];
  } else {
    foodsToEat = [
      "Lean proteins: Egg whites, small portions of fish",
      "Iron-rich foods: Lean chicken, fish (limited)",
      "Low-potassium fruits: Apples, berries, grapes", 
      "Vegetables: Cabbage, cauliflower, carrots",
      "Healthy fats: Olive oil, fish oil (omega-3)"
    ];
    
    foodsToAvoid = [
      "Red meat: Beef, mutton, pork",
      "High-potassium foods: Organ meats, salmon",
      "Processed meats: Sausages, bacon, deli meats",
      "High-sodium foods: Canned fish, processed foods", 
      "Shellfish: Shrimp, crab, lobster"
    ];
  }
  
  const waterIntakeAdvice = "Recommended: 1.5-2 liters per day (monitor based on urine output). Monitor daily weight and swelling in feet/ankles. Consult doctor if weight increases by more than 1 kg in 24 hours.";
  
  return {
    foodsToEat: JSON.stringify(foodsToEat),
    foodsToAvoid: JSON.stringify(foodsToAvoid),
    waterIntakeAdvice
  };
}
