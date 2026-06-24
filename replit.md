# NephroCare - CKD Prediction Platform

## Overview

NephroCare is an intelligent Chronic Kidney Disease (CKD) screening and awareness platform that helps users assess their kidney health using clinical lab values, symptoms, and medical history. The application leverages machine learning algorithms (Logistic Regression and Random Forest) trained on clinical data to provide risk predictions with 95% accuracy. It offers personalized diet recommendations, explainable AI visualizations (SHAP, LIME, PDP), and an AI-powered chatbot for medical guidance.

The platform was developed with a focus on accessibility, supporting both English and Hindi languages, and featuring a mobile-responsive design. It emphasizes early detection of CKD, which can significantly improve treatment outcomes and delay disease progression.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod for form validation and type-safe schemas

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundation
- Shadcn/ui design system built on Radix with Tailwind CSS
- Custom medical-themed color palette with CSS variables for theming
- Responsive design with mobile-first approach

**State Management Strategy**
- Local state with React hooks for component-level state
- TanStack Query for server state and caching
- localStorage for persisting user assessment IDs and chat history
- Custom language toggle hook for i18n (English/Hindi)

**Key Design Patterns**
- Component composition with props drilling minimized through context
- Custom hooks for cross-cutting concerns (useLanguage, useIsMobile)
- Query invalidation strategy for real-time data updates
- Optimistic updates for better UX

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js server
- TypeScript for type safety across the stack
- ESM module system for modern JavaScript features

**API Design**
- RESTful endpoints for CRUD operations
- JSON request/response format
- Health check endpoint for monitoring
- Structured error handling with appropriate HTTP status codes

**Machine Learning Integration**
- Python scripts for CKD risk prediction
- Child process spawning to execute Python ML models from Node.js
- Fallback clinical prediction logic when ML models unavailable
- SHAP, LIME, and PDP visualization data generation

**Data Flow**
1. Frontend collects medical data via forms
2. Express API validates and transforms data
3. Python predictor processes features and returns risk scores
4. Results stored in database with SHAP features
5. Frontend renders visualizations and recommendations

### Data Storage Solutions

**Database**
- PostgreSQL as primary relational database
- Neon serverless PostgreSQL for cloud deployment
- Drizzle ORM for type-safe database queries
- Connection pooling with @neondatabase/serverless

**Schema Design**
- `users` table for authentication (currently minimal)
- `ckd_assessments` table storing patient data and predictions
- `diet_plans` table with assessment relationships
- `chat_messages` table for chatbot conversation history

**Data Models**
- Zod schemas for validation at API boundaries
- Drizzle schema definitions for database types
- Type inference from schemas shared between client and server
- JSON serialization for complex data (SHAP features)

**Local Storage Strategy**
- Assessment IDs stored in browser localStorage
- User language preference persistence
- Chat message history cached locally
- Custom events for cross-tab synchronization

### External Dependencies

**AI & Machine Learning**
- OpenAI GPT-4o API for intelligent chatbot responses
- Python scikit-learn for ML model execution (Logistic Regression, Random Forest)
- SHAP library for explainable AI feature importance
- LIME for local interpretable model explanations
- Joblib for ML model serialization

**PDF Generation**
- jsPDF for client-side PDF creation
- html2canvas for converting DOM elements to canvas
- Custom PDF generator with medical report formatting

**Development Tools**
- tsx for TypeScript execution in development
- esbuild for production builds
- Drizzle Kit for database migrations
- Tailwind CSS for utility-first styling

**Third-Party UI Libraries**
- Lucide React for icon components
- Embla Carousel for interactive carousels
- CMDK for command palette functionality
- Date-fns for date formatting

**Infrastructure**
- Replit-specific plugins for development environment
- WebSocket constructor polyfill for Neon serverless
- Session management with connect-pg-simple (configured but minimal auth)

### Integration Points

**Python-Node Communication**
- Child process spawning with structured JSON I/O
- Error handling and fallback mechanisms
- Feature preprocessing aligned between systems
- Clinical rule-based predictions as backup

**API Endpoints**
- `/api/health` - Health check
- `/api/chat-direct` - AI chatbot interactions
- `/api/ckd-assessment` - CKD risk assessment submission
- `/api/ckd-assessment/:id` - Retrieve specific assessment
- `/api/ckd-assessments` - List all assessments
- `/api/diet-plan` - Generate personalized diet plans
- `/api/diet-plan/:id` - Retrieve diet plan by assessment ID

**Authentication & Authorization**
- Minimal auth implementation (user schema present but unused)
- Browser-local assessment ID tracking for privacy
- No server-side session validation in current implementation
- Privacy-first approach with local data storage

### Security Hardening (Feb 2026)

**Rate Limiting (OWASP A04:2021)**
- Global: 100 requests per 15 minutes per IP on all /api/ endpoints
- Chat: 20 requests per 15 minutes (protects expensive OpenAI calls)
- Assessment: 30 requests per 15 minutes (protects ML model calls)
- Graceful 429 responses with clear error messages
- Standard RateLimit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)

**Input Validation & Sanitization (OWASP A03:2021)**
- Zod schema-based validation on all POST endpoints with .strict() to reject unexpected fields
- HTML/script tag stripping on all user text inputs (patientName, chat messages, diet plan text)
- Length limits on all string fields (patientName: 100, messages: 2000, diet content: 5000)
- Integer URL params validated with range checks (1 to 2147483647)
- Filtered ID arrays validated as arrays of positive integers, max 100 items
- JSON body size limited to 1MB to prevent payload-based DoS

**Security Headers (OWASP A05:2021)**
- Helmet middleware for secure HTTP headers
- X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.
- CSP disabled for compatibility with inline Vite styles

**API Key Handling (OWASP A07:2021)**
- All secrets loaded from environment variables only (process.env)
- No API keys hardcoded or exposed client-side
- OpenAI key server-side only, never sent to browser