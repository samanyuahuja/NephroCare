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
      age: 45,
      bloodPressure: 120,
      specificGravity: 1.020,
      albumin: 1,
      sugar: 0,
      redBloodCells: "normal",
      pusCell: "normal", 
      pusCellClumps: "not_present",
      bacteria: "not_present",
      bloodGlucoseRandom: 145,
      bloodUrea: 35,
      serumCreatinine: 1.8,
      sodium: 135,
      potassium: 4.5,
      hemoglobin: 12,
      wbcCount: 7600,
      rbcCount: 5.2,
      hypertension: false,
      diabetesMellitus: false,
      coronaryArteryDisease: false,
      appetite: "good",
      pedalEdema: false,
      anemia: false,
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
                    name="specificGravity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Gravity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="1.000"
                            max="1.035"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className={field.value && (parseFloat(field.value) < 1.005 || parseFloat(field.value) > 1.030) ? "border-red-400" : ""}
                          />
                        </FormControl>
                        {field.value && (parseFloat(field.value) < 1.005 || parseFloat(field.value) > 1.030) && (
                          <p className="text-sm text-red-600">Warning: Abnormal specific gravity - kidney function concern</p>
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
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className={field.value && parseInt(field.value) > 3 ? "border-red-400" : ""}
                          />
                        </FormControl>
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
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className={field.value && parseInt(field.value) > 2 ? "border-red-400" : ""}
                          />
                        </FormControl>
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
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pusCellClumps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pus Cell Clumps</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_present">Not Present</SelectItem>
                            <SelectItem value="present">Present</SelectItem>
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
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rbcCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RBC Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
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
