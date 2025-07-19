import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSearch, Calendar, User, TrendingUp, Utensils, Activity } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import type { CKDAssessment, DietPlan } from "@shared/schema";

const Browse = () => {
  const { language } = useLanguage();
  
  const t = (en: string, hi: string) => (language === 'hi' ? hi : en);

  const { data: assessments, isLoading: assessmentsLoading } = useQuery<CKDAssessment[]>({
    queryKey: ["/api/ckd-assessments"],
  });

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRiskBadgeVariant = (riskLevel: string | null) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'moderate': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const assessmentsWithResults = assessments?.filter(a => a.riskScore && a.riskLevel) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileSearch className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("Browse Results & Diet Plans", "परिणाम और आहार योजनाएं ब्राउज़ करें")}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          {t(
            "Browse through completed assessments and their results, or view available diet plans without needing to take a new assessment.",
            "पूर्ण मूल्यांकन और उनके परिणामों को ब्राउज़ करें, या नया मूल्यांकन लिए बिना उपलब्ध आहार योजनाएं देखें।"
          )}
        </p>
      </div>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("Assessment Results", "मूल्यांकन परिणाम")}
          </TabsTrigger>
          <TabsTrigger value="diet-plans" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            {t("Diet Plans", "आहार योजनाएं")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          {assessmentsLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-lg">{t("Loading results...", "परिणाम लोड हो रहे हैं...")}</div>
            </div>
          ) : assessmentsWithResults.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("No Results Available", "कोई परिणाम उपलब्ध नहीं")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t(
                    "Complete your first CKD assessment to see results here.",
                    "यहां परिणाम देखने के लिए अपना पहला CKD मूल्यांकन पूरा करें।"
                  )}
                </p>
                <Link href="/diagnosis">
                  <Button className="bg-primary hover:bg-primary/90">
                    {t("Take Assessment", "मूल्यांकन लें")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessmentsWithResults.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {assessment.patientName}
                      </CardTitle>
                      <Badge variant={getRiskBadgeVariant(assessment.riskLevel)}>
                        {assessment.riskLevel} {t("Risk", "जोखिम")}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(assessment.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("Risk Score", "जोखिम स्कोर")}</span>
                        <span className="font-semibold">{(assessment.riskScore! * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("Age", "आयु")}</span>
                        <span className="font-semibold">{assessment.age} {t("years", "वर्ष")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("Creatinine", "क्रिएटिनिन")}</span>
                        <span className="font-semibold">{assessment.serumCreatinine} mg/dL</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/results/${assessment.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Activity className="h-4 w-4 mr-2" />
                          {t("View Details", "विवरण देखें")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="diet-plans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sample Diet Plans */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  {t("Vegetarian CKD Diet", "शाकाहारी सीकेडी आहार")}
                </CardTitle>
                <CardDescription>
                  {t("Plant-based nutrition plan for kidney health", "गुर्दे के स्वास्थ्य के लिए पौधे-आधारित पोषण योजना")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="font-semibold text-green-600">{t("Foods to Eat:", "खाने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("White rice, apples, cabbage, cauliflower, olive oil", "सफेद चावल, सेब, पत्ता गोभी, फूलगोभी, जैतून का तेल")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-red-600">{t("Foods to Avoid:", "बचने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("High-protein pulses, bananas, processed foods", "उच्च प्रोटीन दालें, केला, प्रसंस्कृत खाद्य पदार्थ")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {t("View Full Plan", "पूरी योजना देखें")}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  {t("Non-Vegetarian CKD Diet", "मांसाहारी सीकेडी आहार")}
                </CardTitle>
                <CardDescription>
                  {t("Balanced nutrition with lean proteins", "दुबले प्रोटीन के साथ संतुलित पोषण")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="font-semibold text-green-600">{t("Foods to Eat:", "खाने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("Egg whites, small fish portions, lean chicken", "अंडे का सफेद भाग, मछली के छोटे टुकड़े, दुबला चिकन")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-red-600">{t("Foods to Avoid:", "बचने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("Red meat, organ meats, processed meats", "लाल मांस, अंग मांस, प्रसंस्कृत मांस")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {t("View Full Plan", "पूरी योजना देखें")}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  {t("Low Sodium Diet", "कम सोडियम आहार")}
                </CardTitle>
                <CardDescription>
                  {t("Specialized plan for blood pressure control", "रक्तचाप नियंत्रण के लिए विशेष योजना")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="font-semibold text-green-600">{t("Foods to Eat:", "खाने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("Fresh fruits, herbs, garlic, lemon", "ताजे फल, जड़ी-बूटियां, लहसुन, नींबू")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-red-600">{t("Foods to Avoid:", "बचने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("Pickles, canned foods, table salt", "अचार, डिब्बाबंद खाना, नमक")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {t("View Full Plan", "पूरी योजना देखें")}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  {t("Diabetes + CKD Diet", "मधुमेह + सीकेडी आहार")}
                </CardTitle>
                <CardDescription>
                  {t("Combined approach for diabetes and kidney care", "मधुमेह और गुर्दे की देखभाल के लिए संयुक्त दृष्टिकोण")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="font-semibold text-green-600">{t("Foods to Eat:", "खाने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("Complex carbs, low-GI foods, controlled portions", "जटिल कार्बोहाइड्रेट, कम GI खाद्य पदार्थ, नियंत्रित भाग")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-red-600">{t("Foods to Avoid:", "बचने योग्य खाद्य पदार्थ:")}</span>
                    <p className="text-gray-600 mt-1">
                      {t("High-sugar foods, refined carbs, high-potassium fruits", "उच्च चीनी खाद्य पदार्थ, रिफाइंड कार्ब्स, उच्च पोटेशियम फल")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {t("View Full Plan", "पूरी योजना देखें")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t("Need a Personalized Diet Plan?", "व्यक्तिगत आहार योजना चाहिए?")}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              {t(
                "Take a complete CKD assessment to get a diet plan tailored specifically to your health condition and dietary preferences.",
                "अपनी स्वास्थ्य स्थिति और आहार प्राथमिकताओं के अनुसार विशेष रूप से तैयार की गई आहार योजना पाने के लिए एक पूर्ण CKD मूल्यांकन करें।"
              )}
            </p>
            <Link href="/diagnosis">
              <Button>
                <Activity className="mr-2 h-4 w-4" />
                {t("Take Assessment", "मूल्यांकन लें")}
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Browse;