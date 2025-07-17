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
    
    // Generate AI response based on message content
    let response = "I understand your concern. ";
    const message = insertMessage.message.toLowerCase();
    
    if (message.includes('creatinine')) {
      response += "High creatinine levels (above 1.2 mg/dL) indicate reduced kidney function. This happens when kidneys can't filter waste effectively. Consider dietary protein restriction and regular monitoring with your healthcare provider.";
    } else if (message.includes('hemoglobin')) {
      response += "Low hemoglobin in CKD patients is common due to reduced erythropoietin production by kidneys. To improve: eat iron-rich foods like spinach and lean proteins, consider iron supplements if recommended by your doctor, and treat underlying kidney disease.";
    } else if (message.includes('symptoms')) {
      response += "CKD symptoms include fatigue, swelling in hands/feet, changes in urination, nausea, difficulty concentrating, and shortness of breath. Early stages often have no symptoms, making regular testing important.";
    } else if (message.includes('diet') || message.includes('food')) {
      response += "A kidney-friendly diet typically limits protein, phosphorus, potassium, and sodium. Focus on fresh fruits and vegetables with lower potassium content, limit processed foods, and work with a dietitian for personalized recommendations.";
    } else if (message.includes('prevention')) {
      response += "To prevent CKD progression: control blood pressure and diabetes, maintain a healthy diet, exercise regularly, avoid nephrotoxic medications, stay hydrated, and have regular check-ups with your healthcare provider.";
    } else {
      response += "Based on your question, I recommend consulting with a nephrologist for comprehensive evaluation and treatment planning. Regular monitoring and early intervention are key to managing kidney health effectively.";
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
