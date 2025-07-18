#!/usr/bin/env python3
"""
Flask API for CKD Prediction using trained models
Integrates with the Node.js backend for NephroCare
"""

from flask import Flask, request, jsonify, render_template_string
import joblib
import pandas as pd
import numpy as np
import os
import sys
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

# Load models and scaler
models_loaded = False
rf_model = None
logistic_model = None
scaler = None
X_train_res = None

try:
    print("🔄 Attempting to load trained models...")
    
    # Try logistic model first (usually more compatible)
    try:
        logistic_model = joblib.load("models/logistic_model_final.pkl")
        print("✅ Logistic model loaded")
    except Exception as e:
        print(f"⚠️ Logistic model failed: {e}")
    
    # Try random forest model
    try:
        rf_model = joblib.load("models/rf_model_final.pkl")
        print("✅ Random Forest model loaded")
    except Exception as e:
        print(f"⚠️ Random Forest model failed: {e}")
    
    # Try scaler
    try:
        scaler = joblib.load("models/scaler_final.pkl")
        print("✅ Scaler loaded")
    except Exception as e:
        print(f"⚠️ Scaler failed: {e}")
    
    # Try training data
    try:
        X_train_res = joblib.load("models/X_train_res_scaled_final.pkl")
        print("✅ Training data loaded")
    except Exception as e:
        print(f"⚠️ Training data failed: {e}")
    
    if (rf_model or logistic_model) and scaler:
        models_loaded = True
        print("✅ Models loaded successfully!")
    else:
        print("❌ Critical models missing")
        
except Exception as e:
    print(f"❌ Error loading models: {e}")

# Fallback prediction function based on clinical rules
def clinical_prediction(data):
    """Fallback prediction using clinical rules when ML models fail"""
    risk_score = 0.0
    
    # Age factor
    age = float(data.get('age', 0))
    if age > 60:
        risk_score += 0.15
    elif age > 45:
        risk_score += 0.08
    
    # Serum Creatinine (sc) - major factor
    sc = float(data.get('sc', 0))
    if sc > 1.5:
        risk_score += 0.42
    elif sc > 1.2:
        risk_score += 0.25
    
    # Hemoglobin (hemo) - anemia indicator  
    hemo = float(data.get('hemo', 0))
    if hemo < 10:
        risk_score += 0.28
    elif hemo < 12:
        risk_score += 0.15
    
    # Blood Urea (bu)
    bu = float(data.get('bu', 0))
    if bu > 40:
        risk_score += 0.20
    elif bu > 25:
        risk_score += 0.10
    
    # Blood Pressure (bp)
    bp = float(data.get('bp', 0))
    if bp > 140:
        risk_score += 0.12
    
    # Diabetes and Hypertension
    if data.get('dm') == 'yes' or data.get('dm') == '1':
        risk_score += 0.15
    if data.get('htn') == 'yes' or data.get('htn') == '1':
        risk_score += 0.10
    
    # Proteinuria (al)
    al = float(data.get('al', 0))
    if al > 2:
        risk_score += 0.18
    
    # Other symptoms
    if data.get('pe') == 'yes':
        risk_score += 0.08
    if data.get('ane') == 'yes':
        risk_score += 0.06
    if data.get('appet') == 'poor':
        risk_score += 0.05
    
    # Cap at 95%
    risk_score = min(risk_score, 0.95)
    
    return risk_score, 1 if risk_score > 0.5 else 0

# Feature names as per your Flask app.py
final_features = [
    'age', 'bp', 'al', 'su', 'rbc', 'pc', 'bgr', 'bu', 'sc',
    'sod', 'pot', 'hemo', 'wbcc', 'htn', 'dm', 'appet', 'pe',
    'ane', 'bun_sc_ratio', 'high_creatinine', 'hemo_bu'
]

def preprocess_input(df):
    """Preprocess input data as per your Flask app.py"""
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

    # Create derived features
    df["bun_sc_ratio"] = np.where(df["sc"] == 0, 0, df["bu"] / df["sc"])
    df["high_creatinine"] = (df["sc"] > 1.2).astype(int)
    df["hemo_bu"] = df["hemo"] * df["bu"]

    # Ensure all final features are present
    for col in final_features:
        if col not in df.columns:
            df[col] = 0

    return df[final_features]

def assess_risk(probability):
    """Risk assessment function from your Flask app.py"""
    if probability < 0.3:
        return ("Low Risk", "success")
    elif probability < 0.6:
        return ("Moderate Risk", "warning")
    elif probability < 0.85:
        return ("High Risk", "danger")
    else:
        return ("Very High Risk", "danger")

