#!/usr/bin/env python3
"""Test ML prediction with sample data"""

import sys
import json
import joblib
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# Test data
test_data = {
    'age': 45, 'bp': 140, 'al': 2, 'su': 1, 'rbc': 'normal', 'pc': 'normal',
    'ba': 'notpresent', 'bgr': 145, 'bu': 35, 'sc': 1.8, 'sod': 135, 
    'pot': 4.5, 'hemo': 12, 'wbcc': 7600, 'rbcc': 5.2, 'htn': 'yes',
    'dm': 'no', 'appet': 'good', 'pe': 'no', 'ane': 'no'
}

print("Testing ML prediction with sample data...")
print("Input data:", json.dumps(test_data, indent=2))

# Load models
try:
    rf_model = joblib.load("models/rf_model_final.pkl")
    print(f"RF model loaded: {type(rf_model)}")
    
    scaler = joblib.load("models/scaler_final.pkl")
    print(f"Scaler loaded: {type(scaler)}")
    
    # Check model and scaler compatibility
    if hasattr(scaler, 'feature_names_in_'):
        print(f"Scaler trained features: {len(scaler.feature_names_in_)}")
        print("Features:", scaler.feature_names_in_[:10], "...")
    else:
        print("Warning: Scaler doesn't have feature_names_in_ attribute")
        
    # Test prediction process
    df = pd.DataFrame([test_data])
    print(f"DataFrame shape: {df.shape}")
    print("DataFrame columns:", df.columns.tolist())
    
    # Try basic preprocessing
    mapper = {"normal": 0, "abnormal": 1, "present": 1, "notpresent": 0,
              "yes": 1, "no": 0, "good": 0, "poor": 1}
    categorical_cols = ['rbc', 'pc', 'ba', 'htn', 'dm', 'appet', 'pe', 'ane']

    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].map(mapper).fillna(0)
    
    # Convert numeric columns
    numeric_cols = ['age', 'bp', 'al', 'su', 'bgr', 'bu', 'sc',
                    'sod', 'pot', 'hemo', 'wbcc', 'rbcc']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Create feature engineering
    df["bun_sc_ratio"] = np.where(df["sc"] == 0, 0, df["bu"] / df["sc"])
    df["high_creatinine"] = (df["sc"] > 1.2).astype(int)
    df["hemo_bu"] = df["hemo"] * df["bu"]
    
    print("After preprocessing:", df.iloc[0].to_dict())
    
    # Try prediction
    if hasattr(scaler, 'feature_names_in_'):
        # Ensure all required features exist
        for feature in scaler.feature_names_in_:
            if feature not in df.columns:
                df[feature] = 0
        
        # Select and order features to match scaler
        X = df[scaler.feature_names_in_]
        print(f"Final input shape: {X.shape}")
        
        # Scale features
        X_scaled = scaler.transform(X)
        print("Data scaled successfully")
        
        # Make prediction
        prediction = rf_model.predict(X_scaled)[0]
        probability = rf_model.predict_proba(X_scaled)[0, 1]
        
        print(f"Prediction: {prediction}")
        print(f"Probability: {probability:.3f}")
        
        # Risk assessment
        if probability < 0.3:
            risk_level = "Low Risk"
        elif probability < 0.6:
            risk_level = "Moderate Risk" 
        elif probability < 0.85:
            risk_level = "High Risk"
        else:
            risk_level = "Very High Risk"
            
        print(f"Risk Level: {risk_level}")
        
        result = {
            "prediction": int(prediction),
            "probability": float(probability),
            "risk_level": risk_level,
            "success": True,
            "model_used": "random_forest"
        }
        
        print("Final result:", json.dumps(result, indent=2))
        
    else:
        print("Cannot proceed - scaler missing feature names")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()