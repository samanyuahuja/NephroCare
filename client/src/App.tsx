import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import { AccessibilityStatement, MedicalDisclaimer, PrivacyPolicy, TermsOfUse } from "@/pages/Legal";

const Diagnosis = lazy(() => import("@/pages/Diagnosis"));
const Results = lazy(() => import("@/pages/Results"));
const DietPlan = lazy(() => import("@/pages/DietPlan"));
const Chatbot = lazy(() => import("@/pages/Chatbot"));
const About = lazy(() => import("@/pages/About"));
const AboutCKD = lazy(() => import("@/pages/AboutCKD"));
const Browse = lazy(() => import("@/pages/Browse"));
const SymptomChecker = lazy(() => import("@/pages/SymptomChecker"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Layout>
      <Suspense fallback={<div className="route-loading" role="status">Loading NephroCare…</div>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/diagnosis" component={Diagnosis} />
          <Route path="/symptom-checker" component={SymptomChecker} />
          <Route path="/results/:id" component={Results} />
          <Route path="/diet-plan/:id" component={DietPlan} />
          <Route path="/chatbot" component={Chatbot} />
          <Route path="/about" component={About} />
          <Route path="/about-ckd" component={AboutCKD} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfUse} />
          <Route path="/medical-disclaimer" component={MedicalDisclaimer} />
          <Route path="/accessibility" component={AccessibilityStatement} />
          <Route path="/browse" component={Browse} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
