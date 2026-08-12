import { useState } from "react";
import NumberFlow from "@number-flow/react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { insertCKDAssessmentSchema, type InsertCKDAssessment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/hooks/useLanguage";
import PageIntro from "@/components/PageIntro";
import { storeAssessmentReference } from "@/lib/assessmentAccess";

export default function Diagnosis() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);
  const [isReportGuideOpen, setIsReportGuideOpen] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  // UCI CKD Dataset median values for form defaults
  // These provide balanced, unbiased starting points
  const datasetMedians = {
    age: 51,
    bloodPressure: 80,
    albumin: 1,
    sugar: 1,
    bloodGlucoseRandom: 121,
    bloodUrea: 36,
    serumCreatinine: 1.2,
    sodium: 138,
    potassium: 4.4,
    hemoglobin: 12.5,
    wbcCount: 7800,
    rbcCount: 4.8,
  };

  const form = useForm<InsertCKDAssessment>({
    resolver: zodResolver(insertCKDAssessmentSchema),
    defaultValues: {
      patientName: "",
      age: datasetMedians.age,
      bloodPressure: datasetMedians.bloodPressure,
      albumin: datasetMedians.albumin,
      sugar: datasetMedians.sugar,
      redBloodCells: "normal",
      pusCell: "normal",
      bloodGlucoseRandom: datasetMedians.bloodGlucoseRandom,
      bloodUrea: datasetMedians.bloodUrea,
      serumCreatinine: datasetMedians.serumCreatinine,
      sodium: datasetMedians.sodium,
      potassium: datasetMedians.potassium,
      hemoglobin: datasetMedians.hemoglobin,
      wbcCount: datasetMedians.wbcCount,
      rbcCount: datasetMedians.rbcCount,
      hypertension: "no",
      diabetesMellitus: "no",
      appetite: "good",
      pedalEdema: "no",
      anemia: "no",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertCKDAssessment) => {
      const response = await apiRequest("POST", "/api/ckd-assessment", {
        assessment: data,
        consent: {
          privacyNoticeVersion: "2026-08-12",
          healthDataProcessing: true,
          adultConfirmation: true,
          retentionDays: 30,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      try {
        storeAssessmentReference({ publicId: data.publicId, accessToken: data.accessToken });
        
        // Invalidate Browse page queries
        queryClient.invalidateQueries({ queryKey: ["/api/ckd-assessments", "filtered"] });
        queryClient.invalidateQueries({ queryKey: ["/api/diet-plans", "filtered"] });
        
        toast({
          title: t("Assessment Complete", "मूल्यांकन पूर्ण"),
          description: t("Your CKD risk assessment has been generated successfully.", "आपका CKD जोखिम मूल्यांकन सफलतापूर्वक बनाया गया है।"),
        });
        
        // Add a small delay to ensure localStorage is properly updated
        setTimeout(() => {
          setLocation(`/results/${data.publicId}`);
        }, 100);
      } catch (error) {
        console.error('Error storing assessment:', error);
        setLocation(`/results/${data.publicId}`);
      }
    },
    onError: (error) => {
      console.error('Assessment submission error:', error);
      toast({
        title: t("Assessment Failed", "मूल्यांकन विफल"),
        description: t("There was an error processing your assessment. Please try again.", "आपके मूल्यांकन को संसाधित करने में त्रुटि हुई। कृपया पुन: प्रयास करें।"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCKDAssessment) => {
    if (!consentAccepted) {
      toast({
        title: t("Consent required", "सहमति आवश्यक है"),
        description: t("Please confirm the health-data notice before continuing.", "आगे बढ़ने से पहले स्वास्थ्य डेटा सूचना की पुष्टि करें।"),
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  const reviewedFields = Object.keys(form.formState.dirtyFields).length;
  const reviewProgress = Math.min(100, Math.round((reviewedFields / 20) * 100));

  return (
    <div className="assessment-page app-page">
      <PageIntro
        eyebrow={t("Structured preliminary screening", "व्यवस्थित प्रारंभिक स्क्रीनिंग")}
        title={t("CKD risk assessment", "सीकेडी जोखिम मूल्यांकन")}
        description={t(
          "Work from a recent report, review each value, and mark anything you do not know. The result is educational context, not a diagnosis.",
          "हाल की रिपोर्ट से हर मान की समीक्षा करें और जो पता न हो उसे अज्ञात चुनें। परिणाम शैक्षिक संदर्भ है, निदान नहीं।",
        )}
        aside={<div className="assessment-intro-note"><span aria-hidden="true">READ FIRST</span><strong>{t("Before entering data", "डेटा दर्ज करने से पहले")}</strong><p>{t("Use your own report and check units carefully. Do not guess a laboratory value.", "अपनी रिपोर्ट का उपयोग करें और इकाइयों को ध्यान से जांचें। लैब मान का अनुमान न लगाएं।")}</p></div>}
      />

      <div className="assessment-workspace">
        <aside className="assessment-rail">
          <div className="assessment-progress"><NumberFlow value={reviewProgress} /><span>%</span><p>{t("fields reviewed", "फ़ील्ड की समीक्षा")}</p><i><b style={{ width: `${reviewProgress}%` }} /></i></div>
          <nav aria-label={t("Assessment sections", "मूल्यांकन के भाग")}>
            <a href="#patient-information"><span>01</span><div><p>{t("Patient and report", "रोगी और रिपोर्ट")}</p></div></a>
            <a href="#laboratory-results"><span>02</span><div><p>{t("Laboratory values", "प्रयोगशाला मान")}</p></div></a>
            <a href="#medical-conditions"><span>03</span><div><p>{t("Health history", "स्वास्थ्य इतिहास")}</p></div></a>
          </nav>
          <div className="assessment-rail__boundary"><strong>{t("Review required", "समीक्षा आवश्यक")}</strong><p>{t("Every value can change the result. Review before submitting.", "हर मान परिणाम बदल सकता है। सबमिट करने से पहले समीक्षा करें।")}</p></div>
        </aside>

        <section className="assessment-sheet">
          <div className="assessment-sheet__heading"><p className="section-kicker">{t("Report workspace", "रिपोर्ट कार्यक्षेत्र")}</p><h2>{t("Enter only what you can verify", "केवल वही दर्ज करें जिसकी पुष्टि कर सकते हैं")}</h2></div>
        
        {/* Symptom Checker Section */}
        <div className="mx-4 sm:mx-6 mb-6">
          <Collapsible open={isSymptomCheckerOpen} onOpenChange={setIsSymptomCheckerOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-xs sm:text-sm md:text-base py-2 sm:py-3 px-3 sm:px-4">
                <div className="flex items-center min-w-0 flex-1">
                  <span className="truncate text-left">{t("Don't know your values? Check the symptom checker", "अपनी मान नहीं जानते? लक्षण चेकर देखें")}</span>
                </div>
                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform flex-shrink-0 ml-1 sm:ml-2 ${isSymptomCheckerOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">
                    {t("CKD Symptom Guide", "सीकेडी लक्षण गाइड")}
                  </CardTitle>
                  <p className="text-sm text-blue-600">
                    {t("If you experience these symptoms with the listed values, consult a healthcare provider immediately.", 
                        "यदि आप सूचीबद्ध मानों के साथ इन लक्षणों का अनुभव करते हैं, तो तुरंत स्वास्थ्य सेवा प्रदाता से सलाह लें।")}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">

                    <div className="bg-white p-2 sm:p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">BP ≥ 150</div>
                      <div className="text-gray-600">{t("Swelling, breathlessness, fatigue", "सूजन, सांस की तकलीफ, थकान")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Albumin 2–4</div>
                      <div className="text-gray-600">{t("Swelling in ankles, foamy urine", "टखनों में सूजन, झागदार मूत्र")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Sugar 2–5</div>
                      <div className="text-gray-600">{t("Excessive thirst, frequent urination", "अत्यधिक प्यास, बार-बार पेशाब")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">RBC Abnormal</div>
                      <div className="text-gray-600">{t("Pink/red urine, back pain", "गुलाबी/लाल मूत्र, पीठ दर्द")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">PC Abnormal</div>
                      <div className="text-gray-600">{t("Burning sensation while urinating", "पेशाब करते समय जलन")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Blood Glucose / Plasma Glucose ≥ 160</div>
                      <div className="text-gray-600">{t("Fatigue, excessive hunger/thirst", "थकान, अत्यधिक भूख/प्यास")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Blood Urea ≥ 40</div>
                      <div className="text-gray-600">{t("Loss of appetite, confusion", "भूख न लगना, भ्रम")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Creatinine ≥ 1.8</div>
                      <div className="text-gray-600">{t("Nausea, vomiting, low urine output", "मतली, उल्टी, कम मूत्र उत्पादन")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Sodium ≤ 130 or ≥ 145</div>
                      <div className="text-gray-600">{t("Confusion, fatigue, weakness", "भ्रम, थकान, कमजोरी")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Potassium ≥ 5.5</div>
                      <div className="text-gray-600">{t("Palpitations, muscle weakness", "दिल की धड़कन, मांसपेशियों की कमजोरी")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Hemoglobin ≤ 9</div>
                      <div className="text-gray-600">{t("Fatigue, pale skin", "थकान, पीली त्वचा")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">WBC Count ≥ 11000</div>
                      <div className="text-gray-600">{t("Fever, signs of infection", "बुखार, संक्रमण के लक्षण")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">RBC Count ≤ 3.5</div>
                      <div className="text-gray-600">{t("Anemia-related tiredness", "एनीमिया संबंधी थकान")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Hypertension: Yes</div>
                      <div className="text-gray-600">{t("High BP history or medication", "उच्च रक्तचाप का इतिहास या दवा")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Diabetes: Yes</div>
                      <div className="text-gray-600">{t("Excessive urination/thirst, weight loss", "अत्यधिक पेशाब/प्यास, वजन कम होना")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Appetite: Poor</div>
                      <div className="text-gray-600">{t("General fatigue, weight loss", "सामान्य थकान, वजन कम होना")}</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-semibold text-red-600 mb-1">Pedal Edema: Yes</div>
                      <div className="text-gray-600">{t("Swelling in feet/legs", "पैरों/टांगों में सूजन")}</div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Report Value Locator Section */}
          <Collapsible open={isReportGuideOpen} onOpenChange={setIsReportGuideOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-xs sm:text-sm md:text-base py-2 sm:py-3 px-3 sm:px-4">
                <div className="flex items-center min-w-0 flex-1">
                  <span className="truncate text-left">{t("Need help finding values in your medical report?", "अपनी मेडिकल रिपोर्ट में मान खोजने में सहायता चाहिए?")}</span>
                </div>
                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform flex-shrink-0 ml-1 sm:ml-2 ${isReportGuideOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">
                    {t("Medical Report Value Locator", "मेडिकल रिपोर्ट वैल्यू लोकेटर")}
                  </CardTitle>
                  <p className="text-sm text-green-600">
                    {t(
                        "Find these values in your medical reports to complete the assessment accurately.",
                        "मूल्यांकन सटीक रूप से पूरा करने के लिए अपनी मेडिकल रिपोर्ट में ये मान खोजें।")}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">

                    <div className="bg-white p-3 sm:p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Blood Pressure (BP)</div>
                      <div className="text-gray-600">{t("In the doctor's notes or 'Vital Signs' section (e.g., 120/80 mmHg)", "डॉक्टर के नोट्स या 'वाइटल साइन्स' सेक्शन में (जैसे, 120/80 mmHg)")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Albumin</div>
                      <div className="text-gray-600">{t("Found in 'Urine Test' - look for protein levels or 'Albumin' (0-5 scale)", "'यूरिन टेस्ट' में मिलता है - प्रोटीन लेवल या 'एल्ब्यूमिन' देखें (0-5 स्केल)")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Sugar</div>
                      <div className="text-gray-600">{t("In 'Urine Test' section - shows sugar levels in urine", "'यूरिन टेस्ट' सेक्शन में - मूत्र में चीनी का स्तर दिखाता है")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Red Blood Cells (RBC)</div>
                      <div className="text-gray-600">{t("In 'Urine Microscopy' section - listed as 'RBC' or 'Red Cells'", "'यूरिन माइक्रोस्कोपी' सेक्शन में - 'RBC' या 'Red Cells' के रूप में सूचीबद्ध")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Pus Cells</div>
                      <div className="text-gray-600">{t("In 'Urine Microscopy' - shows if there's any infection", "'यूरिन माइक्रोस्कोपी' में - दिखाता है कि कोई संक्रमण है या नहीं")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Blood Glucose Random / Plasma Glucose Random</div>
                      <div className="text-gray-600">{t("In 'Blood Sugar' section - random blood sugar level", "'ब्लड शुगर' सेक्शन में - रैंडम ब्लड शुगर लेवल")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Blood Urea</div>
                      <div className="text-gray-600">{t("Found in 'Kidney Function Test' (KFT) - look for 'Urea' or 'Blood Urea'", "'किडनी फंक्शन टेस्ट' (KFT) में मिलता है - 'यूरिया' या 'ब्लड यूरिया' देखें")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Serum Creatinine</div>
                      <div className="text-gray-600">{t("In 'Kidney Function Test' - tells how well kidneys are working", "'किडनी फंक्शन टेस्ट' में - बताता है कि किडनी कितनी अच्छी तरह काम कर रही है")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Sodium</div>
                      <div className="text-gray-600">{t("Look under 'Electrolytes' - may be written as 'Na+'", "'इलेक्ट्रोलाइट्स' के तहत देखें - 'Na+' के रूप में लिखा जा सकता है")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Potassium</div>
                      <div className="text-gray-600">{t("In 'Electrolytes' section - may be written as 'K+'", "'इलेक्ट्रोलाइट्स' सेक्शन में - 'K+' के रूप में लिखा जा सकता है")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Hemoglobin</div>
                      <div className="text-gray-600">{t("In 'Complete Blood Count' or 'CBC' test - shows if you have anemia", "'कम्प्लीट ब्लड काउंट' या 'CBC' टेस्ट में - दिखाता है कि आपको एनीमिया है या नहीं")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">White Blood Cells (WBC)</div>
                      <div className="text-gray-600">{t("In CBC - may be written as 'WBC count'", "CBC में - 'WBC count' के रूप में लिखा जा सकता है")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Red Blood Cells Count (RBC)</div>
                      <div className="text-gray-600">{t("In CBC - look for 'RBC count'", "CBC में - 'RBC count' देखें")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Hypertension</div>
                      <div className="text-gray-600">{t("If you have high BP or take BP medicine, check doctor's summary", "यदि आपका BP हाई है या BP की दवा लेते हैं, तो डॉक्टर की सारांश जांचें")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Diabetes</div>
                      <div className="text-gray-600">{t("If you take insulin or have high blood sugar, check doctor's notes", "यदि आप इंसुलिन लेते हैं या हाई ब्लड शुगर है, तो डॉक्टर के नोट्स जांचें")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Appetite</div>
                      <div className="text-gray-600">{t("Doctors may write this in their notes during check-up", "डॉक्टर इसे चेक-अप के दौरान अपने नोट्स में लिख सकते हैं")}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold text-green-700 mb-2">Swelling in Feet (Pedal Edema)</div>
                      <div className="text-gray-600">{t("Not in tests - doctors check this in physical exam", "टेस्ट में नहीं - डॉक्टर इसे फिजिकल एग्जाम में चेक करते हैं")}</div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <CardContent className="assessment-sheet__content">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Patient Information */}
              <Card id="patient-information" className="assessment-block">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t("Patient Information", "रोगी की जानकारी")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Patient label (optional)", "रोगी का लेबल (वैकल्पिक)")}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("Use initials or a nickname", "अक्षर या उपनाम का उपयोग करें")}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Age (years)", "आयु (वर्ष)")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="120"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className={field.value && (field.value < 10 || field.value > 90) ? "border-orange-400" : ""}
                          />
                        </FormControl>
                        {field.value && (field.value < 10 || field.value > 90) && (
                          <p className="text-sm text-orange-600">Age outside typical range for CKD assessment</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bloodPressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Blood Pressure (mmHg)", "रक्तचाप (mmHg)")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="60"
                            max="200"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className={field.value && (field.value < 60 || field.value > 140) ? "border-red-400" : ""}
                          />
                        </FormControl>
                        {field.value && field.value < 60 && (
                          <p className="text-sm text-red-600">Warning: Hypotension - consult doctor immediately</p>
                        )}
                        {field.value && field.value > 140 && (
                          <p className="text-sm text-red-600">Warning: High blood pressure - major CKD risk factor</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="albumin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Albumin (0-5 scale)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "unknown" ? "unknown" : parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select albumin level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0 - Normal</SelectItem>
                            <SelectItem value="1">1 - Trace</SelectItem>
                            <SelectItem value="2">2 - Low</SelectItem>
                            <SelectItem value="3">3 - Moderate</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Very High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value && typeof field.value === "number" && field.value > 3 && (
                          <p className="text-sm text-red-600">Warning: High proteinuria - indicates kidney damage</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sugar (0-5 scale)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "unknown" ? "unknown" : parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sugar level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0 - Normal</SelectItem>
                            <SelectItem value="1">1 - Trace</SelectItem>
                            <SelectItem value="2">2 - Low</SelectItem>
                            <SelectItem value="3">3 - Moderate</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Very High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value && typeof field.value === "number" && field.value > 2 && (
                          <p className="text-sm text-red-600">Warning: May signal diabetes - major CKD risk factor</p>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Laboratory Results */}
              <Card id="laboratory-results" className="assessment-block">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t("Laboratory Results", "प्रयोगशाला परिणाम")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="redBloodCells"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Red Blood Cells</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pusCell"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pus Cell</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bloodGlucoseRandom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Glucose Random / Plasma Glucose Random (mg/dL)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              min="70"
                              max="400"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className={field.value && typeof field.value === "number" && field.value > 200 ? "border-red-400" : ""}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="bgr-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.bloodGlucoseRandom); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="bgr-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && typeof field.value === "number" && field.value > 200 && (
                          <p className="text-sm text-red-600">Warning: Uncontrolled diabetes - very high CKD risk</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bloodUrea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Urea (mg/dL)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              min="7"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className={field.value && typeof field.value === "number" && field.value > 40 ? "border-red-400" : ""}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="bu-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.bloodUrea); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="bu-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && typeof field.value === "number" && field.value > 40 && (
                          <p className="text-sm text-red-600">Warning: Kidney function loss indicated</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serumCreatinine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serum Creatinine (mg/dL)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0.6"
                              max="10.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className={field.value && typeof field.value === "number" && field.value > 1.5 ? "border-red-400" : ""}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="sc-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.serumCreatinine); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="sc-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && typeof field.value === "number" && field.value > 1.5 && (
                          <p className="text-sm text-red-600">Warning: Declining kidney function - urgent evaluation needed</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sodium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sodium (mEq/L)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              min="130"
                              max="150"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className={field.value && typeof field.value === "number" && (field.value < 130 || field.value > 150) ? "border-red-400" : ""}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="sod-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.sodium); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="sod-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && typeof field.value === "number" && (field.value < 130 || field.value > 150) && (
                          <p className="text-sm text-red-600">Warning: Electrolyte imbalance - medical attention needed</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potassium (mEq/L)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="3.0"
                              max="6.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className={field.value && typeof field.value === "number" && field.value > 5.5 ? "border-red-400" : ""}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="pot-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.potassium); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="pot-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && typeof field.value === "number" && field.value > 5.5 && (
                          <p className="text-sm text-red-600">Warning: Hyperkalemia risk - dangerous for heart</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hemoglobin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hemoglobin (g/dL)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="8.0"
                              max="18.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className={field.value && typeof field.value === "number" && field.value < 10 ? "border-red-400" : ""}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="hemo-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.hemoglobin); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="hemo-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && typeof field.value === "number" && field.value < 10 && (
                          <p className="text-sm text-red-600">Warning: Anemia detected - common in CKD patients</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wbcCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WBC Count</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="wbcc-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.wbcCount); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="wbcc-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rbcCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RBC Count</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rbcc-unknown"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange("unknown");
                                } else {
                                  field.onChange(datasetMedians.rbcCount); // Reset to dataset median
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="rbcc-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Medical Conditions */}
              <Card id="medical-conditions" className="assessment-block">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t("Medical Conditions", "चिकित्सकीय स्थितियां")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="hypertension"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hypertension</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diabetesMellitus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diabetes Mellitus</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="appetite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appetite</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pedalEdema"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pedal Edema</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="anemia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anemia</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="border-t pt-6 text-left max-w-3xl mx-auto">
                <label className="flex items-start gap-3 text-sm leading-6">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={consentAccepted}
                    onChange={(event) => setConsentAccepted(event.target.checked)}
                  />
                  <span>
                    {t(
                      "I am 18 or older and consent to NephroCare processing these health details to create this screening report. I understand the encrypted record is retained for 30 days, can be deleted from My Reports, and is not a diagnosis.",
                      "मैं 18 वर्ष या उससे अधिक आयु का/की हूं और इस स्क्रीनिंग रिपोर्ट के लिए NephroCare द्वारा इन स्वास्थ्य विवरणों के उपयोग की सहमति देता/देती हूं। मैं समझता/समझती हूं कि एन्क्रिप्टेड रिकॉर्ड 30 दिनों तक रखा जाता है, मेरी रिपोर्ट से हटाया जा सकता है और यह निदान नहीं है।",
                    )} {" "}
                    <a href="/privacy" className="underline">{t("Privacy notice", "गोपनीयता सूचना")}</a>
                  </span>
                </label>
              </div>

              <div className="text-center pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-8 py-4 text-lg"
                  disabled={mutation.isPending || !consentAccepted}
                >
                  {mutation.isPending ? t("Generating report…", "रिपोर्ट बनाई जा रही है…") : t("Generate preliminary report", "प्रारंभिक रिपोर्ट बनाएं")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        </section>
      </div>
    </div>
  );
}
