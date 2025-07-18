import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Diagnosis from "@/pages/Diagnosis";
import Results from "@/pages/Results";
import DietPlan from "@/pages/DietPlan";
import Chatbot from "@/pages/Chatbot";
import About from "@/pages/About";
import AboutCKD from "@/pages/AboutCKD";
import SymptomChecker from "@/pages/SymptomChecker";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/diagnosis" component={Diagnosis} />
        <Route path="/symptom-checker" component={SymptomChecker} />
        <Route path="/results/:id" component={Results} />
        <Route path="/diet-plan/:id" component={DietPlan} />
        <Route path="/chatbot" component={Chatbot} />
        <Route path="/about" component={About} />
        <Route path="/about-ckd" component={AboutCKD} />
        <Route component={NotFound} />
      </Switch>
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
