#!/usr/bin/env python3
"""
Exact model prediction using your trained models from Flask app.py
"""

import sys
import json
import joblib
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# Feature names exactly as in your Flask app.py
final_features = [
    'age', 'bp', 'al', 'su', 'rbc', 'pc', 'bgr', 'bu', 'sc',
    'sod', 'pot', 'hemo', 'wbcc', 'htn', 'dm', 'appet', 'pe',
    'ane', 'bun_sc_ratio', 'high_creatinine', 'hemo_bu'
]

def preprocess_input(df):
    """Exact preprocessing from your Flask app.py"""
    mapper = {"normal": 0, "abnormal": 1, "present": 1, "notpresent": 0,
              "yes": 1, "no": 0, "good": 0, "poor": 1}
    categorical_cols = ['rbc', 'pc', 'ba', 'htn', 'dm', 'appet', 'pe', 'ane']

    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].map(mapper).fillna(0)

    numeric_cols = ['age', 'bp', 'al', 'su', 'bgr', 'bu', 'sc',
                    'sod', 'pot', 'hemo', 'wbcc', 'rbcc']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    df["bun_sc_ratio"] = np.where(df["sc"] == 0, 0, df["bu"] / df["sc"])
    df["high_creatinine"] = (df["sc"] > 1.2).astype(int)
    df["hemo_bu"] = df["hemo"] * df["bu"]

    for col in final_features:
        if col not in df.columns:
            df[col] = 0

    return df[final_features]

def assess_risk(probability):
    """Risk assessment from your Flask app.py"""
    if probability < 0.3:
        return ("Low Risk", "success")
    elif probability < 0.6:
        return ("Moderate Risk", "warning")
    elif probability < 0.85:
        return ("High Risk", "danger")
    else:
        return ("Very High Risk", "danger")

def load_models():
    """Load your trained models"""
    try:
        rf_model = joblib.load("models/rf_model_final.pkl")
        scaler = joblib.load("models/scaler_final.pkl")
        return rf_model, scaler, True
    except Exception as e:
        print(f"Model loading error: {e}", file=sys.stderr)
        return None, None, False

def predict_ckd(data):
    """Make prediction using your exact Flask app.py logic"""
    try:
        # Load models
        model, scaler, models_loaded = load_models()
        
        if not models_loaded:
            return {"error": "Models not available", "fallback": True}
        
        # Convert input to DataFrame exactly like Flask app.py
        df = pd.DataFrame([data])
        
        # Preprocess exactly like Flask app.py
        X_input_df = preprocess_input(df)
        
        # Ensure features match scaler training
        for col in scaler.feature_names_in_:
            if col not in X_input_df.columns:
                X_input_df[col] = 0
        X_input_df = X_input_df[scaler.feature_names_in_]
        
        # Scale the input
        X_scaled = scaler.transform(X_input_df)
        
        # Make prediction with Random Forest (your primary model)
        try:
            proba = model.predict_proba(X_scaled)[:, 1]
            prediction = model.predict(X_scaled)
            
            risk_level_text, risk_color = assess_risk(proba[0])
            
            return {
                "prediction": int(prediction[0]),
                "probability": float(proba[0]),
                "risk_level": risk_level_text,
                "risk_color": risk_color,
                "no_ckd_probability": float(1 - proba[0]),
                "model_used": "random_forest",
                "success": True
            }
            
        except Exception as pred_error:
            # Try logistic model as fallback
            try:
                logistic_model = joblib.load("models/logistic_model_final.pkl")
                proba = logistic_model.predict_proba(X_scaled)[:, 1]
                prediction = logistic_model.predict(X_scaled)
                
                risk_level_text, risk_color = assess_risk(proba[0])
                
                return {
                    "prediction": int(prediction[0]),
                    "probability": float(proba[0]),
                    "risk_level": risk_level_text,
                    "risk_color": risk_color,
                    "no_ckd_probability": float(1 - proba[0]),
                    "model_used": "logistic_regression",
                    "success": True
                }
            except Exception as fallback_error:
                return {
                    "error": f"Both models failed: RF={pred_error}, LR={fallback_error}",
                    "fallback": True
                }
        
    except Exception as e:
        return {
            "error": f"Prediction failed: {str(e)}",
            "fallback": True
        }

def main():
    try:
        # Read input data
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            input_data = json.load(sys.stdin)
        
        # Make prediction
        result = predict_ckd(input_data)
        
        # Output result
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": f"Script execution failed: {str(e)}",
            "fallback": True
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()