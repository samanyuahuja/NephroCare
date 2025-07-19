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
import { User, FlaskConical, FileText, BarChart3 } from "lucide-react";
import { insertCKDAssessmentSchema, type InsertCKDAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/hooks/useLanguage";

export default function Diagnosis() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();

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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select or enter value" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="70">70 - Normal</SelectItem>
                            <SelectItem value="100">100 - Good</SelectItem>
                            <SelectItem value="120">120 - Fair</SelectItem>
                            <SelectItem value="150">150 - High</SelectItem>
                            <SelectItem value="200">200 - Very High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood urea level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 - Normal</SelectItem>
                            <SelectItem value="25">25 - Good</SelectItem>
                            <SelectItem value="30">30 - Fair</SelectItem>
                            <SelectItem value="40">40 - High</SelectItem>
                            <SelectItem value="60">60 - Very High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select creatinine level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0.8">0.8 - Normal</SelectItem>
                            <SelectItem value="1.0">1.0 - Good</SelectItem>
                            <SelectItem value="1.2">1.2 - Fair</SelectItem>
                            <SelectItem value="1.5">1.5 - High</SelectItem>
                            <SelectItem value="2.0">2.0 - Very High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sodium level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="135">135 - Normal</SelectItem>
                            <SelectItem value="140">140 - Good</SelectItem>
                            <SelectItem value="145">145 - Fair</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select potassium level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3.5">3.5 - Low</SelectItem>
                            <SelectItem value="4.0">4.0 - Normal</SelectItem>
                            <SelectItem value="4.5">4.5 - Good</SelectItem>
                            <SelectItem value="5.0">5.0 - High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select hemoglobin level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10">10 - Low</SelectItem>
                            <SelectItem value="12">12 - Normal</SelectItem>
                            <SelectItem value="13">13 - Good</SelectItem>
                            <SelectItem value="15">15 - High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select WBC count" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5000">5000 - Normal</SelectItem>
                            <SelectItem value="7500">7500 - Good</SelectItem>
                            <SelectItem value="10000">10000 - High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rbcCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RBC Count</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select RBC count" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="4.0">4.0 - Normal</SelectItem>
                            <SelectItem value="4.5">4.5 - Good</SelectItem>
                            <SelectItem value="5.0">5.0 - High</SelectItem>
                            <SelectItem value="unknown">{t("Don't Know", "मुझे नहीं पता")}</SelectItem>
                          </SelectContent>
                        </Select>
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
