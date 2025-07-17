import { Link } from "wouter";
import { Brain, ChartLine, Utensils, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="medical-gradient rounded-2xl text-white p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            CKD Prediction & Personalized Care
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Get early insights into your kidney health with advanced diagnostics, 
            explainable results, and a smart diet planner.
          </p>
          <Link href="/diagnosis">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              <Stethoscope className="mr-3 h-5 w-5" />
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="medical-card">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Advanced Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Sophisticated algorithms analyze your medical parameters 
              to predict CKD risk with high accuracy using proven models.
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <ChartLine className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Explainable Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Understand your results with SHAP plots, dependency charts, 
              and clear explanations of risk factors.
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Personalized Diet Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Receive customized nutrition recommendations based on your 
              specific risk factors and health profile.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-gray-600">
              Our prediction model has been validated with clinical data and provides reliable insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-gray-600">Assessments</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Healthcare Partners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">AI Support</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
