import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  ChartLine,
  FileText,
  ShieldCheck,
  Stethoscope,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/hooks/useLanguage";

const tools = [
  {
    href: "/diagnosis",
    icon: Activity,
    title: ["CKD Risk Assessment", "सीकेडी जोखिम मूल्यांकन"],
    copy: [
      "Enter health history and recent report values to receive a preliminary risk estimate.",
      "प्रारंभिक जोखिम अनुमान के लिए स्वास्थ्य इतिहास और हाल की रिपोर्ट के मान दर्ज करें।",
    ],
  },
  {
    href: "/symptom-checker",
    icon: Stethoscope,
    title: ["Symptom Checker", "लक्षण जांच"],
    copy: [
      "Review common kidney-health symptoms and understand when clinical advice may be needed.",
      "किडनी स्वास्थ्य के सामान्य लक्षणों की समीक्षा करें और समझें कि चिकित्सकीय सलाह कब आवश्यक हो सकती है।",
    ],
  },
  {
    href: "/browse",
    icon: FileText,
    title: ["Reports & History", "रिपोर्ट और इतिहास"],
    copy: [
      "Return to completed assessments, reports, and saved diet guidance from this browser.",
      "इस ब्राउज़र में सहेजे गए मूल्यांकन, रिपोर्ट और आहार मार्गदर्शन दोबारा देखें।",
    ],
  },
];

const steps = [
  {
    number: "01",
    title: ["Use a recent report", "हाल की रिपोर्ट का उपयोग करें"],
    copy: [
      "Keep your blood and urine test values nearby before starting the assessment.",
      "मूल्यांकन शुरू करने से पहले रक्त और मूत्र जांच के मान अपने पास रखें।",
    ],
  },
  {
    number: "02",
    title: ["Complete the screening", "स्क्रीनिंग पूरी करें"],
    copy: [
      "Add the information you know. Optional fields can be left blank when unavailable.",
      "जो जानकारी उपलब्ध है वह दर्ज करें। अनुपलब्ध वैकल्पिक फ़ील्ड खाली छोड़े जा सकते हैं।",
    ],
  },
  {
    number: "03",
    title: ["Review the result", "परिणाम की समीक्षा करें"],
    copy: [
      "Read the estimated risk level and contributing factors, then discuss concerns with a clinician.",
      "अनुमानित जोखिम और संबंधित कारक पढ़ें, फिर चिंताओं पर चिकित्सक से चर्चा करें।",
    ],
  },
];

