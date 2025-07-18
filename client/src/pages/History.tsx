import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon, Calendar, User, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import type { CKDAssessment } from "@shared/schema";

const History = () => {
  const { language } = useLanguage();
  
  const t = (en: string, hi: string) => (language === 'hi' ? hi : en);

  const { data: assessments, isLoading, error } = useQuery<CKDAssessment[]>({
    queryKey: ["/api/ckd-assessments"],
  });

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">{t("Loading assessment history...", "मूल्यांकन इतिहास लोड हो रहा है...")}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{t("Error loading assessment history", "मूल्यांकन इतिहास लोड करने में त्रुटि")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HistoryIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("Assessment History", "मूल्यांकन इतिहास")}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
          {t(
            "Track your chronic kidney disease assessment history and monitor your health progress over time.",
            "अपने पुराने गुर्दे की बीमारी मूल्यांकन इतिहास को ट्रैक करें और समय के साथ अपनी स्वास्थ्य प्रगति पर नज़र रखें।"
          )}
        </p>
      </div>

      {!assessments || assessments.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <HistoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t("No Assessment History", "कोई मूल्यांकन इतिहास नहीं")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t(
                "You haven't completed any CKD assessments yet. Start by taking your first assessment.",
                "आपने अभी तक कोई CKD मूल्यांकन पूरा नहीं किया है। अपना पहला मूल्यांकन लेकर शुरुआत करें।"
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
        <div className="grid gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-primary" />
                      {t("Assessment of", "का मूल्यांकन")} {assessment.patientName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(assessment.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {assessment.riskLevel && (
                      <Badge variant={getRiskBadgeVariant(assessment.riskLevel)}>
                        {assessment.riskLevel} {t("Risk", "जोखिम")}
                      </Badge>
                    )}
                    {assessment.riskScore && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{t("Risk Score", "जोखिम स्कोर")}</div>
                        <div className="font-semibold">{(assessment.riskScore * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-500">{t("Age", "आयु")}</div>
                    <div className="font-semibold">{assessment.age} {t("years", "वर्ष")}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-500">{t("Blood Pressure", "रक्तचाप")}</div>
                    <div className="font-semibold">{assessment.bloodPressure} mmHg</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-500">{t("Creatinine", "क्रिएटिनिन")}</div>
                    <div className="font-semibold">{assessment.serumCreatinine} mg/dL</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-500">{t("Hemoglobin", "हीमोग्लोबिन")}</div>
                    <div className="font-semibold">{assessment.hemoglobin} g/dL</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("Medical conditions:", "चिकित्सा स्थितियां:")} 
                    {assessment.hypertension === 'yes' && ` ${t("Hypertension", "उच्च रक्तचाप")}`}
                    {assessment.diabetesMellitus === 'yes' && ` ${t("Diabetes", "मधुमेह")}`}
                    {assessment.anemia === 'yes' && ` ${t("Anemia", "एनीमिया")}`}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/results?id=${assessment.id}`}>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {t("View Results", "परिणाम देखें")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/diagnosis">
          <Button className="bg-primary hover:bg-primary/90">
            {t("Take New Assessment", "नया मूल्यांकन लें")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default History;