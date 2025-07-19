import { Link } from "wouter";
import { Brain, ChartLine, Utensils, Stethoscope, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage, t } from "@/hooks/useLanguage";

export default function Home() {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-16 shadow-2xl border border-blue-100">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Title with Enhanced Typography */}
          <div className="mb-10">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 mb-6 tracking-tight leading-none">
              {t("NephroCare", "नेफ्रोकेयर")}
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto rounded-full shadow-lg"></div>
          </div>
          
          {/* Enhanced Subheader */}
          <div className="mb-12">
            <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              {t(
                "Advanced CKD Prediction & Healthcare Guidance",
                "उन्नत सीकेडी भविष्यवाणी और स्वास्थ्य देखभाल मार्गदर्शन"
              )}
            </p>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              {t(
                "Powered by machine learning algorithms for early detection and personalized recommendations",
                "प्रारंभिक पहचान और व्यक्तिगत सिफारिशों के लिए मशीन लर्निंग एल्गोरिदम द्वारा संचालित"
              )}
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/diagnosis">
              <Button className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-12 py-6 text-xl font-black rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 border-0 min-w-[300px] animate-pulse hover:animate-none">
                <div className="absolute inset-0 bg-white opacity-20 rounded-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <div className="relative flex items-center justify-center">
                  <Activity className="mr-4 h-7 w-7 group-hover:rotate-180 transition-transform duration-500" />
                  {t("START ASSESSMENT NOW", "अभी मूल्यांकन शुरू करें")}
                </div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400 to-blue-600 opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              </Button>
            </Link>
            
            <Link href="/symptom-checker">
              <Button variant="outline" className="group px-10 py-5 text-lg font-bold rounded-2xl border-3 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl min-w-[240px] bg-white/80 backdrop-blur-sm">
                <Stethoscope className="mr-3 h-6 w-6 group-hover:bounce transition-all duration-300" />
                {t("Check Symptoms", "लक्षण जांचें")}
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              {t("Machine Learning Powered", "मशीन लर्निंग संचालित")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              {t("Clinically Validated", "चिकित्सकीय रूप से सत्यापित")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              {t("Personalized Results", "व्यक्तिगत परिणाम")}
            </div>
          </div>
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
