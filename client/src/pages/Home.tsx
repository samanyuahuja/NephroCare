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
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-6 md:p-12 lg:p-16 shadow-2xl border border-blue-100">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Title with Enhanced Typography */}
          <div className="mb-10">
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 mb-6 tracking-tight leading-none">
              {t("NephroCare", "नेफ्रोकेयर")}
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto rounded-full shadow-lg"></div>
          </div>
          
          {/* Enhanced Subheader */}
          <div className="mb-12">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              {t(
                "Advanced CKD Prediction & Healthcare Guidance",
                "उन्नत सीकेडी भविष्यवाणी और स्वास्थ्य देखभाल मार्गदर्शन"
              )}
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              {t(
                "Powered by machine learning algorithms for early detection and personalized recommendations",
                "प्रारंभिक पहचान और व्यक्तिगत सिफारिशों के लिए मशीन लर्निंग एल्गोरिदम द्वारा संचालित"
              )}
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/diagnosis">
              <Button className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-lg sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0 w-full sm:w-auto sm:min-w-[280px] md:min-w-[300px]">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  <Activity className="mr-2 sm:mr-3 md:mr-4 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:rotate-12 transition-transform duration-300" />
                  {t("START ASSESSMENT NOW", "अभी मूल्यांकन शुरू करें")}
                </div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
              </Button>
            </Link>
            
            <Link href="/symptom-checker">
              <Button variant="outline" className="group px-6 sm:px-8 md:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl border-2 sm:border-3 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl w-full sm:w-auto sm:min-w-[220px] md:min-w-[240px] bg-white/80 backdrop-blur-sm">
                <Stethoscope className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:bounce transition-all duration-300" />
                {t("Check Symptoms", "लक्षण जांचें")}
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-500 font-semibold">
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
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t("Trusted by Healthcare Professionals", "स्वास्थ्य पेशेवरों द्वारा भरोसेमंद")}
            </h2>
            <p className="text-gray-600">
              {t(
                "Our prediction model has been validated with clinical data and provides reliable insights.",
                "हमारे भविष्यवाणी मॉडल को क्लिनिकल डेटा के साथ मान्यता प्राप्त है और विश्वसनीय अंतर्दृष्टि प्रदान करता है।"
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm sm:text-base text-gray-600">{t("Accuracy Rate", "सटीकता दर")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm sm:text-base text-gray-600">{t("Assessments", "मूल्यांकन")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm sm:text-base text-gray-600">{t("Hours of Development", "विकास के घंटे")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm sm:text-base text-gray-600">{t("AI Support", "एआई सहायता")}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("Frequently Asked Questions", "अक्सर पूछे जाने वाले प्रश्न")}
          </CardTitle>
          <p className="text-gray-600">
            {t("Get quick answers to common questions about CKD assessment", "CKD मूल्यांकन के बारे में सामान्य प्रश्नों के त्वरित उत्तर प्राप्त करें")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">
                {t("How accurate is the CKD prediction?", "CKD भविष्यवाणी कितनी सटीक है?")}
              </h3>
              <p className="text-gray-600">
                {t("Our ML model achieves 95% accuracy using validated clinical parameters including serum creatinine, blood urea, and other key biomarkers.", "हमारा ML मॉडल सीरम क्रिएटिनिन, ब्लड यूरिया और अन्य प्रमुख बायोमार्कर सहित मान्यता प्राप्त क्लिनिकल मापदंडों का उपयोग करके 95% सटीकता प्राप्त करता है।")}
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">
                {t("What medical reports do I need?", "मुझे किन मेडिकल रिपोर्ट्स की आवश्यकता है?")}
              </h3>
              <p className="text-gray-600">
                {t("You'll need blood tests showing creatinine, urea, glucose levels, and urine analysis for albumin and other parameters. Check our Medical Report Locator guide.", "आपको क्रिएटिनिन, यूरिया, ग्लूकोज़ के स्तर दिखाने वाले रक्त परीक्षण और एल्ब्यूमिन और अन्य मापदंडों के लिए मूत्र विश्लेषण की आवश्यकता होगी। हमारी मेडिकल रिपोर्ट लोकेटर गाइड देखें।")}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">
                {t("Can I trust this for medical decisions?", "क्या मैं चिकित्सा निर्णयों के लिए इस पर भरोसा कर सकता हूं?")}
              </h3>
              <p className="text-gray-600">
                {t("This is a screening tool only. Always consult qualified healthcare professionals for diagnosis and treatment decisions. Our predictions are meant to guide early awareness.", "यह केवल एक स्क्रीनिंग टूल है। निदान और उपचार निर्णयों के लिए हमेशा योग्य स्वास्थ्य पेशेवरों से सलाह लें। हमारी भविष्यवाणियां प्रारंभिक जागरूकता का मार्गदर्शन करने के लिए हैं।")}
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">
                {t("How does the diet plan work?", "आहार योजना कैसे काम करती है?")}
              </h3>
              <p className="text-gray-600">
                {t("Based on your risk assessment, we generate personalized dietary recommendations focusing on kidney-friendly foods, protein management, and sodium control.", "आपके जोखिम मूल्यांकन के आधार पर, हम किडनी-फ्रेंडली खाद्य पदार्थों, प्रोटीन प्रबंधन और सोडियम नियंत्रण पर ध्यान देने वाली व्यक्तिगत आहार सिफारिशें बनाते हैं।")}
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">
                {t("Is my health data secure?", "क्या मेरा स्वास्थ्य डेटा सुरक्षित है?")}
              </h3>
              <p className="text-gray-600">
                {t("Yes, all assessments are stored locally in your browser only. We don't store personal health information on our servers, ensuring complete privacy.", "हां, सभी मूल्यांकन केवल आपके ब्राउज़र में स्थानीय रूप से संग्रहीत हैं। हम अपने सर्वर पर व्यक्तिगत स्वास्थ्य जानकारी संग्रहीत नहीं करते हैं, जिससे पूर्ण गोपनीयता सुनिश्चित होती है।")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
