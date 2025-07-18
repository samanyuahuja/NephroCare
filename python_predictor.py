#!/usr/bin/env python3
"""
Simple CKD prediction script that can be called from Node.js
Based on your Flask app.py clinical logic with fallback prediction
"""

import sys
import json
import warnings
warnings.filterwarnings('ignore')

def clinical_ckd_prediction(data):
    """
    CKD prediction based on clinical guidelines and your Flask app.py logic
    Uses real medical thresholds for CKD risk assessment
    """
    risk_score = 0.0
    
    # Convert string inputs to numbers where needed
    try:
        age = float(data.get('age', 0))
        bp = float(data.get('bp', 0))
        sc = float(data.get('sc', 0))  # Serum Creatinine
        hemo = float(data.get('hemo', 0))  # Hemoglobin
        bu = float(data.get('bu', 0))  # Blood Urea
        al = float(data.get('al', 0))  # Albumin
        
        # Age risk (kidney function naturally declines with age)
        if age > 60:
            risk_score += 0.15
        elif age > 45:
            risk_score += 0.08
        
        # Serum Creatinine - MOST IMPORTANT indicator (normal: 0.6-1.2 mg/dL)
        if sc > 1.5:
            risk_score += 0.42  # High risk
        elif sc > 1.2:
            risk_score += 0.25  # Moderate risk
        elif sc > 1.0:
            risk_score += 0.10  # Mild elevation
        
        # Hemoglobin - Low levels indicate anemia (CKD complication)
        if hemo < 10:
            risk_score += 0.28  # Severe anemia
        elif hemo < 12:
            risk_score += 0.15  # Mild anemia
        
        # Blood Urea - Elevated indicates poor kidney filtration
        if bu > 40:
            risk_score += 0.20
        elif bu > 25:
            risk_score += 0.10
        
        # Blood Pressure - Hypertension damages kidneys
        if bp > 140:
            risk_score += 0.12
        elif bp > 130:
            risk_score += 0.06
        
        # Comorbid conditions
        if data.get('dm') == 'yes':  # Diabetes
            risk_score += 0.15
        if data.get('htn') == 'yes':  # Hypertension
            risk_score += 0.10
        
        # Proteinuria (albumin in urine) - key CKD indicator
        if al > 2:
            risk_score += 0.18
        elif al > 1:
            risk_score += 0.08
        
        # Physical symptoms
        if data.get('pe') == 'yes':  # Pedal edema (swelling)
            risk_score += 0.08
        if data.get('ane') == 'yes':  # Anemia
            risk_score += 0.06
        if data.get('appet') == 'poor':  # Poor appetite
            risk_score += 0.05
        
        # Urinalysis abnormalities
        if data.get('rbc') == 'abnormal':  # Blood in urine
            risk_score += 0.07
        if data.get('pc') == 'abnormal':  # Pus cells
            risk_score += 0.05
        
        # Additional lab values
        sod = float(data.get('sod', 140))  # Sodium
        pot = float(data.get('pot', 4))    # Potassium
        
        # Electrolyte imbalances
        if sod < 135 or sod > 145:
            risk_score += 0.04
        if pot > 5.0:  # Hyperkalemia common in CKD
            risk_score += 0.06
        
        # Calculated risk ratios
        if sc > 0:
            bun_creatinine_ratio = bu / sc
            if bun_creatinine_ratio > 20:
                risk_score += 0.08
        
        # Cap risk score at 95%
        risk_score = min(risk_score, 0.95)
        
        # Determine risk level
        if risk_score < 0.3:
            risk_level = "Low Risk"
            risk_color = "success"
        elif risk_score < 0.6:
            risk_level = "Moderate Risk"
            risk_color = "warning"
        elif risk_score < 0.85:
            risk_level = "High Risk"
            risk_color = "danger"
        else:
            risk_level = "Very High Risk"
            risk_color = "danger"
        
        # Generate clinical reasoning
        primary_factors = []
        if sc > 1.2:
            primary_factors.append(f"Elevated creatinine ({sc} mg/dL)")
        if hemo < 12:
            primary_factors.append(f"Low hemoglobin ({hemo} g/dL)")
        if bu > 25:
            primary_factors.append(f"High blood urea ({bu} mg/dL)")
        if bp > 140:
            primary_factors.append(f"High blood pressure ({bp} mmHg)")
        
        reasoning = "Risk assessment based on: " + (
            "; ".join(primary_factors) if primary_factors 
            else "Overall clinical parameters within normal ranges"
        )
        
        return {
            "prediction": 1 if risk_score > 0.5 else 0,
            "probability": round(risk_score, 3),
            "risk_level": risk_level,
            "risk_color": risk_color,
            "no_ckd_probability": round(1 - risk_score, 3),
            "reasoning": reasoning,
            "primary_factors": primary_factors
        }
        
    except Exception as e:
        return {
            "error": f"Prediction calculation failed: {str(e)}",
            "prediction": 0,
            "probability": 0.0,
            "risk_level": "Unknown",
            "risk_color": "secondary"
        }

def main():
    try:
        # Read JSON input from command line
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            # Read from stdin
            input_data = json.load(sys.stdin)
        
        # Make prediction
        result = clinical_ckd_prediction(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": f"Script execution failed: {str(e)}",
            "prediction": 0,
            "probability": 0.0,
            "risk_level": "Error",
            "risk_color": "danger"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()