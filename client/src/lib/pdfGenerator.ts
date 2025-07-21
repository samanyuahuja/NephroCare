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
    this.doc.text(`Generated: ${date}`, this.pageWidth - this.margin - 30, 15);
    
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
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text(`${key}:`, this.margin, this.currentY);
    
    this.doc.setFont('helvetica', 'normal');
    if (color) {
      this.doc.setTextColor(color);
    } else {
      this.doc.setTextColor(107, 114, 128);
    }
    this.doc.text(String(value), this.margin + 50, this.currentY);
    this.currentY += 6;
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

  private addFooter() {
    const footerY = this.pageHeight - 15;
    this.doc.setFontSize(8);
    this.doc.setTextColor(107, 114, 128);
    this.doc.text('This report is generated by NephroCare for educational purposes. Please consult a healthcare professional for medical advice.', 
      this.pageWidth/2, footerY, { align: 'center' });
    
    // Page number  
    const pageNum = this.doc.getNumberOfPages();
    this.doc.text(`Page ${pageNum}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  private async addElementAsImage(elementId: string, title?: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID ${elementId} not found`);
      return;
    }

    try {
      this.checkPageBreak(60);
      
      if (title) {
        this.addSection(title);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pageWidth - 2 * this.margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if image fits on current page
      if (this.currentY + imgHeight > this.pageHeight - this.margin - 20) {
        this.doc.addPage();
        this.currentY = this.margin;
        if (title) {
          this.addSection(title);
        }
      }

      this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
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
        title: 'Risk Score Understanding:',
        content: '• High Risk (>70%): Immediate medical consultation recommended\n• Moderate Risk (40-70%): Regular monitoring and lifestyle changes advised\n• Low Risk (<40%): Maintain healthy lifestyle and regular check-ups'
      },
      {
        title: 'SHAP Analysis Explanation:',
        content: '• Shows which factors most influence your CKD risk\n• Red bars increase risk, blue bars decrease risk\n• Longer bars have stronger impact on the prediction\n• Values on the right show your actual measurements'
      },
      {
        title: 'Partial Dependence Plots (PDP):',
        content: '• Show how each health parameter affects CKD risk\n• Y-axis: CKD risk probability (0-1 scale)\n• X-axis: Parameter values (your value marked with red dot)\n• Curved lines show risk trends across different values'
      },
      {
        title: 'Laboratory Values:',
        content: '• Compare your results with normal ranges provided\n• Values outside normal ranges may indicate health concerns\n• Consult healthcare provider for interpretation and management'
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
    this.addSection('Personalized Health Recommendations');
    
    // Generate SHAP-based recommendations (simplified version)
    const recommendations = [];
    
    if (assessment.serumCreatinine > 1.2) {
      recommendations.push({
        factor: 'High Serum Creatinine',
        value: `${assessment.serumCreatinine} mg/dL`,
        advice: 'Reduce protein intake, stay hydrated, avoid NSAIDs, consult nephrologist'
      });
    }
    
    if (assessment.bloodUrea > 40) {
      recommendations.push({
        factor: 'Elevated Blood Urea',
        value: `${assessment.bloodUrea} mg/dL`, 
        advice: 'Moderate protein diet, adequate hydration, kidney function monitoring'
      });
    }
    
    if (assessment.bloodGlucoseRandom > 160) {
      recommendations.push({
        factor: 'High Blood Glucose',
        value: `${assessment.bloodGlucoseRandom} mg/dL`,
        advice: 'Diabetes management, low glycemic diet, regular blood sugar monitoring'
      });
    }
    
    if (assessment.bloodPressure > 140) {
      recommendations.push({
        factor: 'High Blood Pressure', 
        value: `${assessment.bloodPressure} mmHg`,
        advice: 'Low sodium diet, regular exercise, stress management, BP monitoring'
      });
    }
    
    if (recommendations.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(16, 185, 129);
      this.doc.text('✓ Your current health parameters are within acceptable ranges.', this.margin, this.currentY);
      this.currentY += 6;
      this.doc.text('Continue maintaining healthy lifestyle habits and regular monitoring.', this.margin, this.currentY);
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
        this.doc.text(`Recommendation: ${rec.advice}`, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 5
        });
        this.currentY += 10;
      });
    }
  }

  async generateAssessmentReport(assessment: CKDAssessment): Promise<void> {
    const riskScore = assessment.riskScore || 0;
    const riskLevel = riskScore > 0.7 ? 'High Risk' : riskScore > 0.4 ? 'Moderate Risk' : 'Low Risk';
    
    this.addHeader('Comprehensive CKD Assessment Report', `Patient: ${assessment.patientName}`);
    
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
    
    this.addKeyValuePair('Blood Glucose Random / Plasma Glucose Random', `${assessment.bloodGlucoseRandom} mg/dL`);
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
    this.addKeyValuePair('WBC Count', `${assessment.wbcCount} cells/μL`);
    this.addKeyValuePair('RBC Count', `${assessment.rbcCount} million/μL`);
    
    this.checkPageBreak();
    
    // Medical History
    this.addSection('Medical History');
    this.addKeyValuePair('Hypertension', assessment.hypertension);
    this.addKeyValuePair('Diabetes Mellitus', assessment.diabetesMellitus);
    
    this.checkPageBreak();
    
    // Risk Assessment
    this.addSection('AI Risk Assessment Summary');
    this.doc.setFontSize(11);
    this.doc.setTextColor(31, 41, 55);
    
    const riskText = riskScore > 0.7 
      ? 'HIGH RISK of CKD detected. Immediate medical consultation strongly recommended for comprehensive evaluation and management.' 
      : riskScore > 0.4 
        ? 'MODERATE RISK of CKD identified. Regular monitoring and proactive lifestyle modifications advised to prevent progression.'
        : 'LOW RISK of CKD currently. Continue maintaining healthy lifestyle habits and schedule regular preventive check-ups.';
    
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
    this.addSection('General Health Recommendations');
    const recommendations = [
      '• Schedule regular follow-up appointments with your healthcare provider',
      '• Monitor blood pressure and blood glucose levels as recommended',
      '• Follow a kidney-friendly diet plan with appropriate protein restriction',
      '• Maintain adequate hydration while monitoring fluid intake if restricted',
      '• Engage in regular physical activity as approved by your physician',
      '• Avoid nephrotoxic medications (NSAIDs, etc.) without medical supervision',
      '• Manage underlying conditions (diabetes, hypertension) effectively',
      '• Consider genetic counseling if family history of kidney disease exists'
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
    this.doc.text('⚠ This assessment is for educational and screening purposes only and should not replace professional medical evaluation.', 
      this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    this.currentY += 6;
    this.doc.text('⚠ Please consult with a qualified healthcare provider for proper diagnosis, treatment planning, and medical management.', 
      this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    this.currentY += 6;
    this.doc.text('⚠ Individual health conditions may vary and require personalized medical attention beyond this automated assessment.', 
      this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    
    this.addFooter();
  }

  async generateDietPlanReport(dietPlan: DietPlan, assessment?: CKDAssessment): Promise<void> {
    this.addHeader('Comprehensive Diet Plan Report', assessment ? `Patient: ${assessment.patientName}` : undefined);
    
    // Diet Plan Overview
    this.addSection('Diet Plan Overview');
    this.addKeyValuePair('Diet Type', dietPlan.dietType);
    this.addKeyValuePair('Plan Created', new Date(dietPlan.createdAt!).toLocaleDateString());
    if (assessment) {
      this.addKeyValuePair('Based on Assessment', new Date(assessment.createdAt!).toLocaleDateString());
      this.addKeyValuePair('Risk Assessment', `${((assessment.riskScore || 0) * 100).toFixed(1)}%`);
    }
    
    this.checkPageBreak();

    // Add assessment-based dietary recommendations if available
    if (assessment) {
      this.addSection('Personalized Dietary Recommendations Based on Your Assessment');
      
      const recommendations = [];
      
      if (assessment.serumCreatinine > 1.2) {
        recommendations.push('• PROTEIN RESTRICTION: Limit protein to 0.8g/kg body weight to reduce kidney workload');
      }
      
      if (assessment.bloodPressure > 140) {
        recommendations.push('• SODIUM RESTRICTION: Limit sodium to <2g/day to control blood pressure');
      }
      
      if (assessment.bloodGlucoseRandom > 160) {
        recommendations.push('• CARBOHYDRATE CONTROL: Focus on low glycemic index foods to manage blood sugar');
      }
      
      if (assessment.potassium > 5.0) {
        recommendations.push('• POTASSIUM RESTRICTION: Limit high-potassium foods (bananas, oranges, tomatoes)');
      }
      
      if (assessment.hemoglobin < 10) {
        recommendations.push('• IRON-RICH FOODS: Include lean meats, fortified cereals for anemia management');
      }
      
      if (recommendations.length === 0) {
        this.doc.setFontSize(10);
        this.doc.setTextColor(16, 185, 129);
        this.doc.text('✓ Your assessment indicates standard kidney-friendly diet guidelines apply.', this.margin, this.currentY);
        this.currentY += 10;
      } else {
        recommendations.forEach(rec => {
          this.doc.setFontSize(10);
          this.doc.setTextColor(31, 41, 55);
          this.doc.text(rec, this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
          this.currentY += 8;
        });
      }
      
      this.checkPageBreak();
    }

    // Capture diet plan content from webpage if available
    await this.addElementAsImage('diet-plan-content', 'Generated Diet Plan Details');
    
    // Meal Plans
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
      const mealKey = mealType as keyof typeof dietPlan;
      const meal = dietPlan[mealKey] as string;
      
      if (meal) {
        this.checkPageBreak(30);
        
        this.addSection(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Plan`);
        
        // Parse meal items (assuming they're separated by commas or bullet points)
        const items = meal.split(/[,•\n]/).filter(item => item.trim());
        
        items.forEach(item => {
          this.doc.setFontSize(10);
          this.doc.setTextColor(31, 41, 55);
          this.doc.text(`• ${item.trim()}`, this.margin, this.currentY);
          this.currentY += 5;
        });
        
        this.currentY += 5;
      }
    });
    
    this.checkPageBreak();
    
    // Comprehensive Dietary Guidelines
    this.addSection('Comprehensive CKD Dietary Guidelines');
    
    const categories = [
      {
        title: 'Protein Management:',
        items: [
          'Limit protein to 0.6-0.8g/kg body weight if CKD stages 3-5',
          'Choose high-quality proteins: fish, poultry, eggs',
          'Avoid excessive red meat consumption',
          'Consider plant-based proteins with medical supervision'
        ]
      },
      {
        title: 'Sodium Control:',
        items: [
          'Limit sodium intake to <2,300mg per day',
          'Avoid processed and packaged foods',
          'Use herbs and spices instead of salt for flavoring',
          'Read nutrition labels carefully'
        ]
      },
      {
        title: 'Potassium Considerations:',
        items: [
          'Monitor potassium levels regularly',
          'Limit high-potassium foods if levels are elevated',
          'Leach vegetables by soaking and boiling if restricted',
          'Consult dietitian for personalized potassium targets'
        ]
      },
      {
        title: 'Phosphorus Management:',
        items: [
          'Limit phosphorus to 800-1000mg/day in advanced CKD',
          'Avoid processed foods with phosphorus additives',
          'Take phosphorus binders with meals if prescribed',
          'Choose fresh foods over processed alternatives'
        ]
      }
    ];

    categories.forEach(category => {
      this.checkPageBreak(25);
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(59, 130, 246);
      this.doc.text(category.title, this.margin, this.currentY);
      this.currentY += 6;
      
      category.items.forEach(item => {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(31, 41, 55);
        this.doc.text(`• ${item}`, this.margin + 5, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin - 5 });
        this.currentY += 5;
      });
      
      this.currentY += 3;
    });
    
    this.checkPageBreak();
    
    // Important Notes
    this.addSection('Important Notes');
    this.doc.setFontSize(10);
    this.doc.setTextColor(239, 68, 68); // Red for important warnings
    this.doc.text('⚠ This diet plan is for educational purposes only.', this.margin, this.currentY);
    this.currentY += 6;
    this.doc.text('⚠ Always consult with a registered dietitian or healthcare provider before making significant dietary changes.', this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    this.currentY += 6;
    this.doc.text('⚠ Individual nutritional needs may vary based on medical condition and treatment plan.', this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
    
    this.addFooter();
  }

  save(filename: string): void {
    this.doc.save(filename);
  }
}

// Utility functions for easy use
export const generateAssessmentPDF = async (assessment: CKDAssessment) => {
  const generator = new PDFGenerator();
  await generator.generateAssessmentReport(assessment);
  generator.save(`CKD_Assessment_${assessment.patientName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateDietPlanPDF = async (dietPlan: DietPlan, assessment?: CKDAssessment) => {
  const generator = new PDFGenerator();
  await generator.generateDietPlanReport(dietPlan, assessment);
  const patientName = assessment?.patientName || 'Patient';
  generator.save(`Diet_Plan_${patientName}_${new Date().toISOString().split('T')[0]}.pdf`);
};