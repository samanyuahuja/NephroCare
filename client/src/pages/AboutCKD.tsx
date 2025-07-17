import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Info, 
  Search, 
  AlertTriangle, 
  Shield, 
  HelpCircle, 
  Stethoscope,
  Heart,
  Zap,
  Dna,
  Pill
} from "lucide-react";

export default function AboutCKD() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <Card>
        <CardContent className="p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Understanding Chronic Kidney Disease
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Chronic Kidney Disease (CKD) is a long-term condition where the kidneys 
            gradually lose their ability to filter waste and excess fluid from the blood.
          </p>
          
          {/* Medical illustration placeholder */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-8 mb-8">
            <div className="text-6xl text-blue-600 mb-4">🫘</div>
            <p className="text-gray-700">Healthy kidneys filter your blood 24/7</p>
          </div>
        </CardContent>
      </Card>

      {/* What is CKD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Info className="mr-3 h-6 w-6 text-primary" />
            What is CKD?
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-gray-700">
          <p className="mb-4">
            Chronic Kidney Disease occurs when your kidneys are damaged and can't filter 
            blood the way they should. The disease is called "chronic" because the damage 
            happens slowly over many years.
          </p>
          <p>
            Your kidneys filter extra water and wastes out of your blood to make urine. 
            When kidneys are damaged, waste can build up in your body and make you feel sick.
          </p>
        </CardContent>
      </Card>

      {/* Causes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Search className="mr-3 h-6 w-6 text-primary" />
            Common Causes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Diabetes</h3>
                <p className="text-gray-600 text-sm">
                  High blood sugar levels can damage kidney filters over time.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">High Blood Pressure</h3>
                <p className="text-gray-600 text-sm">
                  Hypertension can damage blood vessels in the kidneys.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Dna className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Genetic Factors</h3>
                <p className="text-gray-600 text-sm">
                  Family history and inherited kidney diseases.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Pill className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Medications</h3>
                <p className="text-gray-600 text-sm">
                  Long-term use of certain medications can affect kidney function.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <AlertTriangle className="mr-3 h-6 w-6 text-primary" />
            Warning Signs & Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-800 text-lg">Early Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Usually no symptoms</li>
                  <li>• Detected through blood tests</li>
                  <li>• Slight changes in kidney function</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-orange-800 text-lg">Moderate Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• Fatigue and weakness</li>
                  <li>• Swelling in hands/feet</li>
                  <li>• Changes in urination</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-800 text-lg">Advanced Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Nausea and vomiting</li>
                  <li>• Difficulty breathing</li>
                  <li>• Severe swelling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Prevention Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Shield className="mr-3 h-6 w-6 text-primary" />
            Prevention & Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle Changes</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Maintain healthy blood pressure</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Control blood sugar levels</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Follow a kidney-friendly diet</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Exercise regularly</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Management</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Regular monitoring of kidney function</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Medication adherence</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Avoid nephrotoxic substances</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Regular follow-up with healthcare team</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <HelpCircle className="mr-3 h-6 w-6 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                How is CKD diagnosed?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                CKD is diagnosed through blood tests (creatinine, eGFR), urine tests 
                (protein levels), and imaging studies. Early detection is crucial for 
                effective management.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Can CKD be reversed?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                While CKD cannot be cured, its progression can be slowed or stopped 
                with proper treatment, lifestyle changes, and early intervention.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                What should I eat if I have CKD?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                A kidney-friendly diet typically limits protein, phosphorus, potassium, 
                and sodium. Work with a dietitian to create a personalized meal plan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                When should I see a nephrologist?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                You should see a kidney specialist when your eGFR falls below 30, 
                if you have persistent proteinuria, or if your primary care doctor recommends it.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="medical-gradient rounded-xl text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Take Control of Your Kidney Health</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Early detection and proper management can help preserve kidney function 
          and improve quality of life. Get your CKD risk assessment today.
        </p>
        <Link href="/diagnosis">
          <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
            <Stethoscope className="mr-3 h-5 w-5" />
            Start Your Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
