import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CKDAssessment, DietPlan } from '@shared/schema';

// PDP Features configuration for chart generation
const PDP_FEATURES = [
  { name: "Age", key: "age", unit: "years", minValue: 18, maxValue: 90, getValue: (a: CKDAssessment) => Number(a.age) || 45 },
  { name: "Blood Pressure", key: "bloodPressure", unit: "mmHg", minValue: 80, maxValue: 200, getValue: (a: CKDAssessment) => Number(a.bloodPressure) || 120 },
  { name: "Albumin", key: "albumin", unit: "levels", minValue: 0, maxValue: 5, getValue: (a: CKDAssessment) => Number(a.albumin) || 1 },
  { name: "Blood Glucose / Plasma Glucose", key: "bloodGlucoseRandom", unit: "mg/dL", minValue: 70, maxValue: 300, getValue: (a: CKDAssessment) => Number(a.bloodGlucoseRandom) || 140 },
  { name: "Blood Urea", key: "bloodUrea", unit: "mg/dL", minValue: 10, maxValue: 80, getValue: (a: CKDAssessment) => Number(a.bloodUrea) || 35 },
  { name: "Serum Creatinine", key: "serumCreatinine", unit: "mg/dL", minValue: 0.5, maxValue: 5, getValue: (a: CKDAssessment) => Number(a.serumCreatinine) || 1.2 },
  { name: "Sodium", key: "sodium", unit: "mEq/L", minValue: 130, maxValue: 150, getValue: (a: CKDAssessment) => Number(a.sodium) || 140 },
  { name: "Potassium", key: "potassium", unit: "mEq/L", minValue: 3, maxValue: 6, getValue: (a: CKDAssessment) => Number(a.potassium) || 4.5 },
  { name: "Hemoglobin", key: "hemoglobin", unit: "g/dL", minValue: 8, maxValue: 18, getValue: (a: CKDAssessment) => Number(a.hemoglobin) || 12 },
  { name: "WBC Count", key: "wbcCount", unit: "cells/μL", minValue: 4000, maxValue: 15000, getValue: (a: CKDAssessment) => Number(a.wbcCount) || 8000 },
  { name: "RBC Count", key: "rbcCount", unit: "million/μL", minValue: 3.5, maxValue: 6.5, getValue: (a: CKDAssessment) => Number(a.rbcCount) || 4.5 }
];

// Brand colors and styling
const BRAND_COLORS = {
  primary: '#3B82F6', // Blue
  secondary: '#10B981', // Green
  accent: '#F59E0B', // Amber
  text: '#1F2937', // Gray-800
  lightText: '#6B7280', // Gray-500
  background: '#F9FAFB', // Gray-50
};

const localDateStamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export class PDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = 20;
    this.currentY = this.margin;
  }

  private addHeader(title: string, subtitle?: string) {
    // Add brand header with logo area
    this.doc.setFillColor(59, 130, 246); // Primary blue
    this.doc.rect(0, 0, this.pageWidth, 25, 'F');
    
    // Brand name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('NephroCare', this.margin, 15);
    
    // Tagline
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Chronic Kidney Disease Assessment & Care', this.margin, 20);
    
    // Date
    const date = new Date().toLocaleDateString('en-GB');
    this.doc.text(`Generated: ${date}`, this.pageWidth - this.margin, 15, { align: 'right' });
    
    this.currentY = 35;
    
    // Title
    this.doc.setTextColor(31, 41, 55); // Gray-800
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128); // Gray-500
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += 15;
    } else {
      this.currentY += 10;
    }
  }

  private addSection(title: string) {
    this.currentY += 5;
    this.doc.setFillColor(249, 250, 251); // Gray-50
    this.doc.rect(this.margin - 5, this.currentY - 5, this.pageWidth - 2 * this.margin + 10, 12, 'F');
    
    this.doc.setTextColor(31, 41, 55);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY + 3);
    this.currentY += 15;
  }

  private addKeyValuePair(key: string, value: string | number, color?: string) {
    this.checkPageBreak(14);
    const valueX = this.margin + 68;
    const keyLines = this.doc.splitTextToSize(`${key}:`, 60) as string[];
    const valueLines = this.doc.splitTextToSize(String(value), this.pageWidth - valueX - this.margin) as string[];
    const lineCount = Math.max(keyLines.length, valueLines.length);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text(keyLines, this.margin, this.currentY);
    
    this.doc.setFont('helvetica', 'normal');
    if (color) {
      this.doc.setTextColor(color);
    } else {
      this.doc.setTextColor(107, 114, 128);
    }
    this.doc.text(valueLines, valueX, this.currentY);
    this.currentY += lineCount * 5 + 2;
  }

  private addRiskBox(riskScore: number, riskLevel: string) {
    const boxWidth = 60;
    const boxHeight = 25;
    const boxX = this.pageWidth - this.margin - boxWidth;
    
    // Determine colors based on risk level
    let bgColor, textColor;
    if (riskLevel.toLowerCase().includes('high')) {
      bgColor = [239, 68, 68]; // Red
      textColor = [255, 255, 255];
    } else if (riskLevel.toLowerCase().includes('moderate')) {
      bgColor = [245, 158, 11]; // Amber
      textColor = [255, 255, 255];
    } else {
      bgColor = [16, 185, 129]; // Green
      textColor = [255, 255, 255];
    }
    
    this.doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    this.doc.roundedRect(boxX, this.currentY - 5, boxWidth, boxHeight, 3, 3, 'F');
    
    this.doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Risk Score', boxX + boxWidth/2, this.currentY + 3, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.text(`${(riskScore * 100).toFixed(1)}%`, boxX + boxWidth/2, this.currentY + 10, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.text(riskLevel, boxX + boxWidth/2, this.currentY + 16, { align: 'center' });
  }

  private checkPageBreak(additionalSpace: number = 20) {
    if (this.currentY + additionalSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addFooters() {
    const pageCount = this.doc.getNumberOfPages();

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      this.doc.setPage(pageNumber);
      const footerY = this.pageHeight - 12;
      this.doc.setDrawColor(209, 220, 225);
      this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
      this.doc.setFontSize(7.5);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text('Educational screening only. Not a diagnosis, prescription, or treatment plan.', this.margin, footerY);
      this.doc.text(`Page ${pageNumber} of ${pageCount}`, this.pageWidth - this.margin, footerY, { align: 'right' });
    }
  }

  private async addElementAsImage(elementId: string, title?: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID ${elementId} not found`);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const maxWidth = this.pageWidth - 2 * this.margin;
      const naturalHeight = (canvas.height * maxWidth) / canvas.width;
      const titleSpace = title ? 20 : 0;
      const maxHeight = this.pageHeight - 2 * this.margin - titleSpace - 12;
      const scale = Math.min(1, maxHeight / naturalHeight);
      const imgWidth = maxWidth * scale;
      const imgHeight = naturalHeight * scale;

      if (this.currentY + titleSpace + imgHeight > this.pageHeight - this.margin - 12) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      if (title) this.addSection(title);

      const imageX = (this.pageWidth - imgWidth) / 2;
      this.doc.addImage(imgData, 'PNG', imageX, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 10;

    } catch (error) {
      console.error(`Failed to capture element ${elementId}:`, error);
      // Add placeholder text if image capture fails
      this.doc.setFontSize(10);
      this.doc.setTextColor(239, 68, 68);
      this.doc.text(`[Chart could not be captured: ${title || elementId}]`, this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  private addInstructionsSection() {
    this.checkPageBreak(80);
    this.addSection('How to Read This Report');
    
    const instructions = [
      {
        title: 'Screening estimate:',
        content: '- A higher estimate means the entered pattern deserves timely clinical review\n- A lower estimate does not rule out kidney disease\n- Only a qualified clinician can diagnose CKD using history, examination, and repeat testing'
      },
      {
        title: 'SHAP Analysis Explanation:',
        content: '- Shows which entered factors most influenced this model estimate\n- Red bars raise the estimate and green bars lower it\n- Longer bars indicate stronger model influence\n- Influence does not prove that a factor caused disease'
      },
      {
        title: 'Partial Dependence Plots (PDP):',
        content: '- Illustrate how the model responds as one input changes\n- Other information is held steady for this view\n- The marked point represents the entered value\n- The curve is a model explanation, not a clinical threshold'
      },
      {
        title: 'Laboratory Values:',
        content: '- Bring the original laboratory report to a clinician\n- Reference ranges can vary between laboratories and people\n- Ask how trends, medicines, symptoms, and repeat tests affect interpretation'
      }
    ];

    instructions.forEach(instruction => {
      this.checkPageBreak(25);
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(59, 130, 246);
      this.doc.text(instruction.title, this.margin, this.currentY);
      this.currentY += 6;
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(31, 41, 55);
      
      const lines = instruction.content.split('\n');
      lines.forEach(line => {
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 4;
      });
      
      this.currentY += 3;
    });
  }

  private addSHAPRecommendations(assessment: CKDAssessment) {
    this.checkPageBreak(40);
    this.addSection('Values to Discuss With a Clinician');
    
    // Generate SHAP-based recommendations (simplified version)
    const recommendations = [];
    
    if (assessment.serumCreatinine > 1.2) {
      recommendations.push({
        factor: 'High Serum Creatinine',
        value: `${assessment.serumCreatinine} mg/dL`,
        advice: 'Ask how this result should be interpreted with eGFR, repeat tests, medicines, hydration, and health history.'
      });
    }
    
    if (assessment.bloodUrea > 40) {
      recommendations.push({
        factor: 'Elevated Blood Urea',
        value: `${assessment.bloodUrea} mg/dL`, 
        advice: 'Ask whether this result should be repeated and what other findings are needed for context.'
      });
    }
    
    if (assessment.bloodGlucoseRandom > 160) {
      recommendations.push({
        factor: 'High Blood Glucose',
        value: `${assessment.bloodGlucoseRandom} mg/dL`,
        advice: 'Ask how this value fits with fasting glucose, HbA1c, medicines, and the wider clinical picture.'
      });
    }
    
    if (assessment.bloodPressure > 140) {
      recommendations.push({
        factor: 'High Blood Pressure', 
        value: `${assessment.bloodPressure} mmHg`,
        advice: 'Ask whether repeat blood-pressure readings or home monitoring would be appropriate.'
      });
    }
    
    if (recommendations.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(31, 41, 55);
      this.doc.text('No individual discussion prompts were generated from the available values.', this.margin, this.currentY);
      this.currentY += 6;
      this.doc.text('A clinician may still recommend testing based on symptoms, history, or risk factors.', this.margin, this.currentY);
      this.currentY += 10;
    } else {
      recommendations.forEach((rec, index) => {
        this.checkPageBreak(20);
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(239, 68, 68);
        this.doc.text(`${index + 1}. ${rec.factor}: ${rec.value}`, this.margin, this.currentY);
        this.currentY += 6;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(31, 41, 55);
        this.doc.text(`Question prompt: ${rec.advice}`, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 5
        });
        this.currentY += 10;
      });
    }
  }

  async generateAssessmentReport(assessment: CKDAssessment): Promise<void> {
    const riskScore = assessment.riskScore || 0;
    const riskLevel = riskScore > 0.7 ? 'High Risk' : riskScore > 0.4 ? 'Moderate Risk' : 'Low Risk';
    
    this.addHeader('Preliminary CKD Screening Report', `Patient: ${assessment.patientName}`);
    
    // Risk score box
    this.addRiskBox(riskScore, riskLevel);
    this.currentY += 30;
    
    // Patient Information
    this.addSection('Patient Information');
    this.addKeyValuePair('Name', assessment.patientName);
    this.addKeyValuePair('Age', `${assessment.age} years`);
    this.addKeyValuePair('Assessment Date', new Date(assessment.createdAt!).toLocaleDateString());
    
    this.checkPageBreak();
    
    // Vital Signs
    this.addSection('Vital Signs & Physical Examination');
    this.addKeyValuePair('Blood Pressure', `${assessment.bloodPressure} mmHg`);
    this.addKeyValuePair('Appetite', assessment.appetite);
    this.addKeyValuePair('Pedal Edema', assessment.pedalEdema);
    this.addKeyValuePair('Anemia', assessment.anemia);
    
    this.checkPageBreak();
    
    // Laboratory Results
    this.addSection('Laboratory Results');
    
    // Urine Tests
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246);
    this.doc.text('Urine Analysis:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.addKeyValuePair('Albumin', assessment.albumin);
    this.addKeyValuePair('Sugar', assessment.sugar);
    this.addKeyValuePair('Red Blood Cells', assessment.redBloodCells);
    this.addKeyValuePair('Pus Cells', assessment.pusCell);
    
    this.currentY += 5;
    
    // Blood Tests
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246);
    this.doc.text('Blood Chemistry:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.addKeyValuePair('Random Blood Glucose', `${assessment.bloodGlucoseRandom} mg/dL`);
    this.addKeyValuePair('Blood Urea', `${assessment.bloodUrea} mg/dL`);
    this.addKeyValuePair('Serum Creatinine', `${assessment.serumCreatinine} mg/dL`);
    this.addKeyValuePair('Sodium', `${assessment.sodium} mEq/L`);
    this.addKeyValuePair('Potassium', `${assessment.potassium} mEq/L`);
    
    this.currentY += 5;
    
    // Complete Blood Count
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246);
    this.doc.text('Complete Blood Count:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.addKeyValuePair('Hemoglobin', `${assessment.hemoglobin} g/dL`);
    this.addKeyValuePair('WBC Count', `${assessment.wbcCount} cells/uL`);
    this.addKeyValuePair('RBC Count', `${assessment.rbcCount} million/uL`);
    
    this.checkPageBreak();
    
    // Medical History
    this.addSection('Medical History');
    this.addKeyValuePair('Hypertension', assessment.hypertension);
    this.addKeyValuePair('Diabetes Mellitus', assessment.diabetesMellitus);
    
    this.checkPageBreak();
    
    // Risk Assessment
    this.addSection('Preliminary Screening Context');
    this.doc.setFontSize(11);
    this.doc.setTextColor(31, 41, 55);
    
    const riskText = riskScore > 0.7
      ? 'The entered pattern produced a higher screening estimate. Arrange prompt clinical review; use urgent services for severe or rapidly worsening symptoms.'
      : riskScore > 0.4
        ? 'The entered pattern produced a moderate screening estimate. Discuss the result with a qualified clinician and compare it with repeat laboratory testing.'
        : 'The entered pattern produced a lower screening estimate. This does not rule out CKD; symptoms, risk factors, and laboratory trends may still require review.';
    
    this.doc.text(riskText, this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    this.currentY += 15;

    // Add SHAP Analysis visualization
    await this.addElementAsImage('shap-plot', 'SHAP Feature Importance Analysis');
    
    // Add personalized recommendations based on SHAP
    this.addSHAPRecommendations(assessment);

    // Add PDP and LIME analysis
    await this.addElementAsImage('pdp-plot-container', 'Partial Dependence Plot Analysis');
    await this.addElementAsImage('lime-explanation', 'LIME Local Explanation');

    // Add comprehensive instructions on same page or new page if needed
    this.checkPageBreak(100);
    this.addInstructionsSection();
    
    // General Recommendations
    this.checkPageBreak(40);
    this.addSection('Appointment Preparation');
    const recommendations = [
      '- Bring the original laboratory report and a current medicine list',
      '- Note when symptoms began and whether they are changing',
      '- Ask whether eGFR and urine albumin testing are appropriate',
      '- Ask how repeat values compare with earlier results',
      '- Do not change medicines, food restrictions, or fluid intake from this report alone'
    ];
    
    recommendations.forEach(rec => {
      this.doc.setFontSize(10);
      this.doc.setTextColor(31, 41, 55);
      this.doc.text(rec, this.margin, this.currentY);
      this.currentY += 5;
    });

    // Medical Disclaimer
    this.checkPageBreak(30);
    this.addSection('Important Medical Disclaimer');
    this.doc.setFontSize(9);
    this.doc.setTextColor(239, 68, 68);
    this.doc.text('Important: This assessment is for education and preliminary screening only. It does not replace professional medical evaluation.',
      this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    this.currentY += 6;
    this.doc.text('Consult a qualified healthcare provider for diagnosis, treatment planning, and medical management.',
      this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    this.currentY += 6;
    this.doc.text('Individual circumstances vary and may require care beyond this automated assessment.',
      this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    
    this.addFooters();
  }

  async generateDietPlanReport(dietPlan: DietPlan, assessment?: CKDAssessment): Promise<void> {
    this.addHeader('Kidney Diet Conversation Brief', assessment ? `Patient: ${assessment.patientName}` : undefined);

    this.addSection('Brief Overview');
    this.addKeyValuePair('Food Pattern', dietPlan.dietType);
    this.addKeyValuePair('Brief Created', new Date(dietPlan.createdAt!).toLocaleDateString());
    if (assessment) {
      this.addKeyValuePair('Assessment Date', new Date(assessment.createdAt!).toLocaleDateString());
      this.addKeyValuePair('Screening Estimate', `${((assessment.riskScore || 0) * 100).toFixed(1)}%`);
    }

    this.currentY += 3;
    this.doc.setFontSize(9.5);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(31, 41, 55);
    const overview = this.doc.splitTextToSize(
      'This brief organises food examples and questions for discussion with a renal dietitian or clinician. It does not prescribe nutrient limits or replace an individualized diet plan.',
      this.pageWidth - 2 * this.margin,
    ) as string[];
    this.doc.text(overview, this.margin, this.currentY);
    this.currentY += overview.length * 5 + 4;

    if (assessment) {
      this.checkPageBreak(55);
      this.addSection('Assessment Values to Bring to the Discussion');
      this.addKeyValuePair('Serum Creatinine', `${assessment.serumCreatinine} mg/dL`);
      this.addKeyValuePair('Blood Urea', `${assessment.bloodUrea} mg/dL`);
      this.addKeyValuePair('Blood Pressure', `${assessment.bloodPressure} mmHg`);
      this.addKeyValuePair('Potassium', `${assessment.potassium} mEq/L`);
      this.addKeyValuePair('Blood Glucose', `${assessment.bloodGlucoseRandom} mg/dL`);
    }

    const addFoodList = (title: string, rawItems: string) => {
      this.checkPageBreak(40);
      this.addSection(title);
      const items = rawItems.split(',').map((item) => item.trim()).filter(Boolean);

      items.forEach((item, index) => {
        this.checkPageBreak(12);
        this.doc.setFontSize(9.5);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(31, 41, 55);
        const lines = this.doc.splitTextToSize(`${index + 1}. ${item}`, this.pageWidth - 2 * this.margin - 4) as string[];
        this.doc.text(lines, this.margin + 2, this.currentY);
        this.currentY += lines.length * 5 + 2;
      });
    };

    addFoodList('Food Examples to Discuss', dietPlan.foodsToEat);
    addFoodList('Foods to Ask About Limiting', dietPlan.foodsToAvoid);

    this.checkPageBreak(75);
    this.addSection('Questions for a Renal Dietitian or Clinician');
    const questions = [
      'Which foods on these lists fit my diagnosis, stage, medicines, body weight, and latest laboratory results?',
      'Do I need an individualized target for protein, sodium, potassium, phosphorus, or carbohydrates?',
      'Should any laboratory values be repeated before I change my usual diet?',
      'What symptoms or weight changes should prompt an earlier review?',
      'How should my cultural food preferences and usual meals be adapted safely?',
    ];

    questions.forEach((question, index) => {
      this.checkPageBreak(14);
      this.doc.setFontSize(9.5);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(31, 41, 55);
      const lines = this.doc.splitTextToSize(`${index + 1}. ${question}`, this.pageWidth - 2 * this.margin - 4) as string[];
      this.doc.text(lines, this.margin + 2, this.currentY);
      this.currentY += lines.length * 5 + 3;
    });

    this.checkPageBreak(42);
    this.addSection('Fluid Planning');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(31, 41, 55);
    const fluidCopy = this.doc.splitTextToSize(
      'Do not restrict or substantially increase fluids from this brief alone. Kidney function, swelling, urine output, medicines, heart health, activity, and weather can all affect what is appropriate. Confirm a personal target with a qualified clinician.',
      this.pageWidth - 2 * this.margin,
    ) as string[];
    this.doc.text(fluidCopy, this.margin, this.currentY);
    this.currentY += fluidCopy.length * 5 + 5;

    this.checkPageBreak(35);
    this.addSection('Important Boundary');
    this.doc.setFontSize(9);
    this.doc.setTextColor(190, 50, 45);
    const boundary = this.doc.splitTextToSize(
      'This is an educational conversation brief, not a prescription. Do not change food restrictions, supplements, medicines, or fluid intake without advice from a qualified healthcare professional who knows your medical history.',
      this.pageWidth - 2 * this.margin,
    ) as string[];
    this.doc.text(boundary, this.margin, this.currentY);

    this.addFooters();
  }

  save(filename: string): void {
    this.doc.save(filename);
  }
}

// Utility functions for easy use
export const generateAssessmentPDF = async (assessment: CKDAssessment) => {
  const generator = new PDFGenerator();
  await generator.generateAssessmentReport(assessment);
  generator.save(`CKD_Assessment_${assessment.patientName}_${localDateStamp()}.pdf`);
};

export const generateDietPlanPDF = async (dietPlan: DietPlan, assessment?: CKDAssessment) => {
  const generator = new PDFGenerator();
  await generator.generateDietPlanReport(dietPlan, assessment);
  const patientName = assessment?.patientName || 'Patient';
  generator.save(`Diet_Plan_${patientName}_${localDateStamp()}.pdf`);
};
