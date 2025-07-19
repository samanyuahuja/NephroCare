import { useState } from "react";
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

  // Get assessment IDs from localStorage
  const getStoredAssessmentIds = (): number[] => {
    try {
      const stored = localStorage.getItem('userAssessmentIds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const [userAssessmentIds] = useState(getStoredAssessmentIds());

  const { data: assessments, isLoading: assessmentsLoading } = useQuery<CKDAssessment[]>({
    queryKey: ["/api/ckd-assessments", "filtered"],
    queryFn: async () => {
      if (userAssessmentIds.length === 0) return [];
      
      const allAssessments = await fetch("/api/ckd-assessments").then(res => res.json());
      return allAssessments.filter((assessment: CKDAssessment) => 
        userAssessmentIds.includes(assessment.id)
      );
    },
  });

  const { data: dietPlans, isLoading: dietPlansLoading } = useQuery<DietPlan[]>({
    queryKey: ["/api/diet-plans", "filtered"],
    queryFn: async () => {
      if (userAssessmentIds.length === 0) return [];
      
      const allDietPlans = await fetch("/api/diet-plans").then(res => res.json());
      return allDietPlans.filter((plan: DietPlan) => 
        userAssessmentIds.includes(plan.assessmentId!)
      );
    },
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
            "Browse through your completed assessments with detailed results and view your personalized diet plan history.",
            "अपने पूर्ण मूल्यांकन और विस्तृत परिणामों को ब्राउज़ करें और अपनी व्यक्तिगत आहार योजना इतिहास देखें।"
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
            {t("Diet History", "आहार इतिहास")}
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
          {dietPlansLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-lg">{t("Loading diet plans...", "आहार योजनाएं लोड हो रही हैं...")}</div>
            </div>
          ) : !dietPlans || dietPlans.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("No Diet Plans Available", "कोई आहार योजना उपलब्ध नहीं")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t(
                    "Complete your first CKD assessment to get personalized diet recommendations.",
                    "व्यक्तिगत आहार सिफारिशें पाने के लिए अपना पहला CKD मूल्यांकन पूरा करें।"
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
              {dietPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        {plan.patientName && t(`Diet Plan for ${plan.patientName}`, `${plan.patientName} के लिए आहार योजना`)}
                      </CardTitle>
                      <Badge variant="outline">
                        {plan.dietType || t("Personalized", "व्यक्तिगत")}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(plan.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {plan.recommendations && (
                        <div className="text-sm">
                          <span className="font-semibold text-green-600">{t("Key Recommendations:", "मुख्य सिफारिशें:")}</span>
                          <p className="text-gray-600 mt-1 line-clamp-3">
                            {plan.recommendations}
                          </p>
                        </div>
                      )}
                      
                      {plan.restrictions && (
                        <div className="text-sm">
                          <span className="font-semibold text-red-600">{t("Dietary Restrictions:", "आहार प्रतिबंध:")}</span>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {plan.restrictions}
                          </p>
                        </div>
                      )}
                      
                      {plan.calories && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{t("Daily Calories", "दैनिक कैलोरी")}</span>
                          <span className="font-semibold">{plan.calories} kcal</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/diet-plan/${plan.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Utensils className="h-4 w-4 mr-2" />
                          {t("View Full Plan", "पूरी योजना देखें")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t("Need a New Diet Plan?", "नई आहार योजना चाहिए?")}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              {t(
                "Take a complete CKD assessment to get a fresh diet plan tailored to your current health condition.",
                "अपनी वर्तमान स्वास्थ्य स्थिति के अनुसार एक नई आहार योजना पाने के लिए एक पूर्ण CKD मूल्यांकन करें।"
              )}
            </p>
            <Link href="/diagnosis">
              <Button>
                <Activity className="mr-2 h-4 w-4" />
                {t("Take New Assessment", "नया मूल्यांकन लें")}
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Browse;