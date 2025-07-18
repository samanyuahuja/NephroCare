import { Link } from "wouter";
import { Brain, ChartLine, Utensils, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage, t } from "@/hooks/useLanguage";

export default function Home() {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="medical-gradient rounded-2xl text-white p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("CKD Prediction & Personalized Care", "सीकेडी भविष्यवाणी और व्यक्तिगत देखभाल")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            {t(
              "Get early insights into your kidney health with advanced diagnostics, explainable results, and a smart diet planner.",
              "उन्नत निदान, समझने योग्य परिणामों और स्मार्ट आहार योजनाकार के साथ अपने गुर्दे के स्वास्थ्य में प्रारंभिक अंतर्दृष्टि प्राप्त करें।"
            )}
          </p>
          <Link href="/diagnosis">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              <Stethoscope className="mr-3 h-5 w-5" />
              {t("Start Assessment", "मूल्यांकन शुरू करें")}
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
            <CardTitle className="text-xl">
              {t("Advanced Diagnosis", "उन्नत निदान")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {t(
                "Sophisticated algorithms analyze your medical parameters to predict CKD risk with high accuracy using proven models.",
                "परिष्कृत एल्गोरिदम आपके मेडिकल पैरामीटर का विश्लेषण करके सिद्ध मॉडल का उपयोग करके उच्च सटीकता के साथ सीकेडी जोखिम की भविष्यवाणी करते हैं।"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <ChartLine className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {t("Explainable Results", "समझने योग्य परिणाम")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {t(
                "Understand your results with SHAP plots, dependency charts, and clear explanations of risk factors.",
                "SHAP प्लॉट, निर्भरता चार्ट और जोखिम कारकों के स्पष्ट स्पष्टीकरण के साथ अपने परिणामों को समझें।"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {t("Smart Diet Plans", "स्मार्ट आहार योजना")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {t(
                "Get personalized nutrition recommendations based on your assessment results and dietary preferences.",
                "अपने मूल्यांकन परिणामों और आहार वरीयताओं के आधार पर व्यक्तिगत पोषण सिफारिशें प्राप्त करें।"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("Trusted by Healthcare Professionals", "स्वास्थ्य पेशेवरों द्वारा भरोसेमंद")}
            </h2>
            <p className="text-gray-600">
              {t(
                "Our prediction model has been validated with clinical data and provides reliable insights.",
                "हमारे भविष्यवाणी मॉडल को क्लिनिकल डेटा के साथ मान्यता प्राप्त है और विश्वसनीय अंतर्दृष्टि प्रदान करता है।"
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600">{t("Accuracy Rate", "सटीकता दर")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-gray-600">{t("Assessments", "मूल्यांकन")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">{t("Healthcare Partners", "स्वास्थ्य साझेदार")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">{t("AI Support", "एआई सहायता")}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
