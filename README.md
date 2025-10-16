# NephroCare

**Advanced Chronic Kidney Disease Prediction and Healthcare Platform**

NephroCare is an intelligent CKD screening and awareness platform that helps users assess their kidney health using clinical lab values, symptoms, and medical history. Built with machine learning algorithms and explainable AI techniques, it provides personalized insights, diet recommendations, and risk assessments to support early detection and management of chronic kidney disease.

---

## Overview

Chronic Kidney Disease (CKD) affects over 850 million people worldwide and is often called a "silent killer" because symptoms appear late in the disease progression. Early detection can significantly improve treatment outcomes and delay disease progression. NephroCare bridges the gap between early-stage kidney health awareness and accessible digital tools, especially in regions where diagnostic resources are limited.

This platform was developed by Samanyu Ahuja, a high school student from India with a passion for healthcare technology and social impact, to make kidney health screening accessible to everyone.

---

## Key Features

### Advanced Diagnostics
- Smart CKD prediction using 20+ medical indicators including serum creatinine, blood urea, albumin, hemoglobin, electrolytes, and more
- Machine learning models (Logistic Regression and Random Forest) trained on clinical data with 95% accuracy
- Risk level classification (Low / Moderate / High) with detailed probability scores

### Explainable AI
- SHAP (SHapley Additive exPlanations) analysis showing which health parameters contribute most to CKD risk
- Partial Dependence Plots (PDP) visualizing how individual features affect predictions
- LIME (Local Interpretable Model-agnostic Explanations) for transparency and trust

### Personalized Healthcare
- SHAP-driven intelligent diet recommendations based on individual health parameters
- Customizable meal plans with vegetarian and non-vegetarian options
- Downloadable PDF reports with comprehensive medical data and recommendations
- Assessment history tracking for monitoring health trends over time

### Interactive Tools
- Symptom Checker: Quick self-screening with 13 CKD-related symptoms and severity scoring
- NephroBot: AI-powered chatbot using OpenAI GPT-4o for medical questions and guidance
- Medical Report Value Locator: Easy reference guide for understanding lab results

### Accessibility
- Hindi and English language toggle for wider reach across India
- Mobile-responsive design for access on any device
- Browser-local data storage ensuring complete privacy
- Professional medical-themed interface with clear visualizations

---

## Technology Stack

### Frontend
- React 18 with TypeScript for type-safe development
- Wouter for client-side routing
- TanStack Query (React Query) for efficient server state management
- Radix UI primitives with shadcn/ui components for accessible UI
- Tailwind CSS for responsive, modern styling
- Recharts for medical data visualizations

### Backend
- Node.js with Express.js server
- TypeScript for end-to-end type safety
- RESTful API architecture with JSON responses
- Python integration for ML model predictions

### Machine Learning
- Scikit-learn for model training (Logistic Regression, Random Forest)
- SHAP library for model interpretability
- LIME for local explanations
- Real clinical dataset with feature engineering

### Data & Storage
- PostgreSQL database with Neon serverless driver
- Drizzle ORM for type-safe database operations
- localStorage for privacy-focused local data persistence

### AI Integration
- OpenAI GPT-4o API for intelligent chatbot responses
- Comprehensive medical knowledge fallback system
- Context-aware responses for kidney health queries

---

## Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL 16 (or use Replit's built-in database)
- Python 3.11 for ML model execution
- OpenAI API key for chatbot functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nephrocare.git
cd nephrocare
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file with:
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Building for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
nephrocare/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages (Home, Diagnosis, Results, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions and API client
├── server/              # Backend Express server
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database interface
│   └── vite.ts          # Vite integration
├── shared/              # Shared TypeScript types and schemas
│   └── schema.ts        # Database schema and Zod validators
├── db/                  # Database configuration
│   └── schema.ts        # Drizzle ORM schema
└── fix_model_predictor.py  # ML model prediction script
```

---

## Usage Guide

### For Patients

1. **Take Assessment**: Complete the comprehensive health assessment form with lab values from your medical reports
2. **View Results**: Get instant CKD risk prediction with detailed SHAP analysis
3. **Understand Your Health**: Explore PDP and LIME explanations to understand which factors affect your kidney health
4. **Get Diet Plan**: Receive personalized dietary recommendations based on your health parameters
5. **Ask Questions**: Use NephroBot to get answers about CKD, lab values, and lifestyle modifications
6. **Download Reports**: Save PDF reports of your assessment and diet plan for doctor consultations

### For Healthcare Providers

1. **Patient Screening**: Use as a preliminary screening tool for at-risk patients
2. **Educational Resource**: Share with patients to increase awareness about CKD risk factors
3. **Treatment Support**: Use SHAP analysis to identify priority areas for intervention
4. **Monitoring Tool**: Track patient assessments over time to monitor disease progression

---

## Medical Disclaimer

**Important**: NephroCare is designed for educational and screening purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment.

- Always consult qualified healthcare professionals for medical decisions
- This tool provides risk assessment, not definitive diagnosis
- Lab values should be interpreted by medical professionals
- In case of emergency symptoms, seek immediate medical attention
- Regular medical checkups are essential for proper CKD management

The predictions and recommendations are based on machine learning models trained on clinical data and should be used as guidance for early awareness, not as medical instructions.

---

## Contributing

Contributions are welcome! If you'd like to improve NephroCare:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes with clear commit messages
4. Test thoroughly to ensure medical accuracy
5. Submit a pull request with detailed description

Please ensure all medical content is evidence-based and properly referenced.

---

## Acknowledgments

- **Medical Validation**: Dr. Davindar Chopra, Chopra Hospital, Chandigarh
- **Clinical Dataset**: UCI Machine Learning Repository - Chronic Kidney Disease Dataset
- **ML Libraries**: Scikit-learn, SHAP, LIME development teams
- **UI Components**: Radix UI and shadcn/ui for accessible design
- **Inspiration**: The millions affected by CKD worldwide and the need for early detection tools

---

## License

This project is developed for educational and social impact purposes. Feel free to use, modify, and distribute to help improve kidney health awareness.

---

## Contact & Support

**Developer**: Samanyu Ahuja  
**Email**: nephrocareai@gmail.com  
**Instagram**: [@nephrocareai](https://instagram.com/nephrocareai)  

For technical issues, feature requests, or collaboration opportunities, please reach out via email or Instagram.

---

## About the Developer

Samanyu Ahuja is a high school student from India passionate about merging healthcare and technology for meaningful change. With a strong foundation in computer science and biology, he created NephroCare to make kidney health screening accessible to everyone, especially in underserved regions.

"This app is not meant to replace a doctor but to educate, empower, and guide users in understanding their kidney health better, especially in the early stages where intervention can make a huge difference."

---

**Built with care for kidney health awareness. Take control of your health today.**
