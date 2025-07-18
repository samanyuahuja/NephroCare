import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, AlertTriangle, Shield, User, Code, Globe } from "lucide-react";
import { useLanguage, t } from "@/hooks/useLanguage";

export default function About() {
  const { language } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">
          {t("About NephroCare", "नेफ्रोकेयर के बारे में")}
        </h1>
        <p className="text-muted-foreground">
          {t("Intelligent CKD screening and awareness platform", "बुद्धिमान सीकेडी स्क्रीनिंग और जागरूकता प्लेटफॉर्म")}
        </p>
      </div>

      {/* About This App Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-3 h-5 w-5 text-red-500" />
            {t("About This App", "इस ऐप के बारे में")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t(
              "NephroCare is an intelligent Chronic Kidney Disease (CKD) screening and awareness platform built with compassion, purpose, and a deep sense of social responsibility. This platform helps users assess their kidney health using clinical lab values, symptoms, and medical history — delivering personalized insights, diet recommendations, and risk assessments in just a few clicks.",
              "नेफ्रोकेयर एक बुद्धिमान क्रोनिक किडनी रोग (सीकेडी) स्क्रीनिंग और जागरूकता प्लेटफॉर्म है जो करुणा, उद्देश्य और सामाजिक जिम्मेदारी की गहरी भावना के साथ बनाया गया है। यह प्लेटफॉर्म उपयोगकर्ताओं को क्लिनिकल लैब वैल्यू, लक्षण और मेडिकल हिस्ट्री का उपयोग करके अपने गुर्दे के स्वास्थ्य का आकलन करने में मदद करता है।"
            )}
          </p>
          
          <p className="text-muted-foreground">
            {t(
              "The app was developed by Samanyu Ahuja, a high school student from India with a passion for healthcare, technology, and social impact. With a strong academic foundation in computer science and biology, Samanyu created this platform to bridge the gap between early-stage kidney health awareness and accessible digital tools, especially in regions where diagnostic resources are limited.",
              "यह ऐप समन्यु अहुजा द्वारा विकसित किया गया था, जो भारत का एक हाई स्कूल छात्र है जिसे स्वास्थ्य सेवा, प्रौद्योगिकी और सामाजिक प्रभाव के लिए जुनून है। कंप्यूटर साइंस और बायोलॉजी में मजबूत शैक्षणिक आधार के साथ, समन्यु ने इस प्लेटफॉर्म को प्रारंभिक चरण की किडनी स्वास्थ्य जागरूकता और सुलभ डिजिटल उपकरणों के बीच अंतर को पाटने के लिए बनाया।"
            )}
          </p>

          <p className="text-muted-foreground">
            {t(
              "Early detection of CKD can significantly improve treatment outcomes and delay disease progression. Yet, many individuals remain unaware of the warning signs until it's too late. NephroCare aims to change that by offering a user-friendly interface where anyone can input values like blood pressure, serum creatinine, albumin levels, and more — and get an instant risk score, feature explanations, and dynamic diet plans tailored to their unique needs.",
              "सीकेडी का जल्दी पता लगाना उपचार के परिणामों में काफी सुधार कर सकता है और बीमारी की प्रगति में देरी कर सकता है। फिर भी, कई व्यक्ति चेतावनी के संकेतों से अवगत नहीं रहते जब तक कि बहुत देर न हो जाए। नेफ्रोकेयर का उद्देश्य एक उपयोगकर्ता-अनुकूल इंटरफेस प्रदान करके इसे बदलना है।"
            )}
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-3 h-5 w-5 text-blue-500" />
            {t("Key Features", "मुख्य विशेषताएं")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">
                {t("Smart CKD prediction using 20+ medical indicators", "20+ मेडिकल संकेतकों का उपयोग करके स्मार्ट सीकेडी भविष्यवाणी")}
              </h4>
              <h4 className="font-semibold">
                {t("Risk level badge (Low / Moderate / High)", "जोखिम स्तर बैज (कम / मध्यम / उच्च)")}
              </h4>
              <h4 className="font-semibold">
                {t("Generated diet plan with veg/non-veg toggle and PDF download", "शाकाहारी/मांसाहारी टॉगल और पीडीएफ डाउनलोड के साथ आहार योजना")}
              </h4>
              <h4 className="font-semibold">
                {t("NephroBot chatbot for questions and report explanations", "प्रश्न और रिपोर्ट स्पष्टीकरण के लिए नेफ्रोबॉट चैटबॉट")}
              </h4>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">
                {t("Interactive symptom checker for fast self-screening", "तेज़ स्व-स्क्रीनिंग के लिए इंटरैक्टिव लक्षण चेकर")}
              </h4>
              <h4 className="font-semibold">
                {t("Visual explanations (SHAP, PDP, LIME) for transparency", "पारदर्शिता के लिए दृश्य स्पष्टीकरण (SHAP, PDP, LIME)")}
              </h4>
              <h4 className="font-semibold">
                {t("Hindi ↔ English language toggle for wider accessibility", "व्यापक पहुंच के लिए हिंदी ↔ अंग्रेजी भाषा टॉगल")}
              </h4>
              <h4 className="font-semibold">
                {t("Mobile-ready, responsive design with session history", "सत्र इतिहास के साथ मोबाइल-तैयार, उत्तरदायी डिज़ाइन")}
              </h4>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-3 h-5 w-5 text-green-500" />
            {t("About the Developer", "डेवलपर के बारे में")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              {t(
                "This app is not meant to replace a doctor but to educate, empower, and guide users in understanding their kidney health better — especially in the early stages where intervention can make a huge difference.",
                "यह ऐप डॉक्टर की जगह लेने के लिए नहीं है बल्कि उपयोगकर्ताओं को अपने गुर्दे के स्वास्थ्य को बेहतर ढंग से समझने में शिक्षित, सशक्त और मार्गदर्शन करने के लिए है।"
              )}
            </p>
            
            <p className="text-muted-foreground mt-4">
              {t(
                "As a student, Samanyu believes in the power of merging healthcare technology for meaningful change. Whether you're managing an existing kidney condition, monitoring lab values, or just staying informed, NephroCare is here to support your journey.",
                "एक छात्र के रूप में, समन्यु सार्थक बदलाव के लिए स्वास्थ्य प्रौद्योगिकी को मिलाने की शक्ति में विश्वास करता है।"
              )}
            </p>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="font-semibold">Samanyu Ahuja</p>
              <p className="text-sm text-muted-foreground">
                {t("Student | Developer | Kidney Health Advocate", "छात्र | डेवलपर | किडनी स्वास्थ्य अधिवक्ता")}
              </p>
              <div className="flex items-center justify-center mt-2">
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-sm">India</span>
              </div>
            </div>

            <p className="text-muted-foreground mt-4">
              {t(
                "Thank you for using this app. We hope it encourages you to take your health into your own hands — and never ignore the signs your body gives you.",
                "इस ऐप का उपयोग करने के लिए धन्यवाद। हम आशा करते हैं कि यह आपको अपने स्वास्थ्य को अपने हाथों में लेने के लिए प्रोत्साहित करता है।"
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}