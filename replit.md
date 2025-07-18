# NephroCare - CKD Prediction Application

## Overview

NephroCare is a professional, responsive Chronic Kidney Disease (CKD) prediction website that provides early insights into kidney health. The application features advanced diagnostics with trained machine learning models, explainable results with SHAP/LIME analysis, and a smart diet planner for personalized care recommendations.

## Recent Changes (January 17-18, 2025)

- Integrated user's Flask app.py containing trained ML models (logistic regression and random forest)
- Successfully connected trained models with Node.js backend using Python model predictor
- Removed all "AI" branding - changed "NephroCare AI" to "NephroCare" throughout the application
- Updated chatbot name from "NephroCare AI Assistant" to "NephroBot" specifically
- Implemented NephroBot responses based on Flask app.py chatbot logic with 100+ medical responses
- Added comprehensive symptom checker page with 13 CKD-related symptoms and risk assessment
- Created Hindi/English language toggle component for wider accessibility
- Updated navigation to include Symptom Checker, Diet Plan, and About sections
- Removed all emoji usage throughout the application as requested
- Enhanced About page with developer information and app description from user's content
- Implemented fallback system for ML model compatibility issues
- Fixed form validation NaN warnings by adding proper field value checks
- Enhanced symptom checker with medical severity scoring and detailed risk assessment
- Added comprehensive medical value validation with proper ranges for all lab values
- Implemented real-time warnings for abnormal blood pressure, glucose, creatinine, and electrolytes
- Fixed percentage display in Results page to show accurate ML model predictions
- Added detailed graph reading instructions for SHAP, PDP, and LIME explanations
- Created comprehensive About CKD page with medical information, stages, symptoms, and prevention
- Fixed language toggle functionality with proper state management and localStorage persistence
- Added Hindi translations for key sections and working language switching system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom medical-themed color scheme (soft blue/white)
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Middleware**: Express middleware for request logging and error handling
- **Development**: Hot module replacement via Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless connection (@neondatabase/serverless)
- **Fallback**: In-memory storage implementation for development/testing
- **Migrations**: Drizzle Kit for schema management

### Database Schema
The application uses the following main entities:
- **Users**: Basic user authentication (id, username, password)
- **CKD Assessments**: Comprehensive medical parameters including patient info, lab results, conditions, and AI prediction results
- **Diet Plans**: Personalized dietary recommendations based on assessment results
- **Chat Messages**: AI assistant conversation history

## Key Components

### Pages
1. **Home**: Landing page with hero section and feature overview
2. **Diagnosis**: Comprehensive CKD assessment form with 20+ medical parameters
3. **Results**: AI prediction results with SHAP/LIME explanations and visualizations
4. **Diet Plan**: Personalized dietary recommendations with downloadable plans
5. **Chatbot**: AI assistant for medical questions and guidance
6. **About CKD**: Educational content about chronic kidney disease

### AI Features
- **Risk Prediction**: Mock AI algorithm calculating CKD risk scores
- **SHAP Analysis**: Feature importance visualization for model explainability
- **LIME Explanations**: Local interpretable model-agnostic explanations
- **Partial Dependence Plots**: Visual representation of feature impact

### UI Components
- **Charts**: Custom SHAP plots, PDP plots, and LIME explanations
- **Forms**: Comprehensive assessment form with validation
- **Medical UI**: Professional medical-themed design with soft blue color scheme
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Data Flow

1. **Assessment Flow**: User completes diagnosis form → Data validated → AI prediction calculated → Results stored → Visualizations generated
2. **Diet Plan Flow**: Assessment results → Dietary preferences → AI-generated meal plans → Downloadable recommendations
3. **Chat Flow**: User questions → AI assistant responses → Conversation history stored

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React Query, React Hook Form, Wouter
- **UI Libraries**: Radix UI primitives, shadcn/ui components, Lucide React icons
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Validation**: Zod for schema validation and type safety
- **Styling**: Tailwind CSS, class-variance-authority, clsx

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **PostCSS**: Tailwind CSS processing
- **Development**: Hot reload, runtime error overlay

## Authentication and Authorization

Currently implements basic user schema with username/password authentication. The application is prepared for user authentication but focuses primarily on the assessment and recommendation features.

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles Node.js server to `dist/index.js`
- Database: Drizzle migrations handle schema deployment

### Environment Configuration
- **Development**: Vite dev server with Express API integration
- **Production**: Standalone Express server serving static assets
- **Database**: PostgreSQL connection via environment variables

### Scripts
- `dev`: Development server with hot reload
- `build`: Production build process
- `start`: Production server startup
- `db:push`: Database schema deployment

The application follows modern web development practices with type safety, responsive design, and a professional medical aesthetic suitable for healthcare applications.