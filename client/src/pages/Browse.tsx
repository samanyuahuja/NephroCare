import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowRight,
  Plus,
} from "lucide-react";
import PageIntro from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import type { CKDAssessment, DietPlan } from "@shared/schema";

export default function Browse() {
  const { language } = useLanguage();
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  const [userAssessmentIds, setUserAssessmentIds] = useState<number[]>([]);

  useEffect(() => {
    const updateAssessmentIds = () => {
      try {
        const stored = localStorage.getItem("userAssessmentIds");
        setUserAssessmentIds(stored ? JSON.parse(stored) : []);
      } catch {
        setUserAssessmentIds([]);
      }
    };

    updateAssessmentIds();
    window.addEventListener("storage", updateAssessmentIds);
    window.addEventListener("assessmentIdsUpdated", updateAssessmentIds);
    return () => {
      window.removeEventListener("storage", updateAssessmentIds);
      window.removeEventListener("assessmentIdsUpdated", updateAssessmentIds);
    };
  }, []);

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<CKDAssessment[]>({
    queryKey: ["/api/ckd-assessments", "filtered", userAssessmentIds],
    queryFn: async () => {
      if (userAssessmentIds.length === 0) return [];
      const response = await fetch(`/api/ckd-assessments/filtered?ids=${encodeURIComponent(JSON.stringify(userAssessmentIds))}`);
      if (!response.ok) throw new Error(`Failed to fetch assessments: ${response.status}`);
      return response.json();
    },
    enabled: userAssessmentIds.length > 0,
  });

  const { data: dietPlans = [], isLoading: dietPlansLoading } = useQuery<DietPlan[]>({
    queryKey: ["/api/diet-plans", "filtered", userAssessmentIds],
    queryFn: async () => {
      if (userAssessmentIds.length === 0) return [];
      const response = await fetch(`/api/diet-plans/filtered?ids=${encodeURIComponent(JSON.stringify(userAssessmentIds))}`);
      if (!response.ok) throw new Error(`Failed to fetch diet plans: ${response.status}`);
      return response.json();
    },
    enabled: userAssessmentIds.length > 0,
  });

  const formatDate = (value: string | Date | null) => {
    if (!value) return t("Date unavailable", "तारीख उपलब्ध नहीं");
    return new Date(value).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const completedAssessments = assessments.filter((assessment) => assessment.riskScore !== null && assessment.riskLevel);
  const latestDate = completedAssessments[0]?.createdAt ? formatDate(completedAssessments[0].createdAt) : "—";

  const EmptyState = ({ type }: { type: "reports" | "diet" }) => {
    return (
      <div className="reports-empty">
        <span aria-hidden="true">{type === "reports" ? "REPORTS / 00" : "DIET / 00"}</span>
        <h2>{type === "reports" ? t("No reports on this device", "इस डिवाइस पर कोई रिपोर्ट नहीं") : t("No diet guidance yet", "अभी कोई आहार मार्गदर्शन नहीं")}</h2>
        <p>{type === "reports" ? t("Complete an assessment and its report reference will appear here.", "मूल्यांकन पूरा करें और उसका रिपोर्ट संदर्भ यहां दिखाई देगा।") : t("Diet guidance becomes available after an assessment.", "मूल्यांकन के बाद आहार मार्गदर्शन उपलब्ध होगा।")}</p>
        <Button asChild><Link href="/diagnosis">{t("Start assessment", "मूल्यांकन शुरू करें")}<ArrowRight /></Link></Button>
      </div>
    );
  };

  return (
    <div className="reports-page app-page">
      <PageIntro
        eyebrow={t("Saved on this browser", "इस ब्राउज़र पर सहेजा गया")}
        title={t("My reports", "मेरी रिपोर्ट")}
        description={t("A clear index of assessments and diet guidance connected to this device.", "इस डिवाइस से जुड़े मूल्यांकन और आहार मार्गदर्शन का स्पष्ट सूचकांक।")}
        actions={<Button asChild><Link href="/diagnosis"><Plus />{t("New assessment", "नया मूल्यांकन")}</Link></Button>}
        aside={<div className="privacy-signal"><span aria-hidden="true">DEVICE / LOCAL</span><strong>{t("Device-linked access", "डिवाइस से जुड़ी पहुंच")}</strong><p>{t("Report references are read from this browser before records are requested.", "रिकॉर्ड मांगने से पहले रिपोर्ट संदर्भ इसी ब्राउज़र से पढ़े जाते हैं।")}</p></div>}
      />

      <section className="report-overview" aria-label={t("Report overview", "रिपोर्ट सारांश")}>
        <div><NumberFlow value={completedAssessments.length} /><span>{t("completed assessments", "पूर्ण मूल्यांकन")}</span></div>
        <div><NumberFlow value={dietPlans.length} /><span>{t("diet plans", "आहार योजनाएं")}</span></div>
        <div><strong>{latestDate}</strong><span>{t("latest report", "नवीनतम रिपोर्ट")}</span></div>
      </section>

      <Tabs defaultValue="results" className="reports-tabs">
        <TabsList aria-label={t("Report type", "रिपोर्ट का प्रकार")}>
          <TabsTrigger value="results">{t("Assessments", "मूल्यांकन")}<span>{completedAssessments.length}</span></TabsTrigger>
          <TabsTrigger value="diet-plans">{t("Diet guidance", "आहार मार्गदर्शन")}<span>{dietPlans.length}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          {assessmentsLoading ? <div className="reports-loading" role="status">{t("Loading reports…", "रिपोर्ट लोड हो रही हैं…")}</div> : completedAssessments.length === 0 ? <EmptyState type="reports" /> : (
            <section className="report-ledger" aria-labelledby="assessment-ledger-title">
              <div className="report-ledger__heading"><div><p className="section-kicker">{t("Assessment archive", "मूल्यांकन संग्रह")}</p><h2 id="assessment-ledger-title">{t("Completed reports", "पूर्ण रिपोर्ट")}</h2></div><span>{t("Newest first", "नई रिपोर्ट पहले")}</span></div>
              <div className="report-ledger__columns" aria-hidden="true"><span>{t("Report", "रिपोर्ट")}</span><span>{t("Date", "तारीख")}</span><span>{t("Risk context", "जोखिम संदर्भ")}</span><span>{t("Score", "स्कोर")}</span><span /></div>
              {completedAssessments.map((assessment, index) => (
                <article className="report-row" key={assessment.id}>
                  <div className="report-row__identity"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{assessment.patientName || t("Unnamed assessment", "बिना नाम का मूल्यांकन")}</strong><small>NC-{String(assessment.id).padStart(4, "0")}</small></div></div>
                  <div className="report-row__date">{formatDate(assessment.createdAt)}</div>
                  <div><span className={`risk-label risk-label--${assessment.riskLevel?.toLowerCase()}`}>{assessment.riskLevel} {t("risk", "जोखिम")}</span></div>
                  <div className="report-row__score"><NumberFlow value={(assessment.riskScore || 0) * 100} format={{ maximumFractionDigits: 1 }} /><span>%</span></div>
                  <Button asChild variant="ghost" size="icon"><Link href={`/results/${assessment.id}`} aria-label={t("Open report", "रिपोर्ट खोलें")}><ArrowRight /></Link></Button>
                </article>
              ))}
            </section>
          )}
        </TabsContent>

        <TabsContent value="diet-plans">
          {dietPlansLoading ? <div className="reports-loading" role="status">{t("Loading diet guidance…", "आहार मार्गदर्शन लोड हो रहा है…")}</div> : dietPlans.length === 0 ? <EmptyState type="diet" /> : (
            <section className="diet-ledger" aria-labelledby="diet-ledger-title">
              <div className="report-ledger__heading"><div><p className="section-kicker">{t("Nutrition archive", "पोषण संग्रह")}</p><h2 id="diet-ledger-title">{t("Diet guidance", "आहार मार्गदर्शन")}</h2></div></div>
              {dietPlans.map((plan, index) => (
                <article className="diet-row" key={plan.id}>
                  <span className="diet-row__number">{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{t("Diet plan", "आहार योजना")} #{plan.id}</strong><p>{plan.dietType || t("Personalised", "व्यक्तिगत")}</p></div>
                  <time>{formatDate(plan.createdAt)}</time>
                  <Button asChild variant="outline"><Link href={`/diet-plan/${plan.assessmentId}`}>{t("Open plan", "योजना खोलें")}<ArrowRight /></Link></Button>
                </article>
              ))}
            </section>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
