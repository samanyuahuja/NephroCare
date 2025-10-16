# NephroCare - Advanced CKD Prediction Platform

## Overview

NephroCare is an intelligent Chronic Kidney Disease (CKD) screening and healthcare platform designed to make kidney health assessment accessible to everyone. The application uses machine learning models (Logistic Regression and Random Forest) trained on clinical data to predict CKD risk with 95% accuracy. It provides comprehensive features including risk assessment, explainable AI visualizations (SHAP, LIME, PDP), personalized diet recommendations, symptom checking, and an AI-powered medical chatbot.

Developed by Samanyu Ahuja, a high school student from India, this platform addresses the critical need for early CKD detection, particularly important as the disease often presents symptoms late in its progression.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **State Management**: TanStack React Query for server state, local React state for UI
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom medical theme (blue/white color palette)
- **Build Tool**: Vite for fast development and optimized production builds

**Design Decisions**:
- Chose Radix UI for accessible, unstyled components that can be themed
- Wouter selected over React Router for smaller bundle size and simpler API
- React Query provides automatic caching, background refetching, and optimistic updates
- Zod schemas shared between client and server ensure type safety across the stack

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled to ESM
- **API Design**: RESTful endpoints with JSON responses
- **ML Integration**: Python scripts invoked via child processes for predictions
- **Session Storage**: Browser localStorage for user assessment tracking (privacy-focused)

**Design Decisions**:
- Express chosen for its maturity and middleware ecosystem
- TypeScript provides type safety and better developer experience
- Python subprocess approach allows leveraging existing ML models (scikit-learn, joblib)
- Client-side storage avoids server-side user tracking, enhancing privacy

### Database & ORM
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection Pooling**: Neon serverless with WebSocket support

**Tables**:
- `users`: Basic user authentication (currently minimal usage)
- `ckd_assessments`: Stores patient medical data and ML prediction results
- `diet_plans`: Generated dietary recommendations linked to assessments
- `chat_messages`: Chatbot conversation history

**Design Decisions**:
- Drizzle ORM chosen for excellent TypeScript support and minimal runtime overhead
- Neon serverless PostgreSQL provides auto-scaling and serverless compatibility
- Schema designed to support both anonymous and authenticated users
- Assessment IDs stored client-side for privacy while allowing result retrieval

### Machine Learning Pipeline
- **Models**: Pre-trained Logistic Regression and Random Forest classifiers
- **Features**: 21 clinical parameters including age, blood pressure, lab values, and derived features
- **Explainability**: SHAP values, LIME explanations, and Partial Dependence Plots
- **Prediction Flow**: 
  1. Frontend collects medical data via validated form
  2. Backend receives data and spawns Python process
  3. Python script preprocesses data and runs prediction
  4. Results include risk score, risk level, and feature importances
  5. Backend stores results and returns to frontend

**Design Decisions**:
- Python ML models kept separate to leverage scikit-learn ecosystem
- Feature engineering includes derived metrics (BUN/SC ratio, creatinine flags)
- Multiple explainability methods provide comprehensive transparency
- Fallback to rule-based prediction if ML models unavailable

### AI Chatbot Integration
- **Provider**: OpenAI GPT-4o API
- **Context**: Medical domain specialization for nephrology
- **Fallback**: Rule-based responses when API unavailable
- **Storage**: Conversations saved in PostgreSQL and localStorage

**Design Decisions**:
- GPT-4o selected for advanced medical understanding and multilingual support
- System prompts tuned for kidney disease expertise
- Graceful degradation to pattern-matched responses ensures availability
- Dual storage (DB + localStorage) provides persistence and offline access

### Internationalization
- **Languages**: English and Hindi
- **Implementation**: Custom lightweight i18n hook
- **Storage**: Language preference in localStorage
- **Coverage**: Full UI translation including medical terminology

**Design Decisions**:
- Custom solution chosen over i18next for simplicity and bundle size
- Hindi support critical for Indian user base accessibility
- Medical terms carefully translated for accuracy

## External Dependencies

### Third-Party Services
- **OpenAI API**: GPT-4o for intelligent chatbot responses
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support

### Key NPM Packages
- **UI Framework**: React, React DOM, Wouter
- **Forms & Validation**: React Hook Form, Zod, @hookform/resolvers
- **Data Fetching**: TanStack React Query
- **UI Components**: Radix UI component primitives (20+ components)
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **PDF Generation**: jsPDF, html2canvas
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Backend**: Express, tsx (TypeScript execution)

### Python Dependencies (ML/AI)
- **ML Framework**: scikit-learn for model training and prediction
- **Model Persistence**: joblib for serializing trained models
- **Data Processing**: pandas, numpy
- **Explainability**: SHAP, LIME
- **Warnings**: Standard library warnings module for cleanup

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Strict mode enabled with path aliases
- **Linting**: ESLint configuration
- **CSS**: PostCSS with Tailwind and Autoprefixer
- **Database Migrations**: Drizzle Kit

### Browser APIs & Features
- **Storage**: localStorage for preferences and assessment history
- **Events**: Custom events for cross-component state updates
- **Canvas**: html2canvas for PDF report generation
- **Fetch**: Native fetch API for all HTTP requests

**Integration Notes**:
- Drizzle ORM configured to work with Neon's serverless PostgreSQL
- Python ML models loaded from `models/` directory via joblib
- OpenAI API key managed via environment variables
- Vite configured with custom aliases for clean imports (@, @shared, @assets)