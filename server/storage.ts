import { 
  users, 
  ckdAssessments, 
  dietPlans, 
  chatMessages,
  type User, 
  type InsertUser,
  type CKDAssessment,
  type InsertCKDAssessment,
  type DietPlan,
  type InsertDietPlan,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCKDAssessment(assessment: InsertCKDAssessment): Promise<CKDAssessment>;
  getCKDAssessment(id: number): Promise<CKDAssessment | undefined>;
  updateCKDAssessmentResults(id: number, riskScore: number, riskLevel: string, shapFeatures: string): Promise<CKDAssessment | undefined>;
  
  createDietPlan(dietPlan: InsertDietPlan): Promise<DietPlan>;
  getDietPlanByAssessmentId(assessmentId: number): Promise<DietPlan | undefined>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ckdAssessments: Map<number, CKDAssessment>;
  private dietPlans: Map<number, DietPlan>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentAssessmentId: number;
  private currentDietPlanId: number;
  private currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.ckdAssessments = new Map();
    this.dietPlans = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentAssessmentId = 1;
    this.currentDietPlanId = 1;
    this.currentChatMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCKDAssessment(insertAssessment: InsertCKDAssessment): Promise<CKDAssessment> {
    const id = this.currentAssessmentId++;
    const assessment: CKDAssessment = { 
      ...insertAssessment, 
      id,
      riskScore: null,
      riskLevel: null,
      shapFeatures: null,
      createdAt: new Date()
    };
    this.ckdAssessments.set(id, assessment);
    return assessment;
  }

  async getCKDAssessment(id: number): Promise<CKDAssessment | undefined> {
    return this.ckdAssessments.get(id);
  }

  async updateCKDAssessmentResults(id: number, riskScore: number, riskLevel: string, shapFeatures: string): Promise<CKDAssessment | undefined> {
    const assessment = this.ckdAssessments.get(id);
    if (assessment) {
      const updatedAssessment = { ...assessment, riskScore, riskLevel, shapFeatures };
      this.ckdAssessments.set(id, updatedAssessment);
      return updatedAssessment;
    }
    return undefined;
  }

  async createDietPlan(insertDietPlan: InsertDietPlan): Promise<DietPlan> {
    const id = this.currentDietPlanId++;
    const dietPlan: DietPlan = { 
      ...insertDietPlan, 
      id,
      assessmentId: insertDietPlan.assessmentId || null,
      createdAt: new Date()
    };
    this.dietPlans.set(id, dietPlan);
    return dietPlan;
  }

  async getDietPlanByAssessmentId(assessmentId: number): Promise<DietPlan | undefined> {
    return Array.from(this.dietPlans.values()).find(
      (plan) => plan.assessmentId === assessmentId
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    
    // Use NephroBot responses based on your Flask app.py logic
    let response = "";
    const msg = insertMessage.message.toLowerCase();

    if (!msg) {
      response = "Please enter a message.";
    } else if (msg.includes("what is ckd") || msg.includes("chronic kidney disease")) {
      response = "Chronic Kidney Disease (CKD) is a condition where your kidneys lose function over time. It's usually caused by diabetes or high blood pressure.";
    } else if (msg.includes("symptoms")) {
      response = "Common CKD symptoms include fatigue, swelling in legs, nausea, high blood pressure, and frequent urination.";
    } else if (msg.includes("treatment")) {
      response = "CKD treatment depends on the stage. It usually includes managing blood pressure, blood sugar, and avoiding further kidney damage. In severe cases, dialysis or transplant may be needed.";
    } else if (msg.includes("diet")) {
      response = "A CKD diet includes low-sodium, low-protein foods, avoiding processed items, and drinking enough water. Consult a nephrologist for a custom plan.";
    } else if (msg.includes("is ckd curable")) {
      response = "CKD isn't curable but it can be managed effectively with medications, lifestyle changes, and regular monitoring.";
    } else if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
      response = "Hello! I'm NephroBot. Ask me anything about CKD (Chronic Kidney Disease).";
    } else if (msg.includes("high creatinine")) {
      response = "High creatinine can indicate poor kidney function. You should consult a nephrologist for further evaluation.";
    } else if (msg.includes("gfr level")) {
      response = "GFR (Glomerular Filtration Rate) is a key indicator of kidney function. A GFR below 60 may suggest CKD.";
    } else if (msg.includes("protein in urine")) {
      response = "Protein in urine (proteinuria) may indicate kidney damage. It should be investigated further.";
    } else if (msg.includes("diet for ckd")) {
      response = "CKD diet includes low sodium, controlled protein, and limited potassium and phosphorus depending on stage. Always consult a renal dietitian.";
    } else if (msg.includes("what to eat in ckd")) {
      response = "Safe foods include white rice, apples, cabbage, cauliflower, and lean protein (based on your stage and labs). Avoid salty, processed, and high-phosphorus foods.";
    } else if (msg.includes("can i eat bananas")) {
      response = "Bananas are high in potassium and may need to be limited in later CKD stages. Always check with your doctor.";
    } else if (msg.includes("how to treat ckd")) {
      response = "CKD treatment includes blood pressure control, diabetes management, dietary changes, and medications to protect kidney function.";
    } else if (msg.includes("medicines for ckd")) {
      response = "Common medications include ACE inhibitors, ARBs, phosphate binders, and diuretics — prescribed based on your condition.";
    } else if (msg.includes("dialysis")) {
      response = "Dialysis is used in end-stage CKD to remove waste from the blood when kidneys stop working effectively.";
    } else if (msg.includes("ckd chatbot")) {
      response = "You're chatting with me now! I'm NephroBot, designed to answer your questions about CKD.";
    } else if (msg.includes("who made you")) {
      response = "I was created to assist users with CKD-related queries using rule-based responses.";
    } else {
      response = "Sorry, I didn't understand that. Try asking about CKD symptoms, treatment, diet, risk factors, or prevention.";
    }
    
    const chatMessage: ChatMessage = { 
      ...insertMessage, 
      id,
      response,
      createdAt: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
      a.createdAt!.getTime() - b.createdAt!.getTime()
    );
  }
}

export const storage = new MemStorage();