export default function Home() {
  return (
    <div className="space-y-10 md:space-y-14">
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
        <div className="grid gap-10 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:px-14">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              {t("Kidney health screening", "किडनी स्वास्थ्य स्क्रीनिंग")}
            </div>

            <h1 className="mb-5 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t("Understand your kidney health with greater clarity.", "अपनी किडनी के स्वास्थ्य को अधिक स्पष्टता से समझें।")}
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-8 text-gray-600">
              {t(
                "NephroCare helps you organise symptoms, medical history, and laboratory values into a clear preliminary CKD risk report.",
                "नेफ्रोकेयर लक्षणों, चिकित्सा इतिहास और लैब मानों को एक स्पष्ट प्रारंभिक सीकेडी जोखिम रिपोर्ट में व्यवस्थित करने में मदद करता है।"
              )}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base shadow-sm">
                <Link href="/diagnosis">
                  <Activity className="h-5 w-5" />
                  {t("Start assessment", "मूल्यांकन शुरू करें")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-blue-200 bg-white px-6 text-base text-blue-700 hover:bg-blue-100">
                <Link href="/symptom-checker">
                  <Stethoscope className="h-5 w-5" />
                  {t("Check symptoms", "लक्षण जांचें")}
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm leading-6 text-gray-500">
              {t(
                "For awareness and preliminary screening only. NephroCare does not replace medical diagnosis or treatment.",
                "केवल जागरूकता और प्रारंभिक स्क्रीनिंग के लिए। नेफ्रोकेयर चिकित्सकीय निदान या उपचार का विकल्प नहीं है।"
              )}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("Assessment", "मूल्यांकन")}</p>
                <h2 className="text-xl font-semibold text-gray-900">{t("What you may need", "आपको क्या चाहिए")}</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-between gap-4"><span className="text-gray-700">{t("Health history", "स्वास्थ्य इतिहास")}</span><span className="font-medium text-blue-700">{t("Required", "आवश्यक")}</span></li>
              <li className="flex items-center justify-between gap-4"><span className="text-gray-700">{t("Blood and urine values", "रक्त और मूत्र मान")}</span><span className="font-medium text-blue-700">{t("Recommended", "अनुशंसित")}</span></li>
              <li className="flex items-center justify-between gap-4"><span className="text-gray-700">{t("Current symptoms", "वर्तमान लक्षण")}</span><span className="font-medium text-gray-500">{t("Optional", "वैकल्पिक")}</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="tools-heading">
        <div className="mb-6 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase text-blue-700">{t("NephroCare tools", "नेफ्रोकेयर उपकरण")}</p>
          <h2 id="tools-heading" className="text-3xl font-bold text-gray-900">{t("Start with what you need today", "आज अपनी आवश्यकता से शुरुआत करें")}</h2>
          <p className="mt-3 text-gray-600">{t("Each section is designed for a specific kidney-health task, without unnecessary steps.", "हर अनुभाग एक विशेष किडनी स्वास्थ्य कार्य के लिए बनाया गया है, बिना अनावश्यक चरणों के।")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.href} className="medical-card flex h-full flex-col border-blue-100">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{t(tool.title[0], tool.title[1])}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="mb-6 flex-1 leading-7 text-gray-600">{t(tool.copy[0], tool.copy[1])}</p>
                  <Link href={tool.href} className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800">
                    {t("Open tool", "उपकरण खोलें")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white px-6 py-8 md:px-10 md:py-10" aria-labelledby="steps-heading">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-blue-700">{t("How it works", "यह कैसे काम करता है")}</p>
            <h2 id="steps-heading" className="text-3xl font-bold text-gray-900">{t("A straightforward screening process", "एक सरल स्क्रीनिंग प्रक्रिया")}</h2>
            <p className="mt-4 leading-7 text-gray-600">{t("The assessment is designed to be completed with information from a recent medical report.", "मूल्यांकन को हाल की मेडिकल रिपोर्ट की जानकारी के साथ पूरा करने के लिए बनाया गया है।")}</p>
          </div>
          <div className="divide-y divide-gray-200">
            {steps.map((step) => (
              <div key={step.number} className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[3rem_1fr]">
                <span className="text-lg font-bold text-blue-600">{step.number}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{t(step.title[0], step.title[1])}</h3>
                  <p className="mt-1 leading-6 text-gray-600">{t(step.copy[0], step.copy[1])}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-blue-100">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ChartLine className="h-6 w-6" />
            </div>
            <CardTitle>{t("Clear result context", "स्पष्ट परिणाम संदर्भ")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-7 text-gray-600">{t("Results include the estimated risk level, the information entered, and an explanation of the factors that influenced the estimate.", "परिणाम में अनुमानित जोखिम स्तर, दर्ज की गई जानकारी और अनुमान को प्रभावित करने वाले कारकों की व्याख्या शामिल है।")}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Utensils className="h-6 w-6" />
            </div>
            <CardTitle>{t("Practical diet guidance", "व्यावहारिक आहार मार्गदर्शन")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-7 text-gray-600">{t("Diet suggestions are based on the assessment inputs and are presented as general guidance to discuss with a qualified professional.", "आहार सुझाव मूल्यांकन की जानकारी पर आधारित सामान्य मार्गदर्शन हैं, जिन पर योग्य विशेषज्ञ से चर्चा की जानी चाहिए।")}</p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900">{t("Ready to review your kidney-health information?", "अपनी किडनी स्वास्थ्य जानकारी की समीक्षा के लिए तैयार हैं?")}</h2>
            <p className="mt-2 text-gray-600">{t("The assessment usually takes only a few minutes when your report values are ready.", "रिपोर्ट के मान तैयार होने पर मूल्यांकन में सामान्यतः कुछ ही मिनट लगते हैं।")}</p>
          </div>
          <Button asChild size="lg" className="h-12 shrink-0 px-6">
            <Link href="/diagnosis">{t("Begin assessment", "मूल्यांकन शुरू करें")}<ArrowRight className="h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
