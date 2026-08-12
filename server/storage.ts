import { 
  ckdAssessments, 
  dietPlans, 
  type CKDAssessment,
  type DietPlan,
  type InsertDietPlan,
} from "../shared/schema.js";

import { db } from "./db.js";
import { and, desc, eq, gt, inArray, lte } from "drizzle-orm";
import { decryptHealthPayload, tokenMatches } from "./healthDataSecurity.js";

export interface AssessmentReference {
  publicId: string;
  accessToken: string;
}

export interface IStorage {
  createCKDAssessment(assessment: any): Promise<CKDAssessment>;
  purgeExpiredAssessments(): Promise<number>;
  getAuthorizedAssessment(reference: AssessmentReference): Promise<CKDAssessment | undefined>;
  getAuthorizedAssessments(references: AssessmentReference[]): Promise<CKDAssessment[]>;
  deleteAuthorizedAssessment(reference: AssessmentReference): Promise<boolean>;
  updateCKDAssessmentResults(id: number, riskScore: number, riskLevel: string, shapFeatures: string): Promise<CKDAssessment | undefined>;
  createDietPlan(dietPlan: InsertDietPlan): Promise<DietPlan>;
  getDietPlanByAssessmentId(assessmentId: number): Promise<DietPlan | undefined>;
  getDietPlansForAuthorizedAssessments(references: AssessmentReference[]): Promise<DietPlan[]>;
}

export class DatabaseStorage implements IStorage {
  constructor(private readonly database: NonNullable<typeof db>) {}

  async createCKDAssessment(assessment: any): Promise<CKDAssessment> {
    const [result] = await this.database.insert(ckdAssessments).values(assessment).returning();
    return result;
  }

  async purgeExpiredAssessments(): Promise<number> {
    const expired = await this.database.select({ id: ckdAssessments.id }).from(ckdAssessments).where(lte(ckdAssessments.expiresAt, new Date()));
    if (expired.length === 0) return 0;
    const ids = expired.map(({ id }) => id);
    await this.database.delete(dietPlans).where(inArray(dietPlans.assessmentId, ids));
    await this.database.delete(ckdAssessments).where(inArray(ckdAssessments.id, ids));
    return ids.length;
  }

  async getAuthorizedAssessment(reference: AssessmentReference): Promise<CKDAssessment | undefined> {
    const [assessment] = await this.database
      .select()
      .from(ckdAssessments)
      .where(and(eq(ckdAssessments.publicId, reference.publicId), gt(ckdAssessments.expiresAt, new Date())));
    if (!assessment || !tokenMatches(reference.accessToken, assessment.accessTokenHash)) return undefined;
    return this.hydrate(assessment);
  }

  async updateCKDAssessmentResults(id: number, riskScore: number, riskLevel: string, shapFeatures: string): Promise<CKDAssessment | undefined> {
    const [updated] = await this.database
      .update(ckdAssessments)
      .set({ riskScore, riskLevel, shapFeatures })
      .where(eq(ckdAssessments.id, id))
      .returning();
    return updated || undefined;
  }

  async getAuthorizedAssessments(references: AssessmentReference[]): Promise<CKDAssessment[]> {
    const results = await Promise.all(references.map((reference) => this.getAuthorizedAssessment(reference)));
    return results.filter((assessment): assessment is CKDAssessment => Boolean(assessment));
  }

  async deleteAuthorizedAssessment(reference: AssessmentReference): Promise<boolean> {
    const assessment = await this.getAuthorizedAssessment(reference);
    if (!assessment) return false;
    await this.database.delete(dietPlans).where(eq(dietPlans.assessmentId, assessment.id));
    const deleted = await this.database.delete(ckdAssessments).where(eq(ckdAssessments.id, assessment.id)).returning({ id: ckdAssessments.id });
    return deleted.length === 1;
  }

  async createDietPlan(dietPlan: InsertDietPlan): Promise<DietPlan> {
    const [plan] = await this.database.insert(dietPlans).values(dietPlan).returning();
    return plan;
  }

  async getDietPlanByAssessmentId(assessmentId: number): Promise<DietPlan | undefined> {
    const [plan] = await this.database.select().from(dietPlans).where(eq(dietPlans.assessmentId, assessmentId));
    return plan || undefined;
  }

  async getDietPlansForAuthorizedAssessments(references: AssessmentReference[]): Promise<DietPlan[]> {
    const assessments = await this.getAuthorizedAssessments(references);
    if (assessments.length === 0) return [];
    return this.database.select().from(dietPlans).where(inArray(dietPlans.assessmentId, assessments.map(({ id }) => id))).orderBy(desc(dietPlans.createdAt));
  }

  private hydrate(assessment: CKDAssessment): CKDAssessment {
    const sensitive = decryptHealthPayload<Record<string, unknown>>(assessment.encryptedPayload);
    return { ...assessment, ...sensitive } as CKDAssessment;
  }
}

export class MemStorage implements IStorage {
  private ckdAssessments: Map<number, CKDAssessment>;
  private dietPlans: Map<number, DietPlan>;
  private currentAssessmentId: number;
  private currentDietPlanId: number;

  constructor() {
    this.ckdAssessments = new Map();
    this.dietPlans = new Map();
    this.currentAssessmentId = 1;
    this.currentDietPlanId = 1;
  }

  async createCKDAssessment(insertAssessment: any): Promise<CKDAssessment> {
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

  async purgeExpiredAssessments(): Promise<number> {
    let removed = 0;
    for (const assessment of Array.from(this.ckdAssessments.values())) {
      if (assessment.expiresAt <= new Date()) {
        this.ckdAssessments.delete(assessment.id);
        removed += 1;
      }
    }
    return removed;
  }

  async getAuthorizedAssessment(reference: AssessmentReference): Promise<CKDAssessment | undefined> {
    const assessment = Array.from(this.ckdAssessments.values()).find(({ publicId }) => publicId === reference.publicId);
    if (!assessment || assessment.expiresAt <= new Date() || !tokenMatches(reference.accessToken, assessment.accessTokenHash)) return undefined;
    const sensitive = decryptHealthPayload<Record<string, unknown>>(assessment.encryptedPayload);
    return { ...assessment, ...sensitive } as CKDAssessment;
  }

  async getAuthorizedAssessments(references: AssessmentReference[]): Promise<CKDAssessment[]> {
    const results = await Promise.all(references.map((reference) => this.getAuthorizedAssessment(reference)));
    return results.filter((assessment): assessment is CKDAssessment => Boolean(assessment));
  }

  async deleteAuthorizedAssessment(reference: AssessmentReference): Promise<boolean> {
    const assessment = await this.getAuthorizedAssessment(reference);
    if (!assessment) return false;
    this.ckdAssessments.delete(assessment.id);
    this.dietPlans.forEach((plan, id) => {
      if (plan.assessmentId === assessment.id) this.dietPlans.delete(id);
    });
    return true;
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

  async getDietPlansForAuthorizedAssessments(references: AssessmentReference[]): Promise<DietPlan[]> {
    const assessments = await this.getAuthorizedAssessments(references);
    const ids = new Set(assessments.map(({ id }) => id));
    return Array.from(this.dietPlans.values()).filter((plan) => plan.assessmentId !== null && ids.has(plan.assessmentId));
  }


}

export const storage: IStorage = db ? new DatabaseStorage(db) : new MemStorage();