@app.route('/api/predict', methods=['POST'])
def predict():
    """API endpoint for CKD prediction"""
    try:
        if not rf_model or not scaler:
            return jsonify({"error": "Models not loaded properly"}), 500
            
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        print(f"📥 Received data: {data}")
        
        # Convert to DataFrame
        df = pd.DataFrame([data])
        print(f"📊 DataFrame created with columns: {df.columns.tolist()}")
        
        # Preprocess
        X_input_df = preprocess_input(df)
        print(f"🔧 Preprocessed features: {X_input_df.columns.tolist()}")
        print(f"📈 Feature values: {X_input_df.iloc[0].tolist()}")
        
        # Ensure feature alignment with scaler
        missing_features = set(scaler.feature_names_in_) - set(X_input_df.columns)
        if missing_features:
            print(f"⚠️ Missing features: {missing_features}")
            for feat in missing_features:
                X_input_df[feat] = 0
        
        # Reorder to match scaler training order
        X_input_df = X_input_df[scaler.feature_names_in_]
        print(f"✅ Final feature order: {X_input_df.columns.tolist()}")
        
        # Scale the input
        X_scaled = scaler.transform(X_input_df)
        print(f"🎯 Scaled input shape: {X_scaled.shape}")
        
        # Make prediction with available models
        proba = None
        prediction = None
        
        # Try Random Forest first
        if rf_model:
            try:
                proba = rf_model.predict_proba(X_scaled)[:, 1]
                prediction = rf_model.predict(X_scaled)
                print("🌲 Used Random Forest model")
            except Exception as e:
                print(f"❌ RF prediction failed: {e}")
        
        # Fallback to Logistic Regression
        if (proba is None) and logistic_model:
            try:
                proba = logistic_model.predict_proba(X_scaled)[:, 1]
                prediction = logistic_model.predict(X_scaled)
                print("📊 Used Logistic Regression model")
            except Exception as e:
                print(f"❌ Logistic prediction failed: {e}")
        
        # Final fallback to clinical rules
        if proba is None:
            print("🏥 Using clinical rule-based prediction")
            clinical_prob, clinical_pred = clinical_prediction(data)
            proba = [clinical_prob]
            prediction = [clinical_pred]
        
        risk_level_text, risk_color = assess_risk(proba[0])
        
        result = {
            "prediction": int(prediction[0]),
            "probability": float(proba[0]),
            "risk_level": risk_level_text,
            "risk_color": risk_color,
            "no_ckd_probability": float(1 - proba[0])
        }
        
        print(f"🎯 Prediction result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """NephroBot chatbot endpoint with your responses"""
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({"reply": "Please enter a message."})
        
        msg = data['message'].lower()
        reply = ""

        if not msg:
            reply = "Please enter a message."
        elif "what is ckd" in msg or "chronic kidney disease" in msg:
            reply = "Chronic Kidney Disease (CKD) is a condition where your kidneys lose function over time. It's usually caused by diabetes or high blood pressure."
        elif "symptoms" in msg:
            reply = "Common CKD symptoms include fatigue, swelling in legs, nausea, high blood pressure, and frequent urination."
        elif "treatment" in msg:
            reply = "CKD treatment depends on the stage. It usually includes managing blood pressure, blood sugar, and avoiding further kidney damage. In severe cases, dialysis or transplant may be needed."
        elif "diet" in msg:
            reply = "A CKD diet includes low-sodium, low-protein foods, avoiding processed items, and drinking enough water. Consult a nephrologist for a custom plan."
        elif "is ckd curable" in msg:
            reply = "CKD isn't curable but it can be managed effectively with medications, lifestyle changes, and regular monitoring."
        elif "hi" in msg or "hello" in msg or "hey" in msg:
            reply = "Hello! I'm NephroBot. Ask me anything about CKD (Chronic Kidney Disease)."
        elif "high creatinine" in msg:
            reply = "High creatinine can indicate poor kidney function. You should consult a nephrologist for further evaluation."
        elif "gfr level" in msg:
            reply = "GFR (Glomerular Filtration Rate) is a key indicator of kidney function. A GFR below 60 may suggest CKD."
        elif "protein in urine" in msg:
            reply = "Protein in urine (proteinuria) may indicate kidney damage. It should be investigated further."
        elif "diet for ckd" in msg:
            reply = "CKD diet includes low sodium, controlled protein, and limited potassium and phosphorus depending on stage. Always consult a renal dietitian."
        elif "what to eat in ckd" in msg:
            reply = "Safe foods include white rice, apples, cabbage, cauliflower, and lean protein (based on your stage and labs). Avoid salty, processed, and high-phosphorus foods."
        elif "can i eat bananas" in msg:
            reply = "Bananas are high in potassium and may need to be limited in later CKD stages. Always check with your doctor."
        elif "how to treat ckd" in msg:
            reply = "CKD treatment includes blood pressure control, diabetes management, dietary changes, and medications to protect kidney function."
        elif "medicines for ckd" in msg:
            reply = "Common medications include ACE inhibitors, ARBs, phosphate binders, and diuretics — prescribed based on your condition."
        elif "dialysis" in msg:
            reply = "Dialysis is used in end-stage CKD to remove waste from the blood when kidneys stop working effectively."
        elif "ckd chatbot" in msg:
            reply = "You're chatting with me now! I'm NephroBot, designed to answer your questions about CKD."
        elif "who made you" in msg:
            reply = "I was created to assist users with CKD-related queries using rule-based responses."
        else:
            reply = "Sorry, I didn't understand that. Try asking about CKD symptoms, treatment, diet, risk factors, or prevention."

        return jsonify({"reply": reply})
        
    except Exception as e:
        return jsonify({"reply": "I'm having trouble processing your message. Please try again."})

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": rf_model is not None and scaler is not None,
        "version": "1.0.0"
    })

if __name__ == '__main__':
    print("🏥 Starting NephroCare Flask API...")
    print(f"📂 Working directory: {os.getcwd()}")
    print(f"🧠 Models loaded: {rf_model is not None and scaler is not None}")
    
    # Start Flask app
    app.run(host='0.0.0.0', port=8080, debug=False)