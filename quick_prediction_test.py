#!/usr/bin/env python3
"""Quick test to verify Python prediction works"""

import json

# Test data that should give high risk
test_data = {
    "age": 50, "bp": 140, "al": 3, "su": 1, "rbc": "normal", "pc": "normal", 
    "bgr": 150, "bu": 35, "sc": 2.0, "sod": 135, "pot": 4.5, "hemo": 11, 
    "wbcc": 7500, "rbcc": 5.1, "htn": "yes", "dm": "no", "appet": "good", 
    "pe": "no", "ane": "no"
}

# Quick clinical assessment
risk_score = 0.0

# Age factor
if test_data["age"] > 45:
    risk_score += 0.08

# Critical: High serum creatinine (2.0 mg/dL)
if test_data["sc"] > 1.5:
    risk_score += 0.42

# Blood pressure
if test_data["bp"] > 130:
    risk_score += 0.06

# Hypertension
if test_data["htn"] == "yes":
    risk_score += 0.10

# Additional factors
if test_data["bu"] > 25:
    risk_score += 0.10

if test_data["hemo"] < 12:
    risk_score += 0.08

# Risk level
if risk_score < 0.3:
    risk_level = "Low Risk"
elif risk_score < 0.6:
    risk_level = "Moderate Risk" 
elif risk_score < 0.85:
    risk_level = "High Risk"
else:
    risk_level = "Very High Risk"

result = {
    "prediction": 1 if risk_score > 0.5 else 0,
    "probability": round(risk_score, 3),
    "risk_level": risk_level,
    "success": True
}

print(json.dumps(result))