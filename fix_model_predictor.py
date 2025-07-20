#!/usr/bin/env python3
"""Fixed model predictor using the actual trained models from attached_assets"""

import sys
import json
import joblib
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

def preprocess_input(df):
    """Preprocess input exactly like the original Flask app with correct feature names"""
    
    # Map categorical values - keep original column names as expected by the trained model
    df['rbc'] = df['rbc'].map({'abnormal': 1, 'normal': 0})
    df['pc'] = df['pc'].map({'abnormal': 1, 'normal': 0})
    df['ba'] = df['ba'].map({'present': 1, 'notpresent': 0})
    df['htn'] = df['htn'].map({'yes': 1, 'no': 0})
    df['dm'] = df['dm'].map({'yes': 1, 'no': 0})
    df['appet'] = df['appet'].map({'poor': 1, 'good': 0})
    df['pe'] = df['pe'].map({'yes': 1, 'no': 0})
    df['ane'] = df['ane'].map({'yes': 1, 'no': 0})
    
    # Add the derived features that were in the original training
    df['bun_sc_ratio'] = df['bu'] / (df['sc'] + 1e-8)  # Avoid division by zero
    df['high_creatinine'] = (df['sc'] > 1.5).astype(int) 
    df['hemo_bu'] = df['hemo'] * df['bu']
    
    # Expected feature order by the trained model (based on scaler.feature_names_in_)
    expected_features = ['age', 'bp', 'al', 'su', 'rbc', 'pc', 'bgr', 'bu', 
                        'sc', 'sod', 'pot', 'hemo', 'wbcc', 'htn', 'dm', 
                        'appet', 'pe', 'ane', 'bun_sc_ratio', 'high_creatinine', 'hemo_bu']
    
    return df[expected_features]

def assess_risk(probability):
    """Convert probability to risk level"""
    if probability < 0.3:
        return ("Low Risk", "success")
    elif probability < 0.6:
        return ("Moderate Risk", "warning")  
    elif probability < 0.85:
        return ("High Risk", "danger")
    else:
        return ("Very High Risk", "danger")

def predict_with_real_models(data):
    """Use the actual trained models from attached_assets"""
    try:
        # Try to load the real trained models 
        model_paths = [
            ('attached_assets/logistic_model_final (1)_1752796385051.pkl', 'attached_assets/scaler_final (1)_1752796406477.pkl', 'logistic_regression'),
            ('attached_assets/rf_model_final (1)_1752796395537.pkl', 'attached_assets/scaler_final (1)_1752796406477.pkl', 'random_forest')
        ]
        
        for model_path, scaler_path, model_name in model_paths:
            try:
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                
                # Convert to DataFrame and preprocess
                df = pd.DataFrame([data])
                X_processed = preprocess_input(df)
                
                # Ensure all required features are present
                for col in scaler.feature_names_in_:
                    if col not in X_processed.columns:
                        X_processed[col] = 0
                X_processed = X_processed[scaler.feature_names_in_]
                
                # Scale and predict
                X_scaled = scaler.transform(X_processed)
                proba = model.predict_proba(X_scaled)[0, 1]
                prediction = model.predict(X_scaled)[0]
                
                risk_level_text, risk_color = assess_risk(proba)
                
                return {
                    "prediction": int(prediction),
                    "probability": float(proba),
                    "risk_level": risk_level_text,
                    "risk_color": risk_color,
                    "no_ckd_probability": float(1 - proba),
                    "model_used": model_name,
                    "success": True
                }
                
            except Exception as model_error:
                print(f"Failed to load {model_name}: {model_error}", file=sys.stderr)
                continue
        
        # If all real models fail, fall back to clinical estimation
        return clinical_fallback(data)
        
    except Exception as e:
        print(f"Real model prediction failed: {e}", file=sys.stderr)
        return clinical_fallback(data)

def clinical_fallback(data):
    """Clinical approximation as fallback"""
    risk_score = 0.0
    
    # Age factor (0.0 - 0.15)
    age = data.get('age', 45)
    if age > 65:
        risk_score += 0.15
    elif age > 50:
        risk_score += 0.08
    elif age > 40:
        risk_score += 0.03
    
    # Serum Creatinine - most important factor (0.0 - 0.40)
    sc = data.get('sc', 1.0)
    if sc > 3.0:
        risk_score += 0.40
    elif sc > 2.5:
        risk_score += 0.35
    elif sc > 2.0:
        risk_score += 0.28
    elif sc > 1.5:
        risk_score += 0.18
    elif sc > 1.2:
        risk_score += 0.08
    
    # Blood pressure (0.0 - 0.12)  
    bp = data.get('bp', 120)
    if bp > 160:
        risk_score += 0.12
    elif bp > 140:
        risk_score += 0.08
    elif bp > 130:
        risk_score += 0.04
    
    # Hemoglobin (0.0 - 0.15)
    hemo = data.get('hemo', 12)
    if hemo < 9:
        risk_score += 0.15
    elif hemo < 11:
        risk_score += 0.10
    elif hemo < 12:
        risk_score += 0.05
    
    # Categorical conditions
    if data.get('htn') == 'yes':
        risk_score += 0.10
    if data.get('dm') == 'yes':
        risk_score += 0.12
    if data.get('ane') == 'yes':
        risk_score += 0.08
    if data.get('pe') == 'yes':
        risk_score += 0.06
    
    # Blood Urea
    bu = data.get('bu', 35)
    if bu > 50:
        risk_score += 0.08
    elif bu > 40:
        risk_score += 0.04
    
    # Cap risk score at 0.95
    risk_score = min(risk_score, 0.95)
    
    risk_level_text, risk_color = assess_risk(risk_score)
    
    return {
        "prediction": 1 if risk_score > 0.5 else 0,
        "probability": float(risk_score),
        "risk_level": risk_level_text,
        "risk_color": risk_color,
        "no_ckd_probability": float(1 - risk_score),
        "model_used": "clinical_estimation",
        "success": True
    }

def main():
    try:
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            input_data = json.load(sys.stdin)
        
        # Use real trained models first
        result = predict_with_real_models(input_data)
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": f"Prediction failed: {str(e)}",
            "prediction": 0,
            "probability": 0.0,
            "risk_level": "Unknown",
            "risk_color": "secondary",
            "success": False
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()