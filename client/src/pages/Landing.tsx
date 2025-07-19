import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Heart, Shield, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent mb-6">
            NephroCare
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Advanced Chronic Kidney Disease prediction and personalized healthcare insights
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Get intelligent health assessments, personalized recommendations, and expert guidance 
            for kidney health management with our advanced medical platform.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = "/api/login"}
          >
            Sign In to Get Started
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose NephroCare?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive kidney health assessment with advanced AI-powered insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-xl">AI-Powered Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Advanced machine learning models analyze 20+ medical parameters for accurate CKD risk prediction
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Activity className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-xl">Comprehensive Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                SHAP and LIME explanations provide detailed insights into your health factors and risk contributors
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-xl">Personalized Care</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Customized diet plans and health recommendations based on your individual assessment results
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-xl">Smart Symptom Checker</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Interactive symptom analysis with medical value validation and real-time health warnings
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-xl">NephroBot Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                24/7 AI medical assistant for CKD-related questions and personalized guidance
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-xl">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your personal health data is protected with secure authentication and private user accounts
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => window.location.href = "/api/login"}
          >
            Create Your Account
          </Button>
        </div>
      </div>
    </div>
  );
}