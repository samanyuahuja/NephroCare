import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, AlertTriangle, Shield, User, Code, Globe } from "lucide-react";

export default function AboutCKD() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">About NephroCare</h1>
        <p className="text-muted-foreground">
          Intelligent CKD screening and awareness platform
        </p>
      </div>

      {/* About This App Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-3 h-5 w-5 text-red-500" />
            About This App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            NephroCare is an intelligent Chronic Kidney Disease (CKD) screening and awareness platform 
            built with compassion, purpose, and a deep sense of social responsibility. This platform helps 
            users assess their kidney health using clinical lab values, symptoms, and medical history — 
            delivering personalized insights, diet recommendations, and risk assessments in just a few clicks.
          </p>
          
          <p className="text-muted-foreground">
            The app was developed by Samanyu Ahuja, a high school student from India with a passion for 
            healthcare, technology, and social impact. With a strong academic foundation in computer science 
            and biology, Samanyu created this platform to bridge the gap between early-stage kidney health 
            awareness and accessible digital tools, especially in regions where diagnostic resources are limited.
          </p>

          <p className="text-muted-foreground">
            Early detection of CKD can significantly improve treatment outcomes and delay disease progression. 
            Yet, many individuals remain unaware of the warning signs until it's too late. NephroCare aims to 
            change that by offering a user-friendly interface where anyone can input values like blood pressure, 
            serum creatinine, albumin levels, and more — and get an instant risk score, feature explanations, 
            and dynamic diet plans tailored to their unique needs.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-3 h-5 w-5 text-blue-500" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Smart CKD prediction using 20+ medical indicators</h4>
              <h4 className="font-semibold">Risk level badge (Low / Moderate / High)</h4>
              <h4 className="font-semibold">Generated diet plan with veg/non-veg toggle and PDF download</h4>
              <h4 className="font-semibold">NephroBot chatbot for questions and report explanations</h4>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Interactive symptom checker for fast self-screening</h4>
              <h4 className="font-semibold">Visual explanations (SHAP, PDP, LIME) for transparency</h4>
              <h4 className="font-semibold">Hindi ↔ English language toggle for wider accessibility</h4>
              <h4 className="font-semibold">Mobile-ready, responsive design with session history</h4>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-3 h-5 w-5 text-green-500" />
            About the Developer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              This app is not meant to replace a doctor but to educate, empower, and guide users in 
              understanding their kidney health better — especially in the early stages where intervention 
              can make a huge difference.
            </p>
            
            <p className="text-muted-foreground mt-4">
              As a student, Samanyu believes in the power of merging healthcare technology for meaningful change. 
              Whether you're managing an existing kidney condition, monitoring lab values, or just staying informed, 
              NephroCare is here to support your journey.
            </p>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="font-semibold">Samanyu Ahuja</p>
              <p className="text-sm text-muted-foreground">Student | Developer | Kidney Health Advocate</p>
              <div className="flex items-center justify-center mt-2">
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-sm">India</span>
              </div>
            </div>

            <p className="text-muted-foreground mt-4">
              Thank you for using this app. We hope it encourages you to take your health into your own hands — 
              and never ignore the signs your body gives you.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Understanding CKD Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-3 h-5 w-5 text-blue-500" />
            Understanding Chronic Kidney Disease
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Chronic Kidney Disease (CKD) is a long-term condition where the kidneys gradually lose their 
            ability to filter waste and excess fluid from the blood. Early detection is crucial for 
            preventing progression and managing symptoms effectively.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mb-2" />
              <h4 className="font-semibold text-red-800">Warning Signs</h4>
              <p className="text-sm text-red-700">Fatigue, swelling, changes in urination, high blood pressure</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mb-2" />
              <h4 className="font-semibold text-green-800">Prevention</h4>
              <p className="text-sm text-green-700">Regular checkups, healthy diet, blood pressure control, diabetes management</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}