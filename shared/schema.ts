import { pgTable, text, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const ckdAssessments = pgTable("ckd_assessments", {
  id: serial("id").primaryKey(),
  // Patient Info
  patientName: text("patient_name").notNull(),
  age: integer("age").notNull(),
  bloodPressure: integer("blood_pressure").notNull(),
  albumin: integer("albumin").notNull(),
  sugar: integer("sugar").notNull(),
  
  // Lab Results  
  redBloodCells: text("red_blood_cells").notNull(),
  pusCell: text("pus_cell").notNull(),
  bloodGlucoseRandom: integer("blood_glucose_random").notNull(),
  bloodUrea: integer("blood_urea").notNull(),
  serumCreatinine: real("serum_creatinine").notNull(),
  sodium: integer("sodium").notNull(),
  potassium: real("potassium").notNull(),
  hemoglobin: real("hemoglobin").notNull(),
  wbcCount: integer("wbc_count").notNull(),
  rbcCount: real("rbc_count").notNull(),
  
  // Conditions
  hypertension: text("hypertension").notNull(),
  diabetesMellitus: text("diabetes_mellitus").notNull(),
  appetite: text("appetite").notNull(),
  pedalEdema: text("pedal_edema").notNull(),
  anemia: text("anemia").notNull(),
  
  // Results
  riskScore: real("risk_score"),
  riskLevel: text("risk_level"),
  shapFeatures: text("shap_features"), // JSON string
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dietPlans = pgTable("diet_plans", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").references(() => ckdAssessments.id),
  dietType: text("diet_type").notNull(), // 'vegetarian' | 'non-vegetarian'
  foodsToEat: text("foods_to_eat").notNull(), // JSON string
  foodsToAvoid: text("foods_to_avoid").notNull(), // JSON string
  waterIntakeAdvice: text("water_intake_advice").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCKDAssessmentSchema = createInsertSchema(ckdAssessments).omit({
  id: true,
  riskScore: true,
  riskLevel: true,
  shapFeatures: true,
  createdAt: true,
}).extend({
  patientName: z.string().min(1, "Patient name is required"),
  albumin: z.union([z.number().min(0).max(5), z.literal("unknown")]),
  sugar: z.union([z.number().min(0).max(5), z.literal("unknown")]),
  redBloodCells: z.enum(["normal", "abnormal", "unknown"]),
  pusCell: z.enum(["normal", "abnormal", "unknown"]),
  bloodGlucoseRandom: z.union([z.number().min(70).max(400), z.literal("unknown")]),
  bloodUrea: z.union([z.number().min(7).max(100), z.literal("unknown")]),
  serumCreatinine: z.union([z.number().min(0.6).max(10.0), z.literal("unknown")]),
  sodium: z.union([z.number().min(130).max(150), z.literal("unknown")]),
  potassium: z.union([z.number().min(3.0).max(6.0), z.literal("unknown")]),
  hemoglobin: z.union([z.number().min(8.0).max(18.0), z.literal("unknown")]),
  wbcCount: z.union([z.number().positive(), z.literal("unknown")]),
  rbcCount: z.union([z.number().positive(), z.literal("unknown")]),
  hypertension: z.enum(["no", "yes", "unknown"]),
  diabetesMellitus: z.enum(["no", "yes", "unknown"]),
  appetite: z.enum(["good", "poor", "unknown"]),
  pedalEdema: z.enum(["no", "yes", "unknown"]),
  anemia: z.enum(["no", "yes", "unknown"]),
});

export const insertDietPlanSchema = createInsertSchema(dietPlans).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  response: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CKDAssessment = typeof ckdAssessments.$inferSelect;
export type InsertCKDAssessment = z.infer<typeof insertCKDAssessmentSchema>;
export type DietPlan = typeof dietPlans.$inferSelect & {
  patientName?: string; // Added from joined query
};
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
