#!/usr/bin/env python3
"""
Test script to verify model integration
"""
import joblib
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# Sample test data matching your Flask app format
sample_data = {
    'age': '45',
    'bp': '120', 
    'sg': '1.02',
    'al': '0',
    'su': '0',
    'rbc': 'normal',
    'pc': 'normal',
    'pcc': 'notpresent',
    'ba': 'notpresent',
    'bgr': '88',
    'bu': '20',
    'sc': '1.1',
    'sod': '140',
    'pot': '4.0',
    'hemo': '12.5',
    'wbcc': '7500',
    'rbcc': '4.5',
    'htn': 'no',
    'dm': 'no',
    'cad': 'no',
    'appet': 'good',
    'pe': 'no',
    'ane': 'no'
}

final_features = [
    'age', 'bp', 'al', 'su', 'rbc', 'pc', 'bgr', 'bu', 'sc',
    'sod', 'pot', 'hemo', 'wbcc', 'htn', 'dm', 'appet', 'pe',
    'ane', 'bun_sc_ratio', 'high_creatinine', 'hemo_bu'
]

def preprocess_input(df):
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

def test_prediction():
    try:
        print("🔬 Testing CKD prediction models...")
        
        # Load models
        rf_model = joblib.load("models/rf_model_final.pkl")
        scaler = joblib.load("models/scaler_final.pkl")
        
        print("✅ Models loaded successfully")
        
        # Prepare test data
        df = pd.DataFrame([sample_data])
        print(f"📊 Input data: {df.iloc[0].to_dict()}")
        
        # Preprocess
        X_input_df = preprocess_input(df)
        print(f"🔧 Preprocessed features: {X_input_df.iloc[0].to_dict()}")
        
        # Scale
        X_scaled = scaler.transform(X_input_df)
        print(f"📈 Input scaled: {X_scaled.shape}")
        
        # Predict
        proba = rf_model.predict_proba(X_scaled)[:, 1]
        prediction = rf_model.predict(X_scaled)
        
        print(f"🎯 Prediction: {prediction[0]} (CKD probability: {proba[0]:.3f})")
        
        if proba[0] < 0.3:
            risk = "Low Risk"
        elif proba[0] < 0.6:
            risk = "Moderate Risk"
        elif proba[0] < 0.85:
            risk = "High Risk"
        else:
            risk = "Very High Risk"
            
        print(f"🏥 Risk Level: {risk}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_prediction()