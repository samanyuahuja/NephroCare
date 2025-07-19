import { useState } from "react";
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
import { User, FlaskConical, FileText, BarChart3, ChevronDown, Stethoscope } from "lucide-react";
import { insertCKDAssessmentSchema, type InsertCKDAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/hooks/useLanguage";

export default function Diagnosis() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);
  const [isReportGuideOpen, setIsReportGuideOpen] = useState(false);

  const form = useForm<InsertCKDAssessment>({
    resolver: zodResolver(insertCKDAssessmentSchema),
    defaultValues: {
      patientName: "",
      age: 45,
      bloodPressure: 120,
      albumin: 1,
      sugar: 1,
      redBloodCells: "normal",
      pusCell: "normal",
      bacteria: "not_present",
      bloodGlucoseRandom: 145,
      bloodUrea: 35,
      serumCreatinine: 1.8,
      sodium: 135,
      potassium: 4.5,
      hemoglobin: 12,
      wbcCount: 7600,
      rbcCount: 5.2,
      hypertension: "no",
      diabetesMellitus: "no",
      coronaryArteryDisease: "no",
      appetite: "good",
      pedalEdema: "no",
      anemia: "no",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertCKDAssessment) => {
      const response = await apiRequest("POST", "/api/ckd-assessment", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store assessment ID in localStorage for privacy
      const storedIds = JSON.parse(localStorage.getItem('userAssessmentIds') || '[]');
      const updatedIds = [...storedIds, data.id];
      localStorage.setItem('userAssessmentIds', JSON.stringify(updatedIds));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('assessmentIdsUpdated'));
      
      // Invalidate Browse page queries
      queryClient.invalidateQueries({ queryKey: ["/api/ckd-assessments", "filtered"] });
      queryClient.invalidateQueries({ queryKey: ["/api/diet-plans", "filtered"] });
      
      toast({
        title: "Assessment Complete",
        description: "Your CKD risk assessment has been generated successfully.",
      });
      setLocation(`/results/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Assessment Failed",
        description: "There was an error processing your assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCKDAssessment) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {t("CKD Risk Assessment", "सीकेडी जोखिम मूल्यांकन")}
          </CardTitle>
          <p className="text-gray-600">
            {t(
              "Please fill out the medical parameters below for accurate CKD risk prediction.",
              "सटीक सीकेडी जोखिम भविष्यवाणी के लिए कृपया नीचे दिए गए चिकित्सा पैरामीटर भरें।"
            )}
          </p>
        </CardHeader>
        
        {/* Symptom Checker Section */}
        <div className="mx-6 mb-6">
          <Collapsible open={isSymptomCheckerOpen} onOpenChange={setIsSymptomCheckerOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  {t("Don't know your values? Check the symptom checker", "अपनी मान नहीं जानते? लक्षण चेकर देखें")}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isSymptomCheckerOpen ? 'rotate-180' : ''}`} />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">

                    <div className="bg-white p-3 rounded-lg border">
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
                      <div className="font-semibold text-red-600 mb-1">Blood Glucose ≥ 160</div>
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
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {t("Need help finding values in your medical report?", "अपनी मेडिकल रिपोर्ट में मान खोजने में सहायता चाहिए?")}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isReportGuideOpen ? 'rotate-180' : ''}`} />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                    <div className="bg-white p-4 rounded-lg border">
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
                      <div className="font-semibold text-green-700 mb-2">Blood Glucose Random</div>
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
                      <div className="font-semibold text-green-700 mb-2">Swelling in Feet</div>
                      <div className="text-gray-600">{t("Not in tests - doctors check this in physical exam", "टेस्ट में नहीं - डॉक्टर इसे फिजिकल एग्जाम में चेक करते हैं")}</div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <User className="mr-3 h-5 w-5 text-primary" />
                    {t("Patient Information", "रोगी की जानकारी")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Patient Name", "रोगी का नाम")} *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("Enter patient's full name", "रोगी का पूरा नाम दर्ज करें")}
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
                            className={field.value && (parseInt(field.value) < 10 || parseInt(field.value) > 90) ? "border-orange-400" : ""}
                          />
                        </FormControl>
                        {field.value && (parseInt(field.value) < 10 || parseInt(field.value) > 90) && (
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
                            className={field.value && (parseInt(field.value) < 60 || parseInt(field.value) > 140) ? "border-red-400" : ""}
                          />
                        </FormControl>
                        {field.value && parseInt(field.value) < 60 && (
                          <p className="text-sm text-red-600">Warning: Hypotension - consult doctor immediately</p>
                        )}
                        {field.value && parseInt(field.value) > 140 && (
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
                        {field.value && parseInt(field.value) > 3 && (
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
                        {field.value && parseInt(field.value) > 2 && (
                          <p className="text-sm text-red-600">Warning: May signal diabetes - major CKD risk factor</p>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Laboratory Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <FlaskConical className="mr-3 h-5 w-5 text-primary" />
                    {t("Laboratory Results", "प्रयोगशाला परिणाम")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <FormLabel>Blood Glucose Random (mg/dL)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="number"
                              min="70"
                              max="400"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className={field.value && parseInt(field.value) > 200 ? "border-red-400" : ""}
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
                                  field.onChange(145); // Reset to default value
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="bgr-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && parseInt(field.value) > 200 && (
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
                              className={field.value && parseInt(field.value) > 40 ? "border-red-400" : ""}
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
                                  field.onChange(35); // Reset to default value
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="bu-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && parseInt(field.value) > 40 && (
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
                              className={field.value && parseFloat(field.value) > 1.5 ? "border-red-400" : ""}
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
                                  field.onChange(1.8); // Reset to default value
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="sc-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && parseFloat(field.value) > 1.5 && (
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
                              className={field.value && (parseInt(field.value) < 130 || parseInt(field.value) > 150) ? "border-red-400" : ""}
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
                                  field.onChange(135); // Reset to default value
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="sod-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && (parseInt(field.value) < 130 || parseInt(field.value) > 150) && (
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
                              className={field.value && parseFloat(field.value) > 5.5 ? "border-red-400" : ""}
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
                                  field.onChange(4.5); // Reset to default value
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="pot-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && parseFloat(field.value) > 5.5 && (
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
                              className={field.value && parseFloat(field.value) < 10 ? "border-red-400" : ""}
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
                                  field.onChange(12); // Reset to default value
                                }
                              }}
                              checked={field.value === "unknown"}
                            />
                            <label htmlFor="hemo-unknown" className="text-sm text-gray-600">
                              {t("Don't Know", "मुझे नहीं पता")}
                            </label>
                          </div>
                        </div>
                        {field.value && parseFloat(field.value) < 10 && (
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
                                  field.onChange(7600); // Reset to default value
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
                                  field.onChange(5.2); // Reset to default value
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <FileText className="mr-3 h-5 w-5 text-primary" />
                    Medical Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Submit Button */}
              <div className="text-center pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-8 py-4 text-lg"
                  disabled={mutation.isPending}
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  {mutation.isPending ? "Generating Prediction..." : "Generate Prediction"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
